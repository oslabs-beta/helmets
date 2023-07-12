const expressionDirector = require('./expressionDirector');

const flattenObject = (path, obj) => {
  const output = [];
  let lineNumber = 1;

  const nodeObjectFactory = (nodeID, indent, value, active, handlerID = null) => {  
    return { nodeID, indent, value, active, handlerID }
  }

  const addLineObject = (lineNumber, indent, value) => {
    console.log('adding line object, value is: ', value);

    // invoke checkExpression, passing in value
    const { active, handlerID } = expressionDirector.checkExpression(value);

    console.log(`active is ${active}, handlerID is ${handlerID}`);

    output.push(nodeObjectFactory(
      nodeID = `${path}__${lineNumber}`, 
      indent, 
      value, 
      active,
      handlerID
      ));
  }

  const addCompositeMarker = (value, indent) => {
    output.push(nodeObjectFactory(
      nodeID = `marker`, 
      indent, 
      value,
      active = false,
      handlerID = null
      ));
  }

  const flattenHelper = (current, indent = 0) => {
    if (Array.isArray(current)) {
      addCompositeMarker('[', indent);
      current.forEach((el,i) => {
        if (Array.isArray(el)) {
          // addLineObject(lineNumber, indent, i);
          // lineNumber += 1;
          flattenHelper(el, indent+1);
        } else if (typeof el === 'object' && el !== null) {
          // addLineObject(lineNumber, indent, i);
          // lineNumber += 1;
          flattenHelper(el, indent+1);
        } else {
          addLineObject(lineNumber, indent, el);
          lineNumber += 1;
        }
      });
      addCompositeMarker(']', indent);

    } else if (typeof current === 'object' && current !== null) {
      addCompositeMarker('{', indent);
      for (const key in current) {
        if (Array.isArray(current[key])) {
          addLineObject(lineNumber, indent, key);
          lineNumber += 1;
          flattenHelper(current[key], indent+1);
        } else if (typeof current[key] === 'object' && current[key] !== null) {
          addLineObject(lineNumber, indent, key);
          lineNumber += 1;
          flattenHelper(current[key], indent+1);
        } else {
          addLineObject(lineNumber, indent, {[key]: current[key]});
          lineNumber += 1;
        }
      }
      addCompositeMarker('}', indent);
    } 
  }

  flattenHelper(obj);
  return output;
}

// const output = flattenObject(deploymentDataModel.filePath, deploymentDataModel.fileContents);
// console.log(output);

module.exports = flattenObject;