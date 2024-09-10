import {React, useCallback} from 'react';
import Dagre from '@dagrejs/dagre';
import {ReactFlow, ReactFlowProvider, Panel, useNodesState, useEdgesState, useReactFlow, MiniMap, Controls} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';

// Function to compute layouted nodes and edges
const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  // Add nodes and edges to the Dagre graph
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 100, // Default width
      height: node.measured?.height ?? 50, // Default height
    })
  );
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  // Apply Dagre layout algorithm
  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      const x = position.x - (node.measured?.width ?? 100) / 2;
      const y = position.y - (node.measured?.height ?? 50) / 2;

      return { ...node, position: { x, y } };
    }),
    edges: edges.map((edge) => ({
      ...edge,
      type: 'beizer',
      style: { strokeWidth: 1.5 },
    })),
  };
};

const createInitialNodes = (lifecycle) => {
  return lifecycle.map((item, index) => ({
    id: `node-${index}`,
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: { state: item.state, time: item.time, branch: item.branch },
  }));
};

const createEdges = (nodes) => {
    const edges = [];
    const branchMap = new Map();
    let lastNullBranchNode = null;
  
    nodes.forEach((node, index) => {
      if (index === 0) {
        if (node.data.branch) {
          branchMap.set(node.data.branch, node);
        } else {
          lastNullBranchNode = node;
        }
        return;
      }
  
      if (node.data.branch) {
        let prevNodeInSameBranch = branchMap.get(node.data.branch);

        if(!prevNodeInSameBranch)
            prevNodeInSameBranch = lastNullBranchNode
  
        if (prevNodeInSameBranch) {
          edges.push({
            id: `edge-${index}`,
            source: prevNodeInSameBranch.id,
            target: node.id,
            type: 'smoothstep',
          });
        }

        branchMap.set(node.data.branch, node);
      } else {
        if (lastNullBranchNode) {
          edges.push({
            id: `edge-${index}`,
            source: lastNullBranchNode.id,
            target: node.id,
          });
        }
        lastNullBranchNode = node;
      }
    });
  
    return edges;
  };
  

const LayoutFlow = () => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onLayout = useCallback(
    (direction) => {
      if (nodes.length > 0 && edges.length > 0) {
        const layouted = getLayoutedElements(nodes, edges, { direction });

        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        window.requestAnimationFrame(() => {
          fitView();
        });
      }
    },
    [nodes, edges, fitView]
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const lifecycle = json.lifecyle;

          const newNodes = createInitialNodes(lifecycle);
          const newEdges = createEdges(newNodes);

          setNodes(newNodes);
          setEdges(newEdges);
        } catch (err) {
          console.error('Error parsing JSON file:', err);
          alert('Invalid file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={{ customNode: CustomNode }}
        style={{ width: '100%', flexGrow: 1 }}
      >
        <MiniMap />
        <Controls />
        <Panel position="top-right">
          <button onClick={() => onLayout('TB')}>Vertical Layout</button>
          <button onClick={() => onLayout('LR')}>Horizontal Layout</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}
