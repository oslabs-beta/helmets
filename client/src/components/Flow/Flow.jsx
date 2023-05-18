import React, { useCallback } from 'react';
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

import {
  nodes as initialNodes,
  edges as initialEdges,
} from '../initial-elements/initial-elements.jsx';

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance);

// adding to nodeTypes prop - unsure if necessary
const nodeTypes = { object: ObjectNode };

// pass in nodes/ edges to add a new nodeType
export default function Flow({ topLevelChart, topLevelValues }) {
  // const nodeTypes = useMemo(() => ({ special: ObjectNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
        <ReactFlow
          // nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
