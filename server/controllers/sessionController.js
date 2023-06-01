const { v4: uuidv4 } = require('uuid');
const models = require('../models/dataModel');

const sessionController = {};

sessionController.setCookie = async (req, res, next) => {
  try {
    // if cookie doesnt exist, create the cookie
    if (!req.cookies.session_id) {
      const session_id = uuidv4();
      const options = {
        httpOnly: true,
        secure: true,
        path: '/'
      }
      res.cookie('session_id', session_id, options);
    }
  } catch (err) {
    next({
      log: `Error in sessionController.setCookie: ${err}`,
      message: { err: 'Error setting cookie' },
    });
  }
  next();
}

sessionController.startSession = async (req, res, next) => {
  try {
    const cookieId = req.cookies.session_id;
    // check if session is still valid?
    const session = await models.SessionModel.findOne({cookieId: cookieId});
    // if session is expired, create new session
    if (!session) {
      await models.SessionModel.create({cookieId: cookieId});
    }
  } catch (err) {
    next({
      log: `Error in sessionController.startSession: ${err}`,
      message: { err: 'Error starting session' },
    });
  }
  next();
}

module.exports = sessionController;