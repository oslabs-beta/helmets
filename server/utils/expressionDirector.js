// import required expression handler utilities
const flattenObject = require('./flattenObject');
const valuesHandler = require('./handlers/valuesHandler');
const { checkExpression } = require('./helpers');

/*
goExpressionMap maps the possible go expressions that appear in YAML files to
their respective function handlers
*/
const expressionHandlerMap = {
  val: {
    handler: valuesHandler,
    regex: /\.Values\.(\S*)/
  }
}

/*
checkExpressionDirector takes in a key/value pair representing a line in YAML
  evaluates the key or value, identify if contain supported go expressions
  if match is found, return an object setting node to active and handlerID 
  to the respective handler function
*/
const expressionDirector = {
  // identity and assign expression handler from expression handler map
  checkExpression: checkExpression,

  // invoke respective handler function
  handleExpression: ( handlerID, payload ) => {
    console.log('handlerID is: ', handlerID);
    return expressionHandlerMap[handlerID].handler(payload, flattenObject);
  }

}

module.exports = expressionDirector;