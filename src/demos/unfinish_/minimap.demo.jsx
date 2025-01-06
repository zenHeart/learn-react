import React, { useState, useCallback } from 'react';

const LargeGraphDemo = () => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);

  // Generate sample data
  const nodes = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < 150; i++) {
      result.push({
        id: `node-${i}`,
        position: {
          x: Math.random() * 2000 - 1000,
          y: Math.random() * 2000 - 1000
        },
        data: { label: `Node ${i}` }
      });
    }
    return result;
  }, []);

  const edges = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      const numConnections = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          result.push({
            source: nodes[i].id,
            target: nodes[target].id
          });
        }
      }
    }
    return result;
  }, [nodes]);

  const handleMinimapClick = useCallback((event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    
    setViewport({
      x: -x * 2000 + 400,
      y: -y * 2000 + 300,
      zoom: 1
    });
  }, []);

  const handleMouseDown = useCallback((event) => {
    setIsDragging(true);
    setDragStart({
      x: event.clientX - viewport.x,
      y: event.clientY - viewport.y
    });
  }, [viewport]);

  const handleMouseMove = useCallback((event) => {
    if (isDragging) {
      setViewport(prev => ({
        ...prev,
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(2, prev.zoom * (event.deltaY > 0 ? 0.9 : 1.1)))
    }));
  }, []);

  return (
    <div 
      className="relative w-full h-[800px] overflow-hidden bg-gray-50"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Edges */}
        <svg className="absolute top-0 left-0" style={{ width: '4000px', height: '4000px' }}>
          {edges.map((edge, idx) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            return (
              <line
                key={idx}
                x1={source.position.x + 1000}
                y1={source.position.y + 1000}
                x2={target.position.x + 1000}
                y2={target.position.y + 1000}
                stroke="#94a3b8"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute px-2 py-1 rounded-md cursor-pointer transition-shadow
              ${selectedNode === node.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-white shadow hover:shadow-md'}`}
            style={{
              left: node.position.x + 1000,
              top: node.position.y + 1000,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedNode(node.id)}
          >
            <span className="text-xs">{node.data.label}</span>
          </div>
        ))}
      </div>

      {/* Minimap */}
      <div 
        className="absolute right-4 top-4 w-48 h-48 border rounded bg-white shadow-lg"
        onClick={handleMinimapClick}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute w-1 h-1 rounded-full 
              ${selectedNode === node.id ? 'bg-blue-600' : 'bg-blue-400'}`}
            style={{
              left: `${((node.position.x + 1000) / 2000) * 100}%`,
              top: `${((node.position.y + 1000) / 2000) * 100}%`
            }}
          />
        ))}
        <div
          className="absolute border-2 border-red-500 opacity-50"
          style={{
            left: `${((-viewport.x + 1000) / 2000) * 100}%`,
            top: `${((-viewport.y + 1000) / 2000) * 100}%`,
            width: `${(800 / 2000) * 100}%`,
            height: `${(600 / 2000) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  );
};
LargeGraphDemo.meta = {
  disableSandpack: true
}

export default LargeGraphDemo;
