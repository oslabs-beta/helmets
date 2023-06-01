const redis = require('redis');
const REDIS_PWD = process.env.REDIS_PWD;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const redisClient = redis.createClient({
    password: REDIS_PWD,
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});

redisClient.connect();

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.log(`Redis client error: ${err}`);
});


const cacheController = {};
// check redis cache for user data, using specific session id and respective data info
cacheController.checkCache = async (req, res, next) => {
  try {
    
    // check cache for given key (on req.body)
    console.log('req cookies is ', req.cookies);
    const cacheKey = `${req.cookies.session_id}_${req.body.chartData}`;
    console.log('attempting to check cache for: ', cacheKey);
    const data = await redisClient.get(cacheKey);
      // if data exists in cache, send data to client
      if (data !== null) {
        console.log('cache hit');
        res.locals.cacheData = data;
        return next();
      }
      // if data does not exist in cache, invoke next middleware
      console.log('cache miss');
      res.locals.cacheData = { cache:null };
      return next();

  } catch (err) {
    // invoke global error handler with custom error obj for separate server and client messages
    return next({
      log: `cacheController.checkCache: MIDDLEWARE ERROR: ${err}`,
      message: { err: 'Error when checking cache' },
    });
  }
}

cacheController.setCache = async (req, res, next) => {
  try {
    /* 
    using a generic caching middleware that will cache whatever VALID keys are found on res.locals
    specifying array of valid keys
    generating cacheKey based on session_id and specific chartData passed from client
    */
    const validCacheKeys = [
      'topValues', 
      'topChart', 
      'filePathsArray', 
      'cacheData', 
      'dataFlowArray',
      'dataFlowPath',
      'responseData',
    ];

    const cacheObj = {};

    for (const key of validCacheKeys) {
      if (res.locals[key]) {
        cacheObj[key] = res.locals[key];
      }
    }

    // const { topValues, topChart, filePathsArray, cacheData } = res.locals;

    // removed JSON.stringify from value
    const cacheKey = `${req.cookies.session_id}_${req.body.chartData}`;
    console.log('attempting to set cache for: ', cacheKey);
    // console.log('cacheObj is ', cacheObj);
    await redisClient.set(cacheKey, JSON.stringify(cacheObj));
    console.log('cache set');
    return next();
  } catch (err) {
    return next({
      log: `cacheController.setCache: MIDDLEWARE ERROR: ${err}`,
      message: { err: 'Error when setting cache' },
    });
  }
}


module.exports = cacheController;