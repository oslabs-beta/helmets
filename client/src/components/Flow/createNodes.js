const createNodes = (fileContents, fileName) => {
  console.log('INSIDE CREATE NODES');
  
  const nodesArray = [];
  let i = 0;

  const parentNode = {
    id: 'parentNode',
    type: 'group',
    data: {label: null},
    position: { x: 0, y: 0 }
  };
  //title node for selected file
  const titleNode = {
    id: 'titleNode',
    type: 'default',          //<<< add new type for titles
    data: {label: fileName},
    position: { x: 0, y: 0 },
    parentNode: 'parentNode',
    extent: 'parent'
  };

  nodesArray.push(parentNode);
  nodesArray.push(titleNode);

  //iterates through the file object that holds the contents of the selected file
  const readObject = (currObj, x = 0, y = 0) => {
    
    // iterate through the file object
    for (const key in currObj) {
      const val = currObj[key];
      // for each key, check if val is obj or primitive
      if (typeof(val) === 'object' && Array.isArray(val) === false) {
        // if yes ({} or []) -> recurse
        x += 100;
        // create node for key (this node will become parent for nested nodes)
        nodesArray.push(createNodeObj(++i, key.toString(), x, y));
        readObject(val, x, y);
      }
      else if (Array.isArray(val) === true) {
        x += 100;
        // create node for key (this node will become parent for nested nodes)
        val.forEach(el => readObject(val, x, y));
      }
      // if no (string/number) -> create node and push to node array
      else {
        // make key/val pair into string
        const data = key.toString().trim() + ': ' + val.toString().trim();
        console.log('string created: \n', data);
        y += 100;
        nodesArray.push(createNodeObj(++i, data, x, y));
      }
    }
  }

  readObject(fileContents);
  console.log('NODES ARRAY: ', nodesArray);

  // if we recurse that means current key is parent
  // need to keep track of parent/child/group type ??

  return nodesArray;
}

// creates new node from current key-value pair
const createNodeObj = (idVal, dataVal, xVal, yVal) => {
  console.log(`x: ${xVal}  y: ${yVal}`);
  const newNode = {
    id: idVal.toString(),
    type: 'default',
    data: { label: dataVal },
    position: { x: xVal, y: yVal },
    parentNode: 'parentNode',
    extent: 'parent',
    // style: {
    //   height: 140
    // },
  };
  console.log('NEW NODE:', newNode)
  return newNode;
}

module.exports = createNodes;