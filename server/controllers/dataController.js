const Data = require('../models/dataModel');
const Path = require('../models/dataModel');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const sampleChartPath = '../../helm-chart-sample/charts/backend/templates/configmap-appsettings.yaml';

const dataController = {};

//on initial load of chart folder
dataController.addFiles = async (req, res, next) => {
  try{
    const filePath = req.body;
    console.log('file: ', req.files);
    console.log('file path: ', filePath.filePath);
  } catch (e) {
    console.log('ERROR: ', e);
  }
  // try {
  //   console.log(fs.readFileSync(path.join(__dirname, sampleChartPath),'utf8'));
  //   // const output = await yaml.load(fs.readFileSync(path.join(__dirname, sampleChartPath),'utf8'));
  //   // console.log('OUTPUT', output);
  // } catch (e) {
  //   console.log('ERROR: ', e);
  // }
  next();
}

//when selecting from dropdown
dataController.getTemplate = () => {

}

//when selecting value on manifest or template
dataController.getPath = () => {

}

module.exports = dataController;
