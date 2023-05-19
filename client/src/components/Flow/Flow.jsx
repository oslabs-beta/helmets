import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ObjectNode from '../object-node/object-node.jsx';
import './Flow.scss';

// import {
//   nodes as initialNodes,
//   edges as initialEdges,
// } from '../initial-elements/initial-elements.jsx';

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance);

// adding to nodeTypes prop - unsure if necessary
const nodeTypes = { object: ObjectNode };

// pass in nodes/ edges to add a new nodeType
export default function Flow({ topLevelChart, topLevelValues, filePathsArray }) {
  // const nodeTypes = useMemo(() => ({ special: ObjectNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState( [] );
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTemplate, setSelectedTemplate] = useState();

  const dropdownItems = filePathsArray.map((option, index) => 
    (
      <option key={index} value={option}>
        {option}
      </option>
    )
  )

  const handleDropdown = async (e) => {
    //try fetch request PUT @ /chart
    try {
      console.log('Attempting to PUT to get template data');
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({filePath: e.target.value})
      }
      const response = await fetch('http://www.localhost:3000/chart', options);
      const docModel = await response.json();
      console.log('docModel returned from DB:', docModel);

      setSelectedTemplate(docModel); //test
      createNodes(docModel.fileContent, docModel.name);
    }
    catch (err) { 
      console.log('ERROR in handleDropdown', err);
    }
  }

  const createNodes = (fileContents, fileName) => {
    console.log('INSIDE CREATE NODES');
    
    const nodesArray = [];
    let i = 0;

    const parentNode = {
      id: 'parentNode',
      type: 'default',
      data: {label: fileName},
      position: { x: 0, y: 0 }
    };

    nodesArray.push(parentNode);

    const readObject = (currObj, x = 0, y = 0) => {

      const createNodeObj = (idVal, dataVal, xVal, yVal) => {
        console.log(`x: ${xVal}  y: ${yVal}`);
        const newNode = {
          id: idVal,
          type: 'default',
          data: { label: dataVal },
          position: { x: xVal, y: yVal },
          // parentNode: 'parentNode',
          // extent: 'parent',
          // style: {
          //   height: 140
          // },
        };
        console.log('NEW NODE:', newNode)
        return newNode;
      }
      
        // loop through input obj
      for (const key in currObj) {
        const val = currObj[key];
        // for each key, check if val is obj or primitive
        if (typeof(val) === 'object' && Array.isArray(val) === false) {
          // if yes ({} or []) -> recurse
          x += 100;
          readObject(val, x, y);
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

    setNodes(nodesArray);
  }


  // example edge object
  // {
  //   id: `edge${i}`,
  //   source: `${i}`, //node where it starts
  //   target: `${i + 1}`, //node where it connects to
  //   animated: true,
  //   markerEnd: {
  //     type: MarkerType.ArrowClosed,
  //     color: '#035aa6;',
  //   },
  //   style: { stroke: '#035aa6' },
  // }

  

  return (
    <div id="tempContainer">
      <div id="dataContainer">
        <div id="chart">
          <h3>{topLevelChart.name}</h3>
          <pre>{JSON.stringify(topLevelChart.fileContent, null, 2)}</pre>
        </div>
        <div id="values">
          <h3>{topLevelValues.name}</h3>
          <pre>{JSON.stringify(topLevelValues.fileContent, null, 2)}</pre>
        </div>
      </div>
      <section className="flow-container">
        <select
          value={selectedTemplate}
          onChange={e => handleDropdown(e)}
        >
          {dropdownItems}
        </select>

        {/* <pre>Selected Template: {JSON.stringify(selectedTemplate, null, 2)}</pre> */}
        <ReactFlow
          // nodeTypes={nodeTypes}
          nodes={nodes}
          // edges={edges}
          onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}
          onInit={onInit}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.style?.background) return n.style.background;
              if (n.type === 'input') return '#035aa6';
              if (n.type === 'output') return '#91bbf2';
              if (n.type === 'default') return '#1a192b';

              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background;

              return '#fff';
            }}
            nodeBorderRadius={2}
          />
          <Controls />
          <Background color="#aaa" gap={16} />
          <Panel />
        </ReactFlow>
      </section>
    </div>
  );
}
