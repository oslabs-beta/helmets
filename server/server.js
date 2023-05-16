const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const multer = require('multer');
const fs = require('fs');

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

//CREATE DIRECTORY SYNC
app.post('/check-directory', (req, res) => {

  const { filePath } = req.body;
  const directoryPath = path.join(__dirname, 'uploads', filePath);
  console.log(`*** Check-Directory: ${filePath}`);
  
  //CHECK IF FOLDER ALREADY EXISTS
  try {
    const stats = fs.statSync(directoryPath);
    if (stats.isDirectory()) {
      console.log('DIRECTORY EXISTS: ', filePath );
    }
  } 
  //FOLDER CHECK FAILED SO MAKE A FOLDER
  catch (err) {
    if (err.code === 'ENOENT') {
      //CREATE DIRECTORY
      try {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`*** Directory created: ${directoryPath}`);
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
          console.log(`*** Verified ${directoryPath} has been successfully created`)
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

  const source = path.join(__dirname, `uploads/${fileName}`);
  const dest = path.join(__dirname, `uploads/${filePath}${fileName}`);
  console.log('*** Move from ', source, ' to ', dest);

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
    console.log(`*** ${fileName} copied`)
    const stats = fs.statSync(dest);
    if (stats.isFile()) {
      console.log('*** Verified file exists: ', dest );
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

  console.log('*** Delete File');
  const { fileName } = req.body;
  console.log('*** Delete file ', fileName);

  const source = path.join(__dirname, `./uploads/${fileName}`);

  //DELETE FILE FROM UPLOADS
  try{
  fs.unlinkSync(source);
  }
  catch{ (err) => {
    console.log('error encountered while deleting file:', err);
    res.status(500).send('deletion error');
    }
  };
  
  return res.status(200).send(`${fileName} deleted`);
})

// POST to /chart
app.post('/chart',
  (req, res) => {
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

// //CREATE DIRECTORY
// app.post('/check-directory', (req, res) => { 
//   const { filePath } = req.body;
//   const directoryPath = path.join(__dirname, 'uploads', filePath);
//   console.log('*** POST received at /check-directory ', directoryPath);
//   // Check if the directory exists. if it does not, create it.
//   fs.stat(directoryPath, (err, stats) => {
//     if (err) {
//       if (err.code === 'ENOENT') {
//         fs.mkdir(directoryPath, { recursive: true }, 
//           (err) => {
//             if (err) {
//               console.log('error encountered while making directory');
//               console.error(err);
//               res.status(500).send('Internal Server Error @ fs.mkdir : ', err);
//             } else {
//               console.log(`*** Directory created: ${directoryPath}`);
//               res.status(201).send('Directory created');
//             }
//           }
//         );
//       } else {
//         // Other error
//         console.error('Error encountered when checking if directory exists', err);
//         res.status(500).send('Internal Server Error');
//       }
//     } else {
//       // Directory exists
//       res.status(200).send('Directory exists');
//     }
//   });
// });


// //MOVE FILE
// app.post('/move-file', (req, res) => {
//   console.log('*** Move File');
//   const { filePath, fileName } = req.body;
//   console.log('*** Move file ', fileName, ' to ', filePath);
//   const source = path.join(__dirname, `uploads/${fileName}`);
//   const dest = path.join(__dirname, `uploads/${filePath}${fileName}`);
//   //copy file from uploads folder to proper destination
//   fs.copyFileSync(
//     source, 
//     dest, 
//     (err) => {
//       console.log(`*** copying file from ${source} to ${dest}`);
//       if(err) {
//         console.log('err encountered while copying file: ', err)
//         res.status(500).send('file copy error');
//       }
//       else {
//         console.log(`${fileName} copied successfully`);
//         res.status(200).send('file copied successfully');
//       }
//     }
//   );
// });

//DELETE FILE
// app.post('/delete-file', (req, res) => {
//   console.log('*** Delete File');
//   const { fileName } = req.body;
//   console.log('*** Delete file ', fileName);
//   const source = path.join(__dirname, `./uploads/${fileName}`);
//   //Delete original file
//   fs.unlink(
//     source, 
//     (err) => {
//       if(err) {
//         console.log('error encountered while deleting file: ', err);
//         res.status(500).send('deletion failed')
//       }
//     }
//   );
// })