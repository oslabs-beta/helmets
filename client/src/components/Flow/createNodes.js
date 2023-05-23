
const createNodes = (fileContents, fileName, filePath) => {
  
  const nodesArray = [];
  let i = 0;
  let y = 0;
  let x = 0;

  const parentNode = {
    id: 'parentNode',
    type: 'group',
    data: {label: fileName},
    position: { x: 0, y: 0 },
    style: { 
      backgroundColor: 'rgba(255, 0, 0, 0.2)', 
      width: 250, 
      height: 250
    },
    expandParent: true
  };
  nodesArray.push(parentNode);

  //iterates through the file object that holds the contents of the selected file
  const readObject = (currObj) => {
    
    // iterate through the file object
    for (const key in currObj) {
      const val = currObj[key];
      // for each key, check if val is obj or primitive
      if (typeof(val) === 'object' && Array.isArray(val) === false) {
        // if yes ({} or []) -> recurse
        // create node for key (this node will become parent for nested nodes)
        y += 20;

        const keyNode = createNodeObj(++i, key.toString(), x, y, filePath);
        nodesArray.push(keyNode);

        x += 25;
        // y += 25;
        readObject(val);
        x -= 25;
        
      }
      else if (Array.isArray(val) === true) {
        console.log('ARRAY FOUND');
        // create node for key (this node will become parent for nested nodes)
        y += 20;
        const newNode = createNodeObj(++i, key.toString(), x, y, filePath);
        // newNode.position = {x: x, y: yPosition};
        // yPosition += 25;
        nodesArray.push(newNode);
        x += 25;
        val.forEach(el => {
          // y += 25;
          readObject(el);
        });
        x -= 25;
      }
      // if no (string/number) -> create node and push to node array
      else {
        // make key/val pair into string
        const data = key.toString().trim() + ': ' + val.toString().trim();
        console.log('string created: \n', data);
        y += 20;
        const newNode = createNodeObj(++i, data, x, y, filePath);
        // newNode.position = {x: x, y: yPosition};
        // yPosition += 25
        nodesArray.push(newNode);
      }
    }
  }

  readObject(fileContents);
  console.log('NODES ARRAY: ', nodesArray);

  // if we recurse that means current key is parent
  // need to keep track of parent/child/group type ??

  nodesArray[0].style.height = (22 * (nodesArray.length) + (4 * nodesArray.length - 1));

  return nodesArray;
}

// creates new node from current key-value pair
const createNodeObj = (idVal, dataVal, x, y, filePath) => {
  console.log(`x: ${x}  y: ${y}`);
  const newNode = {
    id: idVal.toString(),
    type: 'bodyNode',
    data: { label: dataVal, path: filePath.toString()},
    position: { x: x, y: y },
    parentNode: 'parentNode',
    extent: 'parent',
  };
  // console.log('NEW NODE:', newNode)
  return newNode;
}

export default createNodes;