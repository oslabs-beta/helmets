// func that takes yaml string (from readfile) as input
const parser = (yaml) => {

  const lines = yaml.split("\n");

  const jsonObj = {};
  let i = 0;
  const contextStack = [jsonObj];
	let currentContext = contextStack[contextStack.length - 1];
	let lastIndent = 0;

  while (i < lines.length) {
		console.log(i);

    // check our context 1st
    const matchPattern = lines[i].match(/^\s*/);
    let currentLineIndent = matchPattern ? matchPattern[0].length : 0;

    let trimmedStr = lines[i].trim();
    if (trimmedStr[0] === '-') {
      currentLineIndent+=2;
    }

    // compare lastIndent (tracking prev index) against currentLineIndent
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
      if (Array.isArray(currentContext)) {
        contextStack.pop();
        lastIndent -= 2;
        currentContext = contextStack[contextStack.length - 1];
      }
    }
        
    const trimmedString = lines[i].trim();

    // Check for non-value Go Expression
    if ( trimmedString.startsWith("{{") ) {
      const keyPair = {[trimmedString]: 'EXP'};
      insert(currentContext, keyPair)
      i++;
      
    } else {
      let [key, value] = lines[i].split(':');
      key = key.trim();

      if (!value) {
        i++;
      } else {
        value = value.trim();

        // NEW LINE: confirm we have key but no value
        if (key && (value === '' || value === undefined )) {

          const nextLine = lines[i + 1].trim();
          const nextNextLine = lines[i + 2].trim();
          let [nextNextKey, nextNextValue] = nextNextLine.split(':');

            // check if we have nextLine of {{ }} and next next line of -
            if (nextLine.startsWith("{{") && nextNextLine.startsWith("-")){ 
              
              if (nextNextKey !== '' && (nextNextValue === '' || nextNextValue === undefined )) {
                currentContext[key] = [];
                currentContext[key].push({[nextLine]:'EXP'});
                currentContext[key].push({[nextNextKey]:{}});
                contextStack.push(currentContext[key]);
                contextStack.push(currentContext[key][1][nextNextKey]);
                currentContext = contextStack[contextStack.length - 1];
                lastIndent = currentLineIndent + 6;
                i += 3;

              } else {
                // create new Array
                currentContext[key] = [];
                // add obj into array, w/ k/val pair of {{}} : EXP
                currentContext[key].push({[nextLine]:'EXP'});
                // add another obj into array, with key of nextNextKey & values of nextNextVal
                currentContext[key].push({[nextNextKey]:nextNextValue.trim()});
                // push array to contextStack
                contextStack.push(currentContext[key]);
                // push 2nd obj to contextStack
                contextStack.push(currentContext[key][1]);
                // update currentContext
                currentContext = contextStack[contextStack.length - 1];
                // update lastIndent to be currentIndent + 4
                lastIndent += 4;
                // increment i + 3
                i += 3;
              }
            } else if (nextLine[0] === '-') {
                // create new array inside obj
                currentContext[key] = [];
                // push array to context stack
                contextStack.push(currentContext[key]);
                // create empty obj inside array
                currentContext[key].push({});

                // add empty obj to context stack
                contextStack.push(currentContext[key][0]);

                // currentContext = contextStack[contextStack.length - 1];

                // add key/value pair @ nextLine to obj stack
                let [nextKey, nextValue] = nextLine.split(':');

                if (nextKey && (nextValue === '' || nextValue === undefined )) {
                  // is it a newline?
                    // if yes, copy the below functionality for non-dash new line
                    currentContext = contextStack[contextStack.length - 1];

                    currentContext[nextKey] = {};
                    contextStack.push(currentContext[nextKey]);
                    currentContext = contextStack[contextStack.length - 1];
                    // then index = i+2 because skipped over the non-value line
                    i+=2;
                    lastIndent = currentLineIndent + 6; // +6 because - is +4, and we added a nested obj
                } else {
                  // else do below stuff
                  currentContext[key][0][nextKey] = nextValue.trim();

                  // update currentContext to be latest on stack
                  currentContext = contextStack[contextStack.length - 1];

                  // increment i+=2
                  i += 2;
                  // this should be +4 because we are skipping this w/ i+=2
                  lastIndent = lastIndent + 4; // PLEASE WORK
                }

            } else if (/^[a-zA-Z]/.test(nextLine[0]) || nextLine.startsWith('{{')) {
                currentContext[key] = {};
                contextStack.push(currentContext[key]);
                currentContext = contextStack[contextStack.length - 1];
                i++;
                lastIndent = lastIndent + 2; // PLEASE WORK
            }
        }
        // key & value
        else if (key !=='' && value !== '') {
          // check if key starts with dash
          if (key[0] === '-') {
            // pop current obj off context stack
            contextStack.pop();
            const currentArray = contextStack[contextStack.length - 1];
            // push new obj in current context (array)
            currentArray.push({});
            // push new obj to contextStack
            contextStack.push(currentArray[currentArray.length - 1]);
            // update currentContext to be last in stack
            currentContext = contextStack[contextStack.length - 1];
            // add key and value to currentContext
            insert(currentContext, {[key]: value});
            // increment i++
            i++;
          }
          else {
            // INSERT key/value pair
            insert(currentContext, {[key]: value});
            i++;
          }
        }
      }
    }
  }
  return jsonObj;
}

const insert = (current, keyVal) => {
  if (Array.isArray(current)) {
    current.push(keyVal);
  } else {
    const keys = Object.keys(keyVal);
    keys.forEach((key) => {
      current[key] = keyVal[key];
    })
  }
}

const fs = require('fs');
const path = require('path');

const yamlContent = fs.readFileSync(path.join(__dirname, 'ingress_test.yaml'), 'utf8');

// console.log(parser(yamlContent));
// console.log(JSON.stringify(parser(yamlContent), null, 2));