const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const dataController = require('./controllers/dataController');
const sessionController = require('./controllers/sessionController');
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
    cb(null, path.join(__dirname, `./uploads/${session_id}`));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.get('/', sessionController.setCookie, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

//CREATE DIRECTORY SYNC
app.post('/check-directory', (req, res) => {
  const { session_id } = req.cookies;
  const { filePath } = req.body;
  const directoryPath = path.join(__dirname, `uploads/${session_id}`, filePath);
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

//SAVE UPLOADED FILE TO ./UPLOADS
app.post('/upload', 
  upload.fields([{name: 'files'}, {name: 'filePath'}]), 
  (req, res) => { return res.status(201).send('file uploaded'); }
);

//MOVE FILE SYNCHRONOUS
app.post('/move-file', (req, res) => {
  const { filePath, fileName } = req.body;
  const { session_id } = req.cookies;

  const source = path.join(__dirname, `uploads/${session_id}/${fileName}`);
  const dest = path.join(__dirname, `uploads/${session_id}/${filePath}${fileName}`);
  // console.log('*** Move from ', source, '\nto ', dest);

  //COPY FILE
  try {

    //copy file from uploads folder to proper destination
    fs.copyFileSync(source, dest);
  }
  catch {(err) => {
    console.log('error encountered while moving file: ', err);
    return res.status(500).send('move error');
  }}
  //VERIFY COPIED FILE IS IN PLACE
  try {
    // console.log(`*** ${fileName} copied`)
    const stats = fs.statSync(dest);
    if (stats.isFile()) {
      // console.log('*** Verified file exists: ', dest );
    }
  }
  catch { (err) => {
    console.log('*** FILE VERIFICATION FAILED --> DO SOMETHING HERE');
    res.status(500).send('copy fail');
  }}

  return res.status(200).send(`${fileName} copied`);
});

// DELETE FILE SYNCHRONOUS
app.post('/delete-file', (req, res) => {
  const { session_id } = req.cookies;
  const { fileName } = req.body;
  // console.log('*** Delete file ', fileName);

  const source = path.join(__dirname, `./uploads/${session_id}/${fileName}`);

  //DELETE FILE FROM UPLOADS
  try{
    fs.unlinkSync(source);
    // fs.rmdirSync(source)
  }
  catch{ (err) => {
    console.log('error encountered while deleting file:', err);
    res.status(500).send('deletion error');
    }
  }
  //VERIFY FILE DELETION
  try {
    // console.log('*** Verifying file deletion');
    const stats = fs.statSync(source);
    // console.log(`*** ${fileName} still exists: `, stats.isFile);
  }
  catch {(err) => {
    if(err) {
      console.log('*** DELETION VERIFICATION ERROR');
      console.log('error.code: ', err.code);
      console.log('*** File deletion verified');
    }
    console.log('error encountered during file deletion verification: ', err);
    return res.status(500).send('error encountered during file deletion verification');
  }    
  }
  // console.log(`*** ${fileName} deleted`);
  return res.status(200).send(`${fileName} deleted`);
})

// POST to /chart
app.post('/chart', sessionController.startSession, dataController.deleteData, dataController.addFiles, (req, res) => {
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
    message: { err : 'An error occurred' }
  };
  const errorObj = Object.assign({}, defaultError, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log('listening on', PORT));