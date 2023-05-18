const models = require('../models/dataModel');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const parser = require('../_parser/manual_parser');
const { ADDRCONFIG } = require('dns');

const sampleChartPath =
  '../../helm-chart-sample/charts/backend/templates/configmap-appsettings.yaml';

const dataController = {};

// once new file is loaded, clear mongoDB
dataController.deleteData = async (req, res, next) => {
  try {
    await models.DataModel.deleteMany({});
    next();
  } catch (err) {
    next({
      log: `Error in dataController.deleteData: ${err}`,
      message: { err: 'Error deleting all data from MongoDB' },
    });
  }
};

//on initial load of chart folder
dataController.addFiles = async (req, res, next) => {
  // helper function to actually add the file
  const saveFile = async (filePath, sourceFile, valuesFile) => {
    console.log('filePath in SaveFile is ', filePath);
    // const relative_path = path.join(__dirname, `../uploads/${filePath}`);
    const relative_path = filePath;
    try {
      const file = {};
      // fs.readFileSync() and pass output to parser
      // console.log('attempting to add file');
      const yaml = fs.readFileSync(relative_path, 'utf-8');
      // console.log('yaml recieved: ', yaml);
      // set fileContent to parser output
      file.fileContent = parser(yaml);
      // set name, type, source, values (corresponding values file)
      file.name = path.basename(relative_path);
      // type (comparing to file name)
      if (/[Cc]hart\.yaml$/.test(file.name)) file.type = 'metadata';
      else if (/[Vv]alues\.yaml$/.test(file.name)) file.type = 'values';
      else file.type = 'template/manifest';
      // source
      file.source = sourceFile;
      // values
      file.values = valuesFile;
      // add doc to db
      // console.log('file to convert to doc is: ', file);
      let doc = await models.DataModel.create(file);
      // console.log('doc pre-json is ', doc);
      doc = doc.toJSON();
      console.log('DOC ADDED TO DB:', doc);
      return doc;
    } catch (err) {
      return next({
        log: `Error in dataController.addFiles.saveFile: ${err}`,
        message: { err: 'Error adding files to database' },
      });
    }
  };

  // check if thing is a file or a folder
  const checkType = async (file_path, sourceFile = null, valuesFile = null) => {
    try {
      console.log('file we are trying to read: ', file_path);
      const relative_path = file_path;
      console.log('path: ', relative_path);
      const stats = await fs.promises.stat(relative_path);
      // console.log('stats is: ', stats);
      if (stats.isDirectory()) {
        const filesArr = await fs.promises.readdir(relative_path);

        const files = new Set(filesArr);

        // check for Chart.yaml and Values.yaml to add to db first
        for (const file of files) {
          console.log('file is ', file);
          const innerFilePath = `${relative_path}/${file}`;
          console.log('innerFilePath is ', innerFilePath);
          if (/[Cc]hart\.yaml$/.test(file)) {
            sourceFile = await saveFile(innerFilePath, sourceFile, valuesFile);
            if (!res.locals.topChart) res.locals.topChart = sourceFile;
            files.delete(file);
          } else if (/[Vv]alues\.yaml$/.test(file)) {
            valuesFile = await saveFile(innerFilePath, sourceFile, valuesFile);
            if (!res.locals.topValues) res.locals.topValues = valuesFile;
            files.delete(file);
          }
        }

        // save other .yaml files on same level
        for (const file of files) {
          const innerFilePath = `${relative_path}/${file}`;
          console.log('check 2, file is: ', file);
          if (
            !/[Cc]hart\.yaml$/.test(file) &&
            !/[Vv]alues\.yaml$/.test(file) &&
            /\.yaml$/i.test(file)
          ) {
            console.log("it's a yaml, calling saveFile");
            await saveFile(innerFilePath, sourceFile, valuesFile);
            files.delete(file);
          }
        }
        // recurse through directories
        for (const file of files) {
          const innerFilePath = `${relative_path}/${file}`;
          console.log('inner file we are trying to read: ', file);
          if (file.startsWith('.')) continue;
          const fileStats = await fs.promises.stat(innerFilePath);
          if (fileStats.isDirectory()) {
            await checkType(innerFilePath, sourceFile, valuesFile);
            files.delete(file);
          }
        }
      } else {
        console.log(file_path, 'is a file, so adding it');
        const fileName = path.basename(file_path);
        if (
          !/[Cc]hart\.yaml$/.test(fileName) &&
          !/[Vv]alues\.yaml$/.test(fileName) &&
          /\.yaml$/i.test(fileName)
        ) {
          await saveFile(file_path, sourceFile, valuesFile);
          files.delete(file);
        }
      }
    } catch (err) {
      console.log('error!');
      return next({
        log: `Error in dataController.addFiles.checkType: ${err}`,
        message: { err: 'Error adding files to database' },
      });
    }
  };

  // parse thru the uploads folder
  try {
    const files = await fs.promises.readdir(path.join(__dirname, '../uploads'));
    console.log('FILES ARRAY: ', files);
    for (const dir of files) {
      console.log('dir ', dir);
      const dirPath = path.join(__dirname, '../uploads', dir);
      await checkType(dirPath);
    }
    return next();
  } catch (err) {
    return next({
      log: `Error in dataController.addFiles: ${err}`,
      message: { err: 'Error adding files to database' },
    });
  }
};
// if folder -> fs.openDir() to open folder and recurse passing in first file/folder in dir
// if file -> create data model and add to db

//when selecting from dropdown
dataController.getTemplate = async () => {
  // retrieve specified file from DB
  const fileName = req.body.fileName;
  try {
    const data = await models.DataModel.findOne({ name: fileName });
    res.locals.responseData = data;
    return next();
  } catch (err) {
    return next({
      log: `Error in dataController.getTemplate: ${err}`,
      message: { err: 'Error getting template from database' },
    });
  }
};

//when selecting value on manifest or template
dataController.getPath = (req, res, next) => {
  next();
};

module.exports = dataController;
