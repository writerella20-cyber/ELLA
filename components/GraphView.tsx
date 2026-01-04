
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BinderItem, WorkspaceTheme } from '../types';
import { FileText, User, MapPin, Search, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface GraphViewProps {
  items: BinderItem[];
  onSelect: (id: string) => void;
  theme?: WorkspaceTheme;
}

interface Node {
  id: string;
  type: 'scene' | 'character' | 'location';
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

export const GraphView: React.FC<GraphViewProps> = ({ items, onSelect, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragNode = useRef<Node | null>(null);

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f9fafb' };

  // 1. Parse Data
  useEffect(() => {
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    const traverse = (itemList: BinderItem[]) => {
      itemList.forEach(item => {
        if (item.type === 'document') {
          // Add Scene Node
          newNodes.push({
            id: item.id,
            type: 'scene',
            label: item.title,
            x: width / 2 + (Math.random() - 0.5) * 200,
            y: height / 2 + (Math.random() - 0.5) * 200,
            vx: 0, vy: 0,
            radius: 8
          });

          // Add Character Nodes & Links
          item.characterData?.forEach(char => {
            let charNode = newNodes.find(n => n.id === `char-${char.name}`);
            if (!charNode) {
              charNode = {
                id: `char-${char.name}`,
                type: 'character',
                label: char.name,
                x: width / 2 + (Math.random() - 0.5) * 300,
                y: height / 2 + (Math.random() - 0.5) * 300,
                vx: 0, vy: 0,
                radius: 6
              };
              newNodes.push(charNode);
            }
            newLinks.push({ source: item.id, target: `char-${char.name}`, strength: 0.1 });
          });

          // Add Location Nodes & Links
          if (item.sceneSetting?.location) {
             const locName = item.sceneSetting.location;
             let locNode = newNodes.find(n => n.id === `loc-${locName}`);
             if (!locNode) {
                 locNode = {
                     id: `loc-${locName}`,
                     type: 'location',
                     label: locName,
                     x: width / 2 + (Math.random() - 0.5) * 300,
                     y: height / 2 + (Math.random() - 0.5) * 300,
                     vx: 0, vy: 0,
                     radius: 5
                 };
                 newNodes.push(locNode);
             }
             newLinks.push({ source: item.id, target: `loc-${locName}`, strength: 0.1 });
          }
        }
        if (item.children) traverse(item.children);
      });
    };

    traverse(items);
    setNodes(newNodes);
    setLinks(newLinks);
  }, [items]);

  // 2. Physics Simulation Loop
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      setNodes(prevNodes => {
        const nextNodes = [...prevNodes];
        
        // Repulsion (Coulomb)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const dx = nextNodes[i].x - nextNodes[j].x;
            const dy = nextNodes[i].y - nextNodes[j].y;
            const distSq = dx * dx + dy * dy || 1;
            const force = 500 / distSq;
            const fx = (dx / Math.sqrt(distSq)) * force;
            const fy = (dy / Math.sqrt(distSq)) * force;

            if (!dragNode.current || nextNodes[i].id !== dragNode.current.id) {
                nextNodes[i].vx += fx;
                nextNodes[i].vy += fy;
            }
            if (!dragNode.current || nextNodes[j].id !== dragNode.current.id) {
                nextNodes[j].vx -= fx;
                nextNodes[j].vy -= fy;
            }
          }
        }

        // Attraction (Spring)
        links.forEach(link => {
          const source = nextNodes.find(n => n.id === link.source);
          const target = nextNodes.find(n => n.id === link.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = (dist - 100) * 0.05; // Spring length 100
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!dragNode.current || source.id !== dragNode.current.id) {
                source.vx += fx;
                source.vy += fy;
            }
            if (!dragNode.current || target.id !== dragNode.current.id) {
                target.vx -= fx;
                target.vy -= fy;
            }
          }
        });

        // Center Gravity & Velocity Application
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        nextNodes.forEach(node => {
            if (dragNode.current?.id === node.id) return;

            // Pull to center
            node.vx += (centerX - node.x) * 0.005;
            node.vy += (centerY - node.y) * 0.005;

            // Apply friction
            node.vx *= 0.9;
            node.vy *= 0.9;

            // Update position
            node.x += node.vx;
            node.y += node.vy;
        });

        return nextNodes;
      });
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [links]);

  // 3. Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    ctx.save();
    // Apply Pan/Zoom
    ctx.translate(offset.x + rect.width/2, offset.y + rect.height/2);
    ctx.scale(scale, scale);
    ctx.translate(-rect.width/2, -rect.height/2);

    // Draw Links
    ctx.lineWidth = 1;
    links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = isDark ? '#4b5563' : '#e5e7eb';
            ctx.stroke();
        }
    });

    // Draw Nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        if (node.type === 'scene') ctx.fillStyle = '#6366f1'; // Indigo
        else if (node.type === 'character') ctx.fillStyle = '#10b981'; // Green
        else ctx.fillStyle = '#ef4444'; // Red

        ctx.fill();
        ctx.strokeStyle = isDark ? '#1f2937' : '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Label if hovered or large scale
        if (scale > 1.2 || node === hoveredNode) {
            ctx.fillStyle = isDark ? '#d1d5db' : '#374151';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + node.radius + 12);
        }
    });

    ctx.restore();

  }, [nodes, links, scale, offset, hoveredNode, isDark]);

  // 4. Interaction Handlers
  const getScreenCoords = (e: React.MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x - rect.width/2) / scale + rect.width/2;
      const y = (e.clientY - rect.top - offset.y - rect.height/2) / scale + rect.height/2;
      return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      const { x, y } = getScreenCoords(e);
      const clickedNode = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius + 5);
      
      if (clickedNode) {
          dragNode.current = clickedNode;
          setIsDragging(true);
      } else {
          setIsDragging(true); // Dragging canvas
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging && dragNode.current) {
          const { x, y } = getScreenCoords(e);
          dragNode.current.x = x;
          dragNode.current.y = y;
          // Zero velocity to stop swinging
          dragNode.current.vx = 0;
          dragNode.current.vy = 0;
          setNodes([...nodes]); // Trigger render
      } else if (isDragging) {
          setOffset(prev => ({
              x: prev.x + e.movementX,
              y: prev.y + e.movementY
          }));
      } else {
          // Hover detection
          const { x, y } = getScreenCoords(e);
          const found = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius + 5);
          setHoveredNode(found || null);
          if (canvasRef.current) canvasRef.current.style.cursor = found ? 'pointer' : 'default';
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      // If click (not drag), select node
      if (dragNode.current && !isDragging) {
          // Click logic
      } else if (!isDragging && hoveredNode && hoveredNode.type === 'scene') {
          onSelect(hoveredNode.id);
      }
      setIsDragging(false);
      dragNode.current = null;
  };

  return (
    <div className="relative flex-1 h-full overflow-hidden animate-in fade-in duration-500" style={containerStyle}>
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className={`p-2 rounded-lg shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-bold text-sm mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Graph View</h3>
                <div className={`flex flex-col gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Scene</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Character</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Location</div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button onClick={() => setScale(s => s * 1.2)} className={`p-2 rounded-full shadow border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}><ZoomIn size={16}/></button>
            <button onClick={() => setScale(s => s / 1.2)} className={`p-2 rounded-full shadow border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}><ZoomOut size={16}/></button>
            <button onClick={() => { setScale(1); setOffset({x:0,y:0}); }} className={`p-2 rounded-full shadow border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}><Maximize size={16}/></button>
        </div>

        <canvas 
            ref={canvasRef}
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setIsDragging(false); dragNode.current = null; }}
        />
    </div>
  );
};
