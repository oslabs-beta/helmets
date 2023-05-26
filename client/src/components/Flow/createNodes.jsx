const createNodes = (pathArray) => {
  const nodesArray = [];
  let i = -1;
  let y = 10;
  let x = 10;
  let parentX = 0;
  const heightIncrement = 18;

  pathArray.forEach((doc) => {
    const fileContent = doc.fileContent;
    const filePath = doc.filePath;
    const parentNode = createParentNode(++i, doc.name, parentX, filePath);
    parentX += 800;
    nodesArray.push(parentNode);
    nodesArray.push(
      createNodeObj(++i, doc.name, x, y, filePath, parentNode.id)
    );
    nodesArray[Number(parentNode.id)].style.height += heightIncrement;

    //iterates through the file object that holds the contents of the selected file
    const readObject = (currObj) => {
      console.log('INSIDE readObject()');
      // iterate through the file object, create nodes for each line, set x and y position relative to parent
      for (const key in currObj) {
        const val = currObj[key];
        // for each key, check if val is obj or primitive
        if (typeof val === 'object' && Array.isArray(val) === false) {
          // if yes ({} or []) -> recurse
          // create node for key (this node will become parent for nested nodes)
          y += 50;

          const keyNode = createNodeObj(
            ++i,
            key.toString(),
            x,
            y,
            filePath,
            parentNode.id
          );
          nodesArray.push(keyNode);
          nodesArray[Number(parentNode.id)].style.height += heightIncrement;

          x += 25;
          readObject(val);
          if (x > 10) x -= 25;
        } else if (Array.isArray(val) === true) {
          // create node for key
          y += 50;
          const newNode = createNodeObj(
            ++i,
            key.toString(),
            x,
            y,
            filePath,
            parentNode.id
          );
          nodesArray.push(newNode);
          nodesArray[Number(parentNode.id)].style.height += heightIncrement;
          x += 25;
          val.forEach((el) => {
            readObject(el);
          });
          if (x > 10) x -= 25;
        }
        // if no (string/number) -> create node and push to node array
        else {
          // make key/val pair into string
          const data = key.toString().trim() + ': ' + val.toString().trim();
          // console.log('string created: \n', data);
          y += 50;
          const newNode = createNodeObj(
            ++i,
            data,
            x,
            y,
            filePath,
            parentNode.id
          );
          nodesArray.push(newNode);
          nodesArray[Number(parentNode.id)].style.height += heightIncrement;
        }
      }
      // *** end ForIn loop - all lines have been added as nodes to the parent

      //reset x and y to 0
      x = 10;
      // y = 0;
    };
    readObject(fileContent);
    console.log('NODES ARRAY: ', nodesArray);

    // nodesArray[Number(parentNode.id)].style.height = (22 * (nodesArray.length) + (4 * nodesArray.length - 1));
    //
    y = 0;
  });

  return nodesArray;
};

const createParentNode = (idVal, dataVal, parentX, filePath) => {
  // console.log('INSIDE CreateParentNode()')
  const parentNode = {
    id: idVal.toString(),
    type: 'group',
    data: {
      label: `${dataVal}`,
      path: filePath.toString(),
    },
    position: { x: parentX, y: 0 },
    style: {
      backgroundColor: '#fefefe',
      border: '1px solid #035aa6',
      width: 250,
      height: 100,
      borderRadius: 5,
    },
    draggable: false,
  };

  return parentNode;
};

// creates new node from current key-value pair
const createNodeObj = (idVal, dataVal, x, y, filePath, parentId) => {
  // console.log('INSIDE createNodeObj()')
  console.log(`node: ${filePath} x: ${x}  y: ${y}`);
  const newNode = {
    id: idVal.toString(),
    type: 'bodyNode',
    data: { label: dataVal, path: filePath.toString() },
    position: { x: x, y: y },
    parentNode: `${parentId}`,
    extent: 'parent',
    expandParent: true,
    draggable: false,
  };

  // console.log('NEW NODE:', newNode)
  return newNode;
};

export default createNodes;
