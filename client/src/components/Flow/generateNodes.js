/* SAMPLE DATA DEV ONLY - 

{ 
  fileName: valuesDoc.fileName,
  filePath: valuesDoc.filePath,
  type: valuesDoc.type,
  nodeID: `${valuesDoc.filePath}__${lineNum}`,
  flattenedDataArray: flattenObject(valuesDoc.filePath, current)
}

sample flattenedArray obJ
  {
      "nodeID": "small_chart/charts/backend/templates/configmap-appsettings.yaml__2",
      "indent": 0,
      "value": {
          "kind": "ConfigMap"
      }
  },
*/

const generateNodes = (dataFlowArray) => {
  
  let y = 0;
  let parentX = 0;
  const persistentData = {
    markerID: 0
  }
  const yIncrement = 20;
  const xIncrement = 25;
  const nodesArray = [];

  // iterate over each obj in dataFlowArray
  dataFlowArray.forEach(dataFlowObj => {
    
    // iterate over each obj inside obj.flattenedDataArray
    const parent = createParentNode(dataFlowObj.filePath, parentX)
    nodesArray.push(parent);
    parentX += 800;
    y += yIncrement;
    const parentId = parent.id;

    for (const dataLineObj of dataFlowObj.flattenedDataArray) {
      const { nodeID, indent, value } = dataLineObj;
      const bodyNode = createBodyNode(
        nodeID, 
        indent * xIncrement, 
        value, y, 
        parentId, 
        dataFlowObj.filePath, 
        persistentData
      );

      nodesArray.push(bodyNode);
      y += yIncrement;
    }
    y = 0;
  });

  console.log(nodesArray);
  return nodesArray;
}

// creates new parent node from current file name
const createParentNode = (id, parentX) => {
  const parentNode = {
    id: `${id}_parent`,
    type: 'group',
    position: { x: parentX, y: 0 },
    style: {
      backgroundColor: '#fefefe',
      border: '1px solid #035aa6',
      width: 250,
      height: 100,
      borderRadius: 5,
    },
    draggable: true,
  };
  return parentNode;
};

// creates new body node from current key-value pair
const createBodyNode = (nodeID, indent, value, y, parentId, path, persistentData) => {
  
  if (typeof value !== 'string' ){
    const [ valKey, valValue ] = Object.entries(value)[0];
    value = `${valKey}: ${valValue}`;
  }
  if (nodeID==='marker'){
    nodeID = nodeID.concat(persistentData.markerID++);
  }
  
  const newNode = {
    id: `${nodeID}`,
    type: 'bodyNode',
    data: { 
      label: `${value}`,
      path: path
    },
    position: { x: indent, y: y },
    parentNode: `${parentId}`,
    extent: 'parent',
    expandParent: true,
    draggable: false,
  };
  return newNode;
};

export default generateNodes;