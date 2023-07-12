const { regexOnlyMap } = require('./expressionHandlerMap');

const checkExpression = ( input ) => {

  // extract the exact string from input value obj
  const value = Object.values(input)[0];

  // iterate through expression handler map, checking if value matches regex
  for (const [key, matchObj] of Object.entries(regexOnlyMap)) {
    const regex = new RegExp(matchObj.regex);
    if (matchObj.regex.test(value)) {
      return { active: true, handlerID: key } ;
    }
  }
  return { active: false, handlerID: null }
}


module.exports = { checkExpression };