import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';

import 'reactflow/dist/style.css';
import './flow.scss';

const initialNodes = [
  { id: '1', position: { x: 10, y: 10 }, data: { label: '1' } },
  { id: '2', position: { x: 10, y: 100 }, data: { label: '2' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function Flow() {
  return (
    <div className="flow-container">
      <ReactFlow nodes={initialNodes} edges={initialEdges} id="flow">
        <MiniMap />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
