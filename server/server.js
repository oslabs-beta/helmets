const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const dataController = require('./controllers/dataController');
const sessionController = require('./controllers/sessionController');
const cacheController = require('./controllers/cacheController');
const fileController = require('./controllers/fileController');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const cors = require('cors');


app.use(cors());
const allowCrossDomain = function (req, res, next) {
  const allowedOrigins = ['http://localhost:8080'];
  const { origin } = req.headers;

  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', true);
  }

  next();
};
app.use(allowCrossDomain);

// set up multer to assign save location for uploaded file and file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { session_id } = req.cookies;
    const destinationPath = path.join(__dirname, `./uploads/${session_id}`);
    fs.mkdirSync(destinationPath, { recursive: true });
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// serve index.html and establish session cookies
app.get('/', sessionController.setCookie, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// route to check redis cache for user data, using specific session id and respective data info
app.post('/check-cache', cacheController.checkCache, (req, res) => {
  res.status(200).json(res.locals.cacheData);
});

//CREATE DIRECTORY SYNC
app.post('/check-directory', (req, res) => {

  const { filePath } = req.body;
  const directoryPath = path.join(__dirname, 'uploads', filePath);
  // console.log(`*** Check-Directory: ${filePath}`);
  
  //CHECK IF FOLDER ALREADY EXISTS
  try {
    const stats = fs.statSync(directoryPath);
    if (stats.isDirectory()) {
      // console.log('*** Directory already exists: ', filePath );
    }
  } 
  //FOLDER CHECK FAILED SO MAKE A FOLDER
  catch (err) {
    if (err.code === 'ENOENT') {
      //CREATE DIRECTORY
      try {
        fs.mkdirSync(directoryPath, { recursive: true });
        // console.log(`*** Directory created: ${directoryPath}`);
      } 
      catch (err) {
        console.error('Error encountered while making directory');
        console.error(err);
        return res.status(500).send('Internal Server Error @ fs.mkdirSync');
      }
      //VERIFY DIRECTORY
      try {
        const stats2 = fs.statSync(directoryPath);
        if (stats2.isDirectory()) {
          // console.log(`*** Verified ${directoryPath} has been successfully created`)
        }
      } catch (err) {
        console.log(`${directoryPath} not found. *** DO SOMETHING HERE ***`)
        return res.status(500).send('folder verify failed');
      }
    } 
    else {
      // Other error
      console.error('Error encountered when checking if directory exists', err);
      res.status(500).send('Internal Server Error');
    }
  }

  return res.status(200).send('server folder structure ready');

});

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
app.post('/chart', sessionController.startSession, dataController.deleteData, 
  dataController.addFiles, fileController.deleteDirectory, cacheController.setCache, (req, res) => {
  res.status(200).json(res.locals);
});

// PUT to /chart
app.put('/chart', cacheController.checkCache, (req, res, next) => {
  if (res.locals.cacheData) {
    // If cache hit, send cached data as response
    const responseData = JSON.parse(res.locals.cacheData).responseData;
    res.status(200).json(responseData);
  } else {
    // If cache miss, continue with the middleware chain
    next();
  }
}, 
dataController.getTemplate, cacheController.setCache, (req, res) => {
  res.status(200).json(res.locals.responseData);
});

// GET to /path
app.put('/path', cacheController.checkCache, (req, res, next) => {
  if (res.locals.cacheData) {
    // If cache hit, send cached data as response
    const responseData = JSON.parse(res.locals.cacheData).dataFlowPath;
    res.status(200).json(responseData);
  } else {
    // If cache miss, continue with the middleware chain
    next();
  }
},
dataController.getPath, cacheController.setCache, (req, res) => {
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
    message: { err : 'An error occurred' }
  };
  const errorObj = Object.assign({}, defaultError, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log('listening on', PORT));