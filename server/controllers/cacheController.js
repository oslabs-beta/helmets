const cacheController = {};
const redis = require('redis');
const redisClient = redis.createClient();
const redis = require('redis');

// check redis cache for user data, using specific session id and respective data info
cacheController.checkCache = async (req, res, next) => {
  try {
    // check cache for given key (on req.body)
    redisClient.get(req.body.key, (err, data) => {
      // if error, invoke global error handler
      if (err) {
        return next({
          log: `cacheController.checkCache: REDIS ERROR: ${err}`,
          message: { err: 'Error when checking cache' },
        });
      }
      // if data exists in cache, send data to client
      if (data !== null) {
        console.log('cache hit');
        res.locals.cacheData = data;
        return next();
      }
      // if data does not exist in cache, invoke next middleware
      console.log('cache miss');
      return next();
    });
  } catch (err) {
    // invoke global error handler with custom error obj for separate server and client messages
    return next({
      log: `cacheController.checkCache: MIDDLEWARE ERROR: ${err}`,
      message: { err: 'Error when checking cache' },
    });
  }
}