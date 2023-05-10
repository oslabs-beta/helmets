const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const multer = require('multer');

const models = require('./models/dataModel');
const dataController = require('./controllers/dataController');

app.use(express.json());

const cors = require('cors');
app.use(cors());
const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};
app.use(allowCrossDomain);

const upload = multer({
  dest: './uploads'
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// helmets-specific routes
// POST to /chart
// *** NOTE: added the multer middleware that is seen below with upload.fields() and above at line2 22-24. must install multer with 'npm i multer'. Multer adds a body object and a file or files object to the request object.  more multer details here: https://www.npmjs.com/package/multer
app.post('/chart', upload.fields([{name: 'files'}]), dataController.addFiles, (req, res) => {
  res.status(200).json(res.locals.responseData)
});

// GET to /chart
app.get('/chart', dataController.getTemplate, (req, res) => {
  res.status(200).json(res.locals.responseData)
});

// GET to /path
app.get('/path', dataController.getPath, (req, res) => {
  res.status(200).json(res.locals.responseData)
});

// unknown route handler 
app.use((req, res)=> {
  res.status(404).send('Invalid request')
});

// global error handler
app.use((err, req, res) => {
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err : 'An error occurred' }
  };
  const errorObj = Object.assign({}, defaultError, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log('listening on', PORT));