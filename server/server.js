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

// const upload = multer({
//   dest: './uploads'
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destination = req.body.filePath;

    cb(null, `./uploads/${destination}`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// helmets-specific routes
// POST to /chart
// *** NOTE: added the multer middleware that is seen below with upload.fields() and above at line2 22-24. must install multer with 'npm i multer'. Multer adds a body object and a file or files object to the request object.  more multer details here: https://www.npmjs.com/package/multer
app.post('/chart', upload.fields([{name: 'files'}, {name: 'filePath'}]), dataController.addFiles, (req, res) => {
  res.status(200).json(res.locals.responseData)
});

//checks if the target upload directory exists and creates it if not
app.post('/check-directory', (req, res) => {

  const { filePath } = req.body;
  const directoryPath = path.join(__dirname, 'uploads', filePath);

  // Check if the directory exists. if it does not, create it.
  fs.stat(directoryPath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.mkdir(directoryPath, { recursive: true }, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error @ fs.mkdir : ', err);
          } else {
            console.log(`Created directory: ${directoryPath}`);
            res.send('Directory created successfully');
          }
        });
      } else {
        // Other error
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    } else {
      // Directory exists
      res.send('Directory exists');
    }
  });
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