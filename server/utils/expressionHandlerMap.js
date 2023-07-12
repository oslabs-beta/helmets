const valuesHandler = require('./handlers/valuesHandler');

const expressionHandlerMap = {
  val: {
    handler: valuesHandler,
    regex: /\.Values\.(\S*)/
  }
}

const reduceToRegexObjects = (inputMapObj) => {
  const regexObject = {};
  for (const key in inputMapObj) {
    if (inputMapObj.hasOwnProperty(key)) {
      regexObject[key] = { regex: inputMapObj[key].regex };
    }
  }
  console.log('regexObject is: ', regexObject)
  return regexObject;
};

const regexOnlyMap = reduceToRegexObjects(expressionHandlerMap);

module.exports = { expressionHandlerMap, regexOnlyMap };