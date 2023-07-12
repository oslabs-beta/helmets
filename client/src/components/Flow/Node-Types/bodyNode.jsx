import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './bodyNode.scss';

export default memo(({ data, isConnectable }) => {
  return (
    <div className="bodyNode" style={data.active ? { border: '2px solid #035aa6' } : {}}>
      <Handle
        type="target"
        position={Position.Left}
        className="handle-left"
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <p>{data.label}</p>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        className="handle-right"
        isConnectable={isConnectable}
      />
    </div>
  );
});
