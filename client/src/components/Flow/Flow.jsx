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

import createNodes from './createNodes.js';
import samplePath from '../../../../server/sample_data/sample_path_payload'

import {
  nodes as initialNodes,
  edges as edges,
} from '../initial-elements/initial-elements.jsx';

import bodyNode from './Node-Types/bodyNode';

const nodeTypes = {
  bodyNode: bodyNode
}

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance);

// pass in nodes/ edges to add a new nodeType
  export default function Flow ({ topLevelChart, topLevelValues, filePathsArray }) {
  // const nodeTypes = useMemo(() => ({ special: ObjectNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTemplate, setSelectedTemplate] = useState();

  const dropdownItems = filePathsArray.map((option, index) => 
    (
    <option key={index} value={option}>
      {option}
    </option>
    )
  )

  const handleNodeClick = async (e, node) => {
    const targetPath = node.data.path;
    // need to change bc some entries have more than one colon
    const targetVal = node.data.label.split(': ')[1].trim();
    console.log('targetValue', targetVal)
    try {
      console.log('Attempting to PUT to get template data');
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({targetVal: targetVal, targetPath: targetPath})
      }
      const response = await fetch('http://www.localhost:3000/path', options);
      //server returns array of documents
      const pathArray = await response.json();
      // const pathArray = samplePath;
      console.log('pathArray returned from DB:', pathArray);
      let nodeArray = [];
      // call createNodes() on each file in array
      pathArray.forEach(doc => {
        //create a parent node
        //shift parent node to [0] index
        nodeArray = [...nodeArray, ...createNodes(doc.fileContent, doc.name, doc.filePath)];
      });
      // render all files
      console.log('NODE ARRAY ', nodeArray);
      setNodes(nodeArray);
    }
    catch (err) {
      console.log('ERROR in handleNodeClick ', err);
    }
  };

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
      const nodeArr = createNodes(docModel.fileContent, docModel.name, e.target.value);
      setNodes(nodeArr);
    }
    catch (err) { 
      console.log('Error in request to get selected chart!');
    }

  }

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
          nodeTypes={nodeTypes}
          nodes={nodes}
          // edges={edges}
          onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}
          onInit={onInit}
          fitView
          attributionPosition="top-right"
          onNodeClick={handleNodeClick}
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
