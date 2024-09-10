import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Define a custom node component
const CustomNode = ({ data }) => {
  return (
    <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px', backgroundColor: '#fff' }}>
      <div style={{ fontWeight: 'bold' }}>{data.state}</div>
      {data.time && <div style={{ fontSize: 'smaller' }}>{data.time}</div>}
      {data.branch && <div style={{ fontSize: 'smaller', color: 'gray' }}>Branch: {data.branch}</div>}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
