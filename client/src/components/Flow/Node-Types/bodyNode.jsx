import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './bodyNode.scss';

export default memo(({ data, isConnectable }) => {
  return (
    <div className="bodyNode">
      <Handle
        type="target"
        position={Position.Left}
        // style={{ background: '#555' }}
        className="handle-left"
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <p>{data.label}</p>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        // style={{ background: '#555' }}
        className="handle-right"
        isConnectable={isConnectable}
      />
    </div>
  );
});
