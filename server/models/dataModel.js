const mongoose = require('mongoose');
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  // options for the connect method to parse the URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // sets the name of the DB that our collections are part of
  dbName: 'helmets'
})
  .then(() => console.log('connected to helmets mongoDB'))
  .catch(err => console.log('error connedting: ', err));

// create schemas and models
const Schema = mongoose.Schema;

const dataModelSchema = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  source: {type: String, required: true},
  values: {
    type: Schema.Types.ObjectId, 
    ref: 'DataModel',
    default: null
  },
  fileContent: {type: Object, required:true}
});

const DataModel = mongoose.model('DataModel', dataModelSchema);

const pathSchema = new Schema({
  pathArray: [{
    parentFileName: String
  }],
  valueName: {type: String, required: true},
  sourceFileName: {type: String, required: true}
});

const PathModel = mongoose.model('PathModel', pathSchema);

module.exports = {
  DataModel,
  PathModel
};