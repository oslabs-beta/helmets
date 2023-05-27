const path = require('path');
const fs = require('fs');

const fileController = {};

//CREATE DIRECTORIES TO MATCH SOURCE
fileController.checkServerFolderStructure =  (req, res, next) => {

  // store file name and file path in res.locals for easier access
  const { filePath } = req.body;
  res.locals.filePath = filePath;

  const fileName = req.files.files[0].originalname;
  res.locals.fileName = fileName;

  console.log('*** fileController.checkServerFolderStructure invoked');
  
  const directoryPath = path.resolve(__dirname, '../uploads', filePath);
  console.log(`*** Check-Directory: ${filePath}`);
  
  //CHECK IF FOLDER ALREADY EXISTS
  try {
    const stats = fs.statSync(directoryPath);
    if (stats.isDirectory()) {
      console.log('*** Directory already exists: ', filePath );
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
        return next();
      }
      //VERIFY DIRECTORY
      try {
        const stats2 = fs.statSync(directoryPath);
        if (stats2.isDirectory()) {
          console.log(`*** Verified ${directoryPath} has been successfully created`)
        }
      } catch (err) {
        console.log(`${directoryPath} not found. *** DO SOMETHING HERE ***`);
        return next(err);
      }
    } 
    else {
      // OTHER ERROR
      console.error('Error encountered when checking if directory exists', err);
      res.status(500).send('Internal Server Error');
    }
  }

  return next();

};

//MOVE FILE TO NEW DIRECTORY
fileController.moveFile = (req, res, next) => {

  console.log('*** MoveFile invoked');

  const filePath = res.locals.filePath;
  const fileName = res.locals.fileName;

  const source = path.resolve(__dirname, `../uploads/${fileName}`);
  const dest = path.resolve(__dirname, `../uploads/${filePath}${fileName}`);

  //COPY FILE
  try {
    //copy file from uploads folder to proper destination
    fs.copyFileSync(source, dest);
  }
  catch {(err) => {
    return next(err);
  }}
  //VERIFY COPIED FILE IS IN PLACE
  try {
    const stats = fs.statSync(dest);
  }
  catch { (err) => {
    return next(err);
  }}

  return next();
};

// DELETE FILE SYNCHRONOUS
fileController.deleteFile = (req, res, next) => {

  const fileName = res.locals.fileName;

  const source = path.resolve(__dirname, `../uploads/${fileName}`);

  //DELETE FILE FROM UPLOADS
  try{
  fs.unlinkSync(source);
  }
  catch{ (err) => {
    return next(err);
    }
  }
  //VERIFY FILE DELETION
  try {
    const stats = fs.statSync(source);
  }
  catch {(err) => {
    return next(err);
  }    
  }
  
  console.log(`*** ${fileName} deleted`);
  return next();
};

module.exports = fileController;