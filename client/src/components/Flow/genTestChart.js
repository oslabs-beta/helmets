const testObj = {
    id: '1',
    label: '1',
    x: 0,
    props: {
        id: '2',
        label: '2',
        x: 0
    }
}


const nodes = [];
const edges = [];

// const createObjHelper = (obj = testObj, x = 0, y = 0) => {
//     // Create a node for each line in the object
//     let childY = y;
//     for (const key in obj) {
//       const value = obj[key];
//       const label = `${key}: ${value}`;
//       const node = {
//         id: label,
//         data: { label },
//         position: { x, y: childY },
//       };
//       nodes.push(node);
//       childY += 50;
  
//       // Recursively create nodes for child objects and arrays
//       if (typeof value === 'object') {
//         createObjHelper(value, x + 200, childY);
//         // const edge = { id: `${node.id}-${childNode.id}`, source: node.id, target: childNode.id };
//         // nodes.push(childNode);
//         // edges.push(edge);
//         // childY += 50;
//       }
//     }

//     console.log('nodes', nodes);
//   };

// const createNodeFromObject = () => {
//     createObjHelper();
//     console.log('nodes', nodes);
//     return { nodes, edges };
//   };

const createNodeFromObject = (obj = testObj, x = 0, y = 0, parentId = null) => {
    const nodes = [];
    const edges = [];
  
    // Create a parent node for the object
    const parentNode = {
      id: parentId || 'parent',
      data: { label: 'Parent' },
      position: { x, y },
    };
    nodes.push(parentNode);
  
    // Create child nodes for each line in the object
    let childY = y + 50;
    for (const key in obj) {
      const value = obj[key];
      const label = `${key}: ${value}`;
      const node = {
        id: label,
        parentId: parentNode.id, // Set the parentId property of the child node
        data: { label },
        position: { x: x + 200, y: childY },
      };
      nodes.push(node);
      childY += 50;
  
      // Create an edge from the parent node to the child node
      const edge = { id: `${parentNode.id}-${node.id}`, source: parentNode.id, target: node.id };
      edges.push(edge);
  
      // Recursively create child nodes for child objects and arrays
      if (typeof value === 'object') {
        const childNode = createNodeFromObject(value, x + 200, childY, node.id); // Pass the ID of the parent node to the child node
        const childEdge = { id: `${node.id}-${childNode.nodes[0].id}`, source: node.id, target: childNode.nodes[0].id };
        nodes.push(...childNode.nodes);
        edges.push(childEdge, ...childNode.edges);
        childY += 50;
      }
    }
  
    return { nodes, edges };
  };

  export default createNodeFromObject;