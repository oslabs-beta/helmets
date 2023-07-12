// import required expression handler utilities
const valuesHandler = require('./handlers/valuesHandler');

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
  checkExpression: ( input ) => {

    // extract the exact string from input value obj
    const value = Object.values(input)[0];

    // iterate through expression handler map, checking if value matches regex
    for (const [key, matchObj] of Object.entries(expressionHandlerMap)) {
      const regex = new RegExp(matchObj.regex);
      if (matchObj.regex.test(value)) {
        return { active: true, handlerID: key } ;
      }
    }
    return { active: false, handlerID: null }
  },

  // invoke respective handler function
  handleExpression: ( handlerID, payload ) => {
    return this[handlerID](payload);
  }

}

module.exports = expressionDirector;