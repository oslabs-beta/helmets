const { v4: uuidv4 } = require('uuid');
const models = require('../models/dataModel');

const cookieController = {};

cookieController.setCookie = async (req, res, next) => {
  try {
    const cookie = req.cookies.session_id;
    let session;
    // if cookie exists, is session still valid?
    if (cookie) {
      session = await models.SessionModel.findOne({cookieId: cookie});
    }
    // if cookie doesnt exist or session is expired
    // generate new cookie and start session
    if (!cookie || !session) {
      const session_id = uuidv4();
      // maxAge?
      const options = {
        httpOnly: true,
        secure: true,
        path: '/'
      }
      res.cookie('session_id', session_id, options);
      // add session to db
      await models.SessionModel.create({cookieId: session_id});
    }
  } catch (err) {
    next({
      log: `Error in cookieController.setCookie: ${err}`,
      message: { err: 'Error setting cookie' },
    });
  }
  next();
}

module.exports = cookieController;