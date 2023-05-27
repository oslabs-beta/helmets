const generateEdges= (array) => {
  //array ==> [last node, next node, value node];
  const edgeArray = [];
  let current = 0;
  while (array[current + 1]) {
    let id = 'edge-' + current;
    edgeArray.push(setEdge(id, array[current], array[current + 1]));
    current++;
  }
  return edgeArray;
}


const setEdge = (idVal, sourceVal, targetVal) => {
  const newEdge = {
    id: `${idVal}`,
    source: `${sourceVal}`,
    target: `${targetVal}`,
    animated: true,
    // label: 'animated styled edge',
    style: { stroke: 'black' },
  }

  return newEdge
}



export default generateEdges;