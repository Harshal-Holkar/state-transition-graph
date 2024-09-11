
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { format, parseISO } from 'date-fns';

const CustomNode = ({ data }) => {
  return (
    <div style={{ position: 'relative', padding: '10px', border: '1px solid black', borderRadius: '20px', backgroundColor: '#fff' }}>
      {data.repo && (
        <div style={{ 
          position: 'absolute', 
          top: '-20px',
          left: '0%', 
          fontSize: 'smaller', 
          color: 'gray', 
          backgroundColor: 'transparent',
          padding: '2px 5px', 
          borderRadius: '3px' 
        }}>
          {data.repo}
        </div>
      )}
      <div style={{ fontWeight: 'bold' }}>{data.milestone}</div>
      {data.timestamp && (<ul style={{ fontSize: 'smaller', padding: '0', margin: '0', listStyleType: 'none', }}>
          {data.timestamp.map((timestamp, index) => (
            <li key={index}>{format(parseISO(timestamp), "MMM d, yyyy, hh:mm a")}</li>
          ))}
        </ul>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
