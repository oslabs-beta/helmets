const { v4: uuidv4 } = require('uuid');
const Session = require('../models/sessionModel');

const cookieController = {};

cookieController.setCookie = async (req, res, next) => {
  try {
    const cookie = req.cookies.session_id;
    // check for cookie in req headers
    if (!cookie) {
      // if no cookie -> generate session cookie
      const session_id = uuidv4();
      // maxAge?
      const options = {
        httpOnly: true,
        secure: true,
        path: '/'
      }
      res.cookie('session_id', session_id, options);
      // add session to db
      const doc = await Session.create({cookieId: session_id});
      console.log(doc)
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