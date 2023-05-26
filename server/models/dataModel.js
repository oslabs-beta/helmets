const mongoose = require('mongoose');
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI

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
  source: {
    type: Schema.Types.ObjectId, 
    ref: 'DataModel',
    default: null
  },
  values: {
    type: Schema.Types.ObjectId, 
    ref: 'DataModel',
    default: null
  },
  fileContent: {type: Object, required:true},
  filePath:{ type: String, required: true},
  session_id: {type: String, required: true},
  timeRun: {type: Date, default: () => Date.now()}
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

const sessionSchema = new Schema({
  cookieId: { type: String, required: true, unique: true },
  createdAt: { type: Date, expires: 3600, default: Date.now }
});

const SessionModel = mongoose.model('SessionModel', sessionSchema);

module.exports = {
  DataModel,
  PathModel,
  SessionModel
};