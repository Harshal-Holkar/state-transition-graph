// import React from 'react';
// import { Handle, Position } from '@xyflow/react';

// const CustomNode = ({ data }) => {
//   return (
//     <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px', backgroundColor: '#fff' }}>
//       {data.branch && <div style={{ fontSize: 'smaller', color: 'gray' }}>{data.branch}</div>}
//       <div style={{ fontWeight: 'bold' }}>{data.state}</div>
//       {data.time && <div style={{ fontSize: 'smaller' }}>{data.time}</div>}
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// };

// export default CustomNode;

import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }) => {
  return (
    <div style={{ position: 'relative', padding: '10px', border: '1px solid black', borderRadius: '20px', backgroundColor: '#fff' }}>
      {data.branch && (
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
          {data.branch}
        </div>
      )}
      <div style={{ fontWeight: 'bold' }}>{data.state}</div>
      {data.time && (<ul style={{ fontSize: 'smaller', padding: '0', margin: '0', listStyleType: 'none' }}>
          {data.time.map((time, index) => (
            <li key={index}>{time}</li>
          ))}
        </ul>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
