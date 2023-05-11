// func that takes yaml string (from readfile) as input
const parser = (yaml) => {
  // split yaml into lines w/ string.split("\n")
  const lines = yaml.split("\n");

  // declare empty obj as output
  const jsonObj = {};
  // variable to iterate thru lines
  let i = 0;

  // create contextStack = [outputObj]
  const contextStack = [jsonObj];
	// currentContext = always refer to LAST item in contextStack
	let currentContext = contextStack[contextStack.length - 1];
		// will pop off based on indents 
	// create lastIndent = 0
	let lastIndent = 0;
		// increase current indent WHEN?
			// when we find leading whitespace @ current line

  
  // iterate line by line 
  while (i < lines.length) {
		console.log(i);

    // check our context 1st
    const matchPattern = lines[i].match(/^\s*/);
    const currentLineIndent = matchPattern ? matchPattern[0].length : 0;
    // compare lastIndent (tracking prev index) against currentLineIndent
    // if currentIntent > currentLineIndent
    if (currentLineIndent < lastIndent) {
      // pop items off
      let popCount = ((lastIndent - currentLineIndent)/2);
      // currentContext.pop() num times = (lastIndent - currentLineIndent / 2)
      while (popCount > 0) {
        contextStack.pop();
        --popCount;
        lastIndent -= 2;
      }
      // currentContext = contextStack[length-1]
      currentContext = contextStack[contextStack.length - 1];
    }
        

    // Check for non-value Go Expression
    const trimmedString = lines[i].trim();
    
    if ( trimmedString.startsWith("{{") ) {
      // create key value pair in currentContext, key is stringed, value is EXP
      const keyPair = {[trimmedString]: 'EXP'};
      // pass data to checkType helper function
      checkType(currentContext, keyPair)
      // increment line++
      i++;
    } else {
      // check for spaces :D

      // split line [key, value] = string.split(':')
      let [key, value] = lines[i].split(':');
      key = key.trim();
      value = value.trim();
      // NEW LINE: confirm we have key but no value
      if (key && (value === '' || value === undefined )) {

        // either creating new obj or concatting next line, depending
        // declare variable as first index of next line
        const nextLine = lines[i + 1].trim();
        // check next line, see 
          // if first char === - 
          if (nextLine[0] === '-') {
            // create a new array
            // update currentContext to be array

            // check if currentContext is Array, if so add differently
            if (Array.isArray(currentContext)){
              currentContext.push([]);
              contextStack.push(currentContext[currentContext.length-1]);
              currentContext = contextStack[contextStack.length-1];
              i++;
              lastIndent += 2;

            } else {
              currentContext[key] = [];
              // push the key currentContext onto the stack
              contextStack.push(currentContext[key]);
              // update the currentContext
              currentContext = contextStack[contextStack.length - 1];
              i++;
              lastIndent += 2;
            }
          }
          // if first char === string
          else if (/^[a-zA-Z]/.test(nextLine[0]) || nextLine.startsWith('{{')) {
            // create new obj,
            // set currentOBj to new obj
            // check if currentContext is Array, if so add differently
            if (Array.isArray(currentContext)){
              currentContext.push({[key]: {}});
              contextStack.push(currentContext[currentContext.length-1]);
              currentContext = contextStack[contextStack.length-1];
              i++;
              lastIndent += 2;

            } else {
              
              currentContext[key] = {};
              contextStack.push(currentContext[key]);
              currentContext = contextStack[contextStack.length - 1];
              // then index = next line
              i++;
              lastIndent += 2;
            }
          }
          // if first characters are {{ }}
          // else if (nextLine.startsWith('{{')) {
          //   // set currentObj [key] = nextLine {{ }}
            
          //   currentContext[key] = nextLine;
          //   // increase index by 1
          //   i++;
          // }
            
      }
      // key & value
      else if (key !=='' && value !== '') {
        // INSERT key/value pair
        checkType(currentContext, {[key]: value});
        i++;
      }
    }
  }
  return jsonObj;
}

// INSERT = helper function to check the type of the object  
// current param is the currentContext and keyVal params should be an object
const checkType = (current, keyVal) => {
  // if array
    // push item into the current obj
  if (Array.isArray(current)) {
    current.push(keyVal);
  } else {
    // if object
      // add new key/value pair into the current obj
    const keys = Object.keys(keyVal);
    keys.forEach((key) => {
      current[key] = keyVal[key];
    })
  }
}

const fs = require('fs');
const path = require('path');

const yamlContent = fs.readFileSync(path.join(__dirname, 'input_yaml.yaml'), 'utf8');

console.log(parser(yamlContent));
console.log(JSON.stringify(parser(yamlContent), null, 2));