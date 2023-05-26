import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './bodyNode.scss';

export default memo(({ data, isConnectable }) => {
  return (
    <div className='bodyNode'>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div style={{backgroundColor: 'aliceblue', }}>
        <p className='nodeText'>{data.label}</p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
});