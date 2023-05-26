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
import './Flow.scss';
import createNodes from './createNodes.js';
import bodyNode from './Node-Types/bodyNode.jsx';

const nodeTypes = {
  bodyNode: bodyNode,
};

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance);

// pass in nodes/ edges to add a new nodeType
export default function Flow({
  topLevelChart,
  topLevelValues,
  filePathsArray,
}) {
  // const nodeTypes = useMemo(() => ({ special: ObjectNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTemplate, setSelectedTemplate] = useState();

  const dropdownItems = filePathsArray.map((option, index) => (
    <option key={index} value={option}>
      {option}
    </option>
  ));

  const handleNodeClick = async (e, node) => {
    const targetPath = node.data.path;
    // need to change bc some entries have more than one colon
    const targetVal = node.data.label.split(': ')[1].trim();
    console.log('targetValue', targetVal);
    try {
      console.log('Attempting to PUT to get template data');
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetVal: targetVal, targetPath: targetPath }),
      };
      const response = await fetch('http://www.localhost:3000/path', options);
      //server returns array of documents
      const pathArray = await response.json();
      // const pathArray = samplePath;
      console.log('pathArray returned from DB:', pathArray);
      const nodeArray = createNodes(pathArray);
      // render all files
      console.log('NODE ARRAY ', nodeArray);
      setNodes(nodeArray);
      // set edges
      // source = node.id
      // target =
    } catch (err) {
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: e.target.value }),
      };
      const response = await fetch('http://www.localhost:3000/chart', options);
      const docModel = await response.json();
      console.log('docModel returned from DB:', docModel);

      const nodeArr = createNodes([docModel]);
      setNodes(nodeArr);
    } catch (err) {
      console.log('Error in request to get selected chart!');
    }
  };

  return (
    <div id="tempContainer">
      <div id="dataContainer">
        <select
          className="dropdown"
          value={selectedTemplate}
          onChange={(e) => handleDropdown(e)}
        >
          <option value="">Select Chart</option>
          {dropdownItems}
        </select>
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
              if (n.type === 'group') return '#035aa6';
              if (n.type === 'bodyNode') return '#91bbf2';
              if (n.type === 'default') return '#1a192b';

              return '#fefefe';
            }}
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background;

              return '#fefefe';
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
