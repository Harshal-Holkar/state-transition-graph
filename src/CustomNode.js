import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { format, parseISO } from 'date-fns';

const CustomNode = ({ data }) => {
  return (
    <div style={{ 
      position: 'relative', 
      padding: '15px 20px', 
      border: '1px solid #ccc', 
      borderRadius: '15px', 
      backgroundColor: '#f9f9f9', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '250px'  // Adjust max width as per your design needs
    }}>
      {data.repo && (
        <div style={{ 
          position: 'absolute', 
          bottom: '100%', // Position just above the node
          left: '-10px', 
          fontSize: '12px', 
          color: '#666', 
          backgroundColor: 'transparent', 
          padding: '2px 5px', 
          borderRadius: '3px',
          fontStyle: 'italic',
          maxWidth: '75%',
          whiteSpace: 'normal', // Allow the text to wrap if necessary
          wordWrap: 'break-word', // Break long words if necessary
          transform: 'translateY(-5px)', // A small offset to move it outside
        }}>
          {data.repo}
        </div>
      )}
      <div style={{ 
        fontWeight: '500', 
        fontSize: '16px', 
        color: '#333', 
        marginBottom: '8px' 
      }}>
        {data.milestone}
      </div>
      {data.timestamp && (
        <ul style={{ 
          fontSize: '12px', 
          padding: '0', 
          margin: '0', 
          listStyleType: 'none', 
          color: '#777' 
        }}>
          {data.timestamp.map((timestamp, index) => (
            <li key={index}>{format(parseISO(timestamp), "MMM d, yyyy, hh:mm a")}</li>
          ))}
        </ul>
      )}
      <Handle type="target" position={Position.Top} style={{ borderRadius: '50%', backgroundColor: '#4caf50' }} />
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: '50%', backgroundColor: '#f44336' }} />
    </div>
  );
};

export default CustomNode;
