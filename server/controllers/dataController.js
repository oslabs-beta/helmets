const models = require('../models/dataModel');
const fs = require('fs');
const path = require('path');
const parser = require('../utils/manual_parser');
const flattenObject = require('../utils/flattenDataModel');
const expressionDirector = require('../utils/expressionDirector');


const dataController = {};

// once new file is loaded, clear mongoDB
dataController.deleteData = async (req, res, next) => {
  try {
    const { session_id } = req.cookies;
    await models.DataModel.deleteMany({ session_id: session_id });
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
  res.locals.filePathsArray = [];
  const { session_id } = req.cookies;
  console.log('REQ COOKIES', req.cookies)

  // helper function to actually add the file
  const saveFile = async (filePath, sourceFile, valuesFile) => {
    // console.log('filePath in SaveFile is ', filePath);
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

      // add file path
      // escape special chars in session_id (-)
      const escapedSessionId = session_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`uploads\/${escapedSessionId}\/(.*)`);
      // const regex = /\/uploads\/(.*)/;
      const match = regex.exec(relative_path);
      const pathAfterUploads = match[1];
      file.filePath = pathAfterUploads;
      file.session_id = session_id;
      // save on locals so front-end can retrieve it
      res.locals.filePathsArray.push(pathAfterUploads);
      // add doc to db
      // console.log('file to convert to doc is: ', file);
      let doc = await models.DataModel.create(file);
      // console.log('doc pre-json is ', doc);
      doc = doc.toJSON();
      // console.log('DOC ADDED TO DB:', doc);
      return doc;
    } catch (err) {
      return next({
        log: `Error in dataController.addFiles.saveFile: ${err}`,
        message: { err: `Error adding files to database addFiles.saveFile` },
      });
    }
  };

  // check if thing is a file or a folder
  const checkType = async (file_path, sourceFile = null, valuesFile = null) => {
    try {
      // console.log('file we are trying to read: ', file_path);
      const relative_path = file_path;
      // console.log('path: ', relative_path);
      const stats = await fs.promises.stat(relative_path);
      // console.log('stats is: ', stats);
      if (stats.isDirectory()) {
        const filesArr = await fs.promises.readdir(relative_path);

        const files = new Set(filesArr);

        // check for Chart.yaml and Values.yaml to add to db first
        for (const file of files) {
          // console.log('file is ', file);
          const innerFilePath = `${relative_path}/${file}`;
          // console.log('innerFilePath is ', innerFilePath);
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
          // console.log('check 2, file is: ', file);
          if (
            !/[Cc]hart\.yaml$/.test(file) &&
            !/[Vv]alues\.yaml$/.test(file) &&
            /\.yaml$/i.test(file)
          ) {
            // console.log("it's a yaml, calling saveFile");
            await saveFile(innerFilePath, sourceFile, valuesFile);
            files.delete(file);
          }
        }
        // recurse through directories
        for (const file of files) {
          const innerFilePath = `${relative_path}/${file}`;
          // console.log('inner file we are trying to read: ', file);
          if (file.startsWith('.')) continue;
          const fileStats = await fs.promises.stat(innerFilePath);
          if (fileStats.isDirectory()) {
            await checkType(innerFilePath, sourceFile, valuesFile);
            files.delete(file);
          }
        }
      } else {
        // console.log(file_path, 'is a file, so adding it');
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
      return next({
        log: `Error in dataController.addFiles.checkType: ${err}`,
        message: { err: 'Error adding files to database addFiles.checkType' },
      });
    }
  };

  // parse thru the uploads folder
  try {
    const files = await fs.promises.readdir(path.join(__dirname, `../uploads/${session_id}`));
    console.log('chart path', path.join(__dirname, `../uploads/${session_id}`));
    console.log('FILES ARRAY: ', files);
    for (const dir of files) {
      // console.log('dir ', dir);
      const dirPath = path.join(__dirname, `../uploads/${session_id}`, dir);
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
dataController.getTemplate = async (req, res, next) => {
  // retrieve specified file from DB 
  const { filePath } = req.body;
  console.log('filePath is: ', filePath);
  const { session_id } = req.cookies;
  // console.log("request to getTemplate, filePath is:", filePath);
  try {
    const data = await models.DataModel.findOne({filePath: filePath, session_id: session_id});

    console.log(`data retrieved: ${data}`);
    
    const createdDataObj = { 
      fileName: data.fileName,
      filePath: data.filePath,
      type: data.type,
      nodeID: null,
      flattenedDataArray: flattenObject(data.filePath, data.fileContent)
     }

    res.locals.responseData = createdDataObj;
    return next();
  } catch (err) {
    return next({
      log: `Error in dataController.getTemplate: ${err}`,
      message: { err: 'Error getting template from database' },
    });
  }
};

//when selecting value on manifest or template
dataController.deprecatedGetPath = async (req, res, next) => {
  res.locals.pathArray = [];

  // from front end, receive:
    // target value
    // target manifest/template
  const { targetValue, targetPath } = req.body;
  const doc = await models.DataModel.findOne({filePath: targetPath});
  res.locals.pathArray.push(doc);

  const checkValues = (valObj, targetVal) => {
    // check if its arr or obj 1st
    if (Array.isArray(valObj)){
      for (const el of valObj) {
        if (Array.isArray(el) || typeof el === "object") {
          // recurse again, passing in el & target
          if (checkValues(el, targetVal)) {
            return true;
          }
        } else if (el === targetVal) {
          return true;
        }
      }
    } else {
      for (const key in valObj) {
        if (Array.isArray(valObj[key]) || typeof valObj[key] === "object") {
          // recurse again, passing in el & target
          if (checkValues(valObj[key], targetVal)) {
            return true;
          }
        } else if ( valObj[key] === targetVal ) {
          return true;
        }
      }
    }
    return false;
  }


  const navigateFile = async (currentFile) => {
    // if source and values are null, we are at top level
    // reverse pathArray so that 0 is the source values file, and n is the target template/etc
    if (!currentFile.source && !currentFile.values) return res.locals.pathArray.reverse();
    // check target file values file, see if it contains target value
    const valDoc = await models.DataModel.findOne({_id: currentFile.values})
    if (checkValues(valDoc.fileContent, targetValue)) {
      // if yes, add to pathArray
      res.locals.pathArray.push(valDoc);
    }  
    // recurse into source file values, if it exists
    const sourceDoc = await models.DataModel.findOne({_id: currentFile.source});
    navigateFile(sourceDoc);
  }

  navigateFile(doc);
  next();
};

/********************************************************** getPath *******************************************************/
/*
Used to retrieve data flow path for a given value at given template
Currently configured to handle any detected {{ }} Go expression with a .Values. reference
*/

dataController.getPath = async (req, res, next) => {
  // get initial values from client request, retrieve corresponding template from DB, create path arr
  const { targetVal, targetPath, selectedNodeID, handlerID } = req.body;
  const { session_id } = req.cookies;
  const dataFlowPath = [];
  let keyPath = [];

  // logic for building the path, invokes helpers, returns nothing but updates dataFlowPath
  const buildPath = async (doc, valuesDoc, nestedChartKeyPath = [...keyPath]) => {
    if (valuesDoc) {
      // check to see if inital key path work in the values file. 
      // if no, need to add key for each chart and test that
      if (!traceKeyPath(valuesDoc, valuesDoc.fileContent, keyPath)) {
        let currentChart = doc;
        // this loop is for checking additional variants of the keyPath, 
        // adding on the name of each chart as a key (for detecting nested)
        while (currentChart.source !== null) {
          // re-invoke traceKeyPath passing in updated keyPath, w/ name unshifted 
          const sourceDoc = await models.DataModel.findOne({_id: currentChart.source, session_id: session_id})
          const chartName = sourceDoc.fileContent.name;
          if (chartName){
            nestedChartKeyPath.unshift(chartName);
            traceKeyPath(valuesDoc, valuesDoc.fileContent, nestedChartKeyPath);
          }
          currentChart = sourceDoc;
        }
      }

      // next step is to iterate upwards regardless of a successful path match at first file, 
      // because the user may have additional value files in the chart
      let nextValues = await models.DataModel.findOne({_id: valuesDoc.values, session_id: session_id});
      while (nextValues) {
        await buildPath(doc, nextValues);
        const _nextValues = await models.DataModel.findOne({_id: nextValues.values, session_id: session_id});
        nextValues = _nextValues ? _nextValues : undefined;
      }
    }
  }
  
  // helperFn that will check a given values.yaml file to see if it contains input keyPath
  // iterates through each key in object, returns false if any key in keyPath array is absent
  const traceKeyPath = (valuesDoc, fileContent, localKeyPath = keyPath) => {
    let objID = '';
    let validPath = false;
    // check to see if dataFlowPath exists in valuesDoc
    // for (const key of localKeyPath) {
    //   if (current && typeof current === 'object' && key in current) {
    //     current = current[key];
    //   } else {
    //     validPath = false;
    //   }
    //   lineNum++;
    // }
    const flatObj = flattenObject(valuesDoc.filePath, fileContent);
    loop1:
      for (const key of localKeyPath) { 
        for (let i = 0; i < flatObj.length; i ++) {
          if (flatObj[i].value[key]) {
            validPath = true;
            objID = flatObj[i].nodeID;
            break loop1;
          }
        }
      }
    if (validPath) {
      // instead push a new dataFlowObj onto path
      const createdDataFlowObj = { 
        fileName: valuesDoc.fileName,
        filePath: valuesDoc.filePath,
        type: valuesDoc.type,
        nodeID: objID,
        flattenedDataArray: flatObj
       }
      dataFlowPath.push(createdDataFlowObj);
    }
    return validPath;
  }

  // try/catch block to invoke helper functions to build keyPath
  // keyPath is based on a regex match on the selected template value
  // includes specific error handling for nonexistent template & values files
  // generic error handling for any additional errors
  try {
    const selectedDoc = await models.DataModel.findOne({filePath: targetPath, session_id: session_id});
    
    if (!selectedDoc) {
      return next({
        log: `Error in dataController.getPath: selectedDoc found in DB`,
        message: { err: 'Error: selected template does not exist in DB' },
      });
    }

    const createdDataFlowObj = { 
      fileName: selectedDoc.fileName,
      filePath: selectedDoc.filePath,
      type: selectedDoc.type,
      nodeID: selectedNodeID,
      flattenedDataArray: flattenObject(selectedDoc.filePath, selectedDoc.fileContent)
    }

    dataFlowPath.push(createdDataFlowObj);

    // invoke expressionDirector to invoke appropriate expression handler
    expressionDirector.handleExpression(targetVal)

    // const valRegex = /\.Values\.(\S*)/;
    // const match = targetVal.match(valRegex);
    // keyPath = [...match[1].split('.')];
    const docValues = await models.DataModel.findOne({_id: selectedDoc.values, session_id: session_id});
    
    if (docValues) {
      // await buildPath(selectedDoc, docValues); 
        // replaced by expressionHandler, we need returned a full dataFlowPath

      const returnedDataFlowPath = await expressionHandler.handleExpression(
        handlerID,
        payload = {
          selectedDoc, 
          docValues,
          targetVal,
          initialDataFlowPath : dataFlowPath
        }
      ); 

      res.locals.dataFlowPath = dataFlowPath.reverse();
      return next();
    } else {
      return next({
        log: `Error in dataController.getPath: no values file found in DB`,
        message: { err: 'Error: selected template does not have a values file' },
      });
    }

  } catch (err) {
    return next({
      log: `Error in dataController.getPath: ${err}`,
      message: { err: 'Error getting path for selected template/value' },
    });
  }
};

module.exports = dataController;
