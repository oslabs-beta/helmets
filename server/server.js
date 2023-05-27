const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const models = require('./models/dataModel');
const dataController = require('./controllers/dataController');
const fileController = require('./controllers/filecontroller');

const sample_path_payload = require('./sample_data/sample_path_payload');

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

// set up multer to assign save location for uploaded file and file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, `./uploads`));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

//SERVE HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

//assign multer middleware to a const
const uploadFiles = upload.fields([{name: 'files'}, {name: 'filePath'}]);
//SAVE UPLOADED FILE TO ./UPLOADS
app.post('/upload', 
  uploadFiles,
  fileController.checkServerFolderStructure,
  fileController.moveFile,
  fileController.deleteFile,
  (req, res) => { return res.status(201).send('file uploaded'); }
);

// POST to /chart
app.post('/chart', dataController.deleteData, dataController.addFiles, (req, res) => {
  // console.log('res locals: ', res.locals.topChart);
  res.status(200).json(res.locals);
});

// GET to /chart
app.put('/chart', dataController.getTemplate, (req, res) => {
  res.status(200).json(res.locals.responseData);
});

// GET to /path
app.put('/path', dataController.getPath, (req, res) => {
  res.status(200).json(res.locals.dataFlowPath);
});

// unknown route handler 
app.use((req, res)=> {
  res.status(404).send('Invalid request')
});

// global error handler
app.use((err, req, res, next) => {
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err : err }
  };
  const errorObj = Object.assign({}, defaultError, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log('listening on', PORT));