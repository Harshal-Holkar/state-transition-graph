import data from './data.json';

const initialNodes = data.map((item, index) => ({
  id: `node-${index}`,
  type: 'customNode',
  position: { x: 0, y: 0 }, // Position will be handled by Dagre
  data: { state: item.state, time: item.time, branch: item.branch },
}));

const createEdges = (nodes) => {
  const edges = [];
  const nodeMap = new Map();
  
  // Map node IDs to node objects for quick lookup
  nodes.forEach((node) => nodeMap.set(node.id, node));

  // Iterate through nodes to create edges
  nodes.forEach((node, index) => {
    if (index === 0) return; // Skip the first node as it has no previous node

    const prevNodeInSameBranch = nodes
      .slice(0, index)
      .reverse()
      .find((n) => n.data.branch === node.data.branch);

    if (prevNodeInSameBranch) {
      edges.push({
        id: `edge-${index}`,
        source: prevNodeInSameBranch.id,
        target: node.id,
        type: 'smoothstep',
      });
    } else {
      const prevNodeInNullBranch = nodes
        .slice(0, index)
        .reverse()
        .find((n) => !n.data.branch);

      if (prevNodeInNullBranch) {
        edges.push({
          id: `edge-${index}`,
          source: prevNodeInNullBranch.id,
          target: node.id,
        });
      }
    }
  });

  return edges;
};

const initialEdges = createEdges(initialNodes);

export { initialNodes, initialEdges };
