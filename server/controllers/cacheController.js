const redis = require('redis');
const redisClient = redis.createClient();

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
    const cacheKey = `${req.cookies.session_id}_${req.body.chartDirectory}`;
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
      res.locals.cacheData = null;
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
    
    // set cache with given key (on req.body) and value (on res.locals)
    const { topValues, topChart, filePathsArray } = res.locals;
    // removed JSON.stringify from value
    const cacheKey = `${req.cookies.session_id}_${req.body.chartDirectory}`;
    console.log('attempting to set cache for: ', cacheKey);
    await redisClient.set(cacheKey, JSON.stringify({
      topValues,
      topChart,
      filePathsArray
    }));
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