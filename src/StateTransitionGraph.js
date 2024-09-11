import {React, useCallback} from 'react';
import Dagre from '@dagrejs/dagre';
import {ReactFlow, ReactFlowProvider, Panel, useNodesState, useEdgesState, useReactFlow, MiniMap, Controls} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';

// Function to compute layouted nodes and edges
const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction, ranksep: 75, nodesep: 75 });

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
    edges: edges
  };
};

const createInitialNodes = (data) => {
  return data.map((item, index) => ({
    id: `node-${index}`,
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: {
      milestone: item.milestone,
      timestamp: Array.isArray(item.timestamp) ? item.timestamp : [item.timestamp],
      repo: item.repo,
      artifact: item.artifact,
      additional_info: item.additional_info,
      isActive: true,
    },
  }));
};

const createEdges = (nodes) => {
  const edges = [];
  const branchMap = new Map();
  const stateMap = new Map(); // To track nodes by state within branches
  let lastNullBranchNode = null;

  // Array to keep track of processed nodes
  const processedNodes = [];

  // get checker
  const extractChecker = (additionalInfo) => {  
    const regex = /\d+\.\d+\.\d+-\d{4}-\d{2}-\d{2}-\w+/;
    const match = additionalInfo.match(regex);

    if (match) {
        const versionString = match[0];
        const subRegex = /\d+\.\d+\.(.*)/;
        const subMatch = versionString.match(subRegex);

        if (subMatch) {
            return subMatch[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

  // get previous item from processed nodes
  const findPreviousItem = (currentNode) => {
    let checker = extractChecker(currentNode.data.additional_info);
    
    for (const node of processedNodes) {
      if (node.data.milestone.endsWith('Build') &&
          node.data.artifact.includes(checker)) {
        return node;
      }
    }
    return null;
  };

  nodes.forEach((node, index) => {
    let { repo, milestone} = node.data;

    // Handle milestone with suffix '* Deployment'
    if (milestone.endsWith('Deployment')) {
      const previousItem = findPreviousItem(node);
      if (previousItem) {
        repo = previousItem.data.repo;
        // node.data.repo = previousItem.data.repo;
      }
    }

    if (index === 0) {
      if (repo) {
        branchMap.set(repo, node);
        stateMap.set(`${repo}-${milestone}`, node);
      } else {
        lastNullBranchNode = node;
      }
      processedNodes.push(node); // Add the first node to the processed list
      return;
    }

    if (repo) {
      let prevNodeInSameRepo = branchMap.get(repo);
      let reverseEdgeNode = stateMap.get(`${repo}-${milestone}`);

      if (!prevNodeInSameRepo) {
        prevNodeInSameRepo = lastNullBranchNode;
      }

      if (prevNodeInSameRepo) {
        // if (reverseEdgeNode) {
        //   // reverse edge
        //   edges.push({
        //     id: `reverse-edge-${index}`,
        //     source: prevNodeInSameRepo.id,
        //     target: reverseEdgeNode.id,
        //     type: 'straight',
        //     style: { stroke: 'red', strokeWidth: 5 },
        //     // animated: true,
        //   });
        //   reverseEdgeNode.data.timestamp = [...new Set([...reverseEdgeNode.data.timestamp, ...node.data.timestamp])];
        //   // hide current node 
        //   node.data.isActive = false;
        // } else {
          edges.push({
            id: `edge-${index}`,
            source: prevNodeInSameRepo.id,
            target: node.id,
            type: 'straight',
            style: { stroke: 'black', strokeWidth: 0.5 }, // Ensure default styling
            // animated: true,
          });
          branchMap.set(repo, node);
        // }
      }

      // Update state map
      if (!stateMap.has(`${repo}-${milestone}`)) {
        stateMap.set(`${repo}-${milestone}`, node);
      }
    } else {
      if (lastNullBranchNode) {
        edges.push({
          id: `edge-${index}`,
          source: lastNullBranchNode.id,
          target: node.id,
          type: 'straight',
          style: { stroke: 'black', strokeWidth: 0.5 }, // Ensure default styling
          // animated: true,
        });
      }
      lastNullBranchNode = node;
    }
    
    //  current node to the processed
    processedNodes.push(node);
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

        // include only active ones
        const activeNodes = layouted.nodes.filter(node => node.data.isActive);

        setNodes([...activeNodes]);
        setEdges([...layouted.edges]);

        window.requestAnimationFrame(() => {
          fitView({zoom : 1});
          setEdges((edges) => [...edges]);
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
          const data = json;

          const newNodes = createInitialNodes(data);
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
