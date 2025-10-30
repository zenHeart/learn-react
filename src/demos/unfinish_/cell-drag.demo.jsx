import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 重构示例：演示可缩放/平移画布上的“单元格拖曳（网格内换位）”功能
 * 特性:
 * 1. 画布平移 (鼠标中键 / 按住空格 + 左键拖动)
 * 2. 滚轮缩放 (居中缩放)
 * 3. 单元格拖曳：拖动单元格到其它网格时自动与目标位置交换
 * 4. 自动吸附到网格
 */
const CellDragDemo = () => {
  // 画布视口
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // 网格 & 单元格
  const CELL_SIZE = 60;
  const ROWS = 20;
  const COLS = 30;

  // 初始化单元格 (行列布局)
  const [cells, setCells] = useState(() => {
    const arr = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        arr.push({
          id: `cell-${r}-${c}`,
            row: r,
            col: c,
            label: `${r},${c}`,
            color: `hsl(${(r * 17 + c * 11) % 360} 70% 70%)`
        });
      }
    }
    return arr;
  });

  // 拖拽状态
  const [draggingId, setDraggingId] = useState(null);
  const dragOriginalRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 }); // 指针在单元格内部的偏移
  const [hoverTarget, setHoverTarget] = useState(null); // 当前指向的目标位置(row,col)

  // 快速索引
  const cellMapRef = useRef(new Map());
  useEffect(() => {
    const m = new Map();
    cells.forEach(c => {
      m.set(`${c.row}-${c.col}`, c);
    });
    cellMapRef.current = m;
  }, [cells]);

  // 将屏幕坐标转换为“世界坐标”
  const screenToWorld = useCallback((clientX, clientY) => {
    return {
      x: (clientX - viewport.x) / viewport.zoom,
      y: (clientY - viewport.y) / viewport.zoom
    };
  }, [viewport]);

  // 计算鼠标所在网格行列
  const worldToGrid = useCallback((wx, wy) => {
    return {
      row: Math.max(0, Math.min(ROWS - 1, Math.floor(wy / CELL_SIZE))),
      col: Math.max(0, Math.min(COLS - 1, Math.floor(wx / CELL_SIZE)))
    };
  }, []);

  // 开始平移
  const beginPan = useCallback((e) => {
    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX - viewport.x,
      y: e.clientY - viewport.y
    };
  }, [viewport]);

  // PointerDown
  const handlePointerDown = useCallback((e) => {
    const isMiddle = e.button === 1;
    const isSpace = e.button === 0 && (e.nativeEvent instanceof PointerEvent) && (e.getModifierState && e.getModifierState('Space'));
    if (isMiddle || isSpace) {
      beginPan(e);
      return;
    }
  }, [beginPan]);

  // 单元格按下
  const handleCellPointerDown = useCallback((e, cell) => {
    // 仅左键
    if (e.button !== 0) return;
    e.stopPropagation();
    setDraggingId(cell.id);
    dragOriginalRef.current = { row: cell.row, col: cell.col };
    const world = screenToWorld(e.clientX, e.clientY);
    dragOffsetRef.current = {
      x: world.x - cell.col * CELL_SIZE,
      y: world.y - cell.row * CELL_SIZE
    };
  }, [screenToWorld]);

  // PointerMove
  const handlePointerMove = useCallback((e) => {
    if (isPanningRef.current) {
      setViewport(prev => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      }));
      return;
    }
    if (!draggingId) return;

    const world = screenToWorld(e.clientX, e.clientY);
    const rawX = world.x - dragOffsetRef.current.x + CELL_SIZE / 2;
    const rawY = world.y - dragOffsetRef.current.y + CELL_SIZE / 2;
    const { row, col } = worldToGrid(rawX, rawY);
    setHoverTarget({ row, col });

    // 实时预览：更新该 cell 的 row/col（不做交换，仅移动显示）
    setCells(prev =>
      prev.map(c => {
        if (c.id !== draggingId) return c;
        return { ...c, row, col };
      })
    );
  }, [draggingId, screenToWorld, worldToGrid]);

  // PointerUp
  const handlePointerUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    if (!draggingId) return;

    setCells(prev => {
      const draggingCell = prev.find(c => c.id === draggingId);
      if (!draggingCell) return prev;
      const occupied = prev.filter(c => c.id !== draggingId)
        .find(c => c.row === draggingCell.row && c.col === draggingCell.col);

      const originalPos = dragOriginalRef.current;

      // 若目标位置已有其他单元格 -> 交换
      if (occupied && originalPos) {
        return prev.map(c => {
          if (c.id === draggingId) {
            return { ...c, row: occupied.row, col: occupied.col };
          }
          if (c.id === occupied.id) {
            return { ...c, row: originalPos.row, col: originalPos.col };
          }
          return c;
        });
      }
      // 未占用则保持新位置
      return prev;
    });

    setDraggingId(null);
    setHoverTarget(null);
    dragOriginalRef.current = null;
  }, [draggingId]);

  // 取消 (离开画布)
  const handleLeave = useCallback(() => {
    if (draggingId) {
      // 回退
      const originalPos = dragOriginalRef.current;
      if (originalPos) {
        setCells(prev =>
          prev.map(c => {
            if (c.id !== draggingId) return c;
            return {
              ...c,
              row: originalPos.row,
              col: originalPos.col
            };
          })
        );
      }
    }
    setDraggingId(null);
    setHoverTarget(null);
    setHoverTarget(null);
  }, [draggingId]);

  // 滚轮缩放（居中缩放）
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const { clientX, clientY, deltaY } = e;
    const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
    setViewport(prev => {
      const newZoom = Math.max(0.3, Math.min(2.5, prev.zoom * zoomFactor));
      // 以鼠标位置为中心缩放的平移修正
      const worldBefore = {
        x: (clientX - prev.x) / prev.zoom,
        y: (clientY - prev.y) / prev.zoom
      };
      const newX = clientX - worldBefore.x * newZoom;
      const newY = clientY - worldBefore.y * newZoom;
      return { x: newX, y: newY, zoom: newZoom };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[800px] overflow-hidden bg-slate-100 select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handleLeave}
      onWheel={handleWheel}
    >
      {/* Canvas 内容 */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: COLS * CELL_SIZE,
          height: ROWS * CELL_SIZE,
          position: 'relative',
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          backgroundImage:
            'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)'
        }}
      >
        {cells.map(cell => {
          return (
            <div
              key={cell.id}
              onPointerDown={(e) => handleCellPointerDown(e, cell)}
              className={`absolute rounded-sm flex items-center justify-center font-mono text-[11px] cursor-grab
                ${draggingId === cell.id ? 'ring-2 ring-blue-500 cursor-grabbing' : 'hover:ring-2 hover:ring-blue-300'}
              `}
              style={{
                left: cell.col * CELL_SIZE,
                top: cell.row * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: cell.color,
                transition: draggingId === cell.id ? 'none' : 'transform 120ms',
                boxShadow: draggingId === cell.id ? '0 4px 10px rgba(0,0,0,0.25)' : '0 1px 2px rgba(0,0,0,0.15)'
              }}
            >
              {cell.label}
            </div>
          );
        })}

        {/* 目标高亮框 */}
        {hoverTarget && draggingId && (
          <div
            className="absolute pointer-events-none border-2 border-red-500"
            style={{
              left: hoverTarget.col * CELL_SIZE,
              top: hoverTarget.row * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            }}
          />
        )}
      </div>

      {/* 操作提示 */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-2 rounded shadow text-xs space-y-1">
        <div>左键拖动单元格：移动或交换位置</div>
        <div>滚轮：缩放</div>
        <div>中键或空格 + 左键：平移画布</div>
      </div>
    </div>
  );
};

CellDragDemo.meta = { disableSandpack: true };
export default CellDragDemo;
