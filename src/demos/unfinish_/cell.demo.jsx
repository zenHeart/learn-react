
import { useState, useRef } from 'react';

// 最简 Excel 下拉填充 demo
const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 50;

function createCells() {
  const arr = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      arr.push({
        id: `cell-${r}-${c}`,
        row: r,
        col: c,
        value: '',
      });
    }
  }
  return arr;
}

const ExcelFillDemo = () => {
  const [cells, setCells] = useState(createCells);
  // 支持单选和区域选中
  // {startRow, endRow, startCol, endCol}
  const [selected, setSelected] = useState({ startRow: 0, endRow: 0, startCol: 0, endCol: 0 });
  // 填充区域，支持纵横拖动
  // {type: 'row'|'col', startRow, endRow, startCol, endCol}
  const [fillRange, setFillRange] = useState(null);
  const draggingFill = useRef(false);

  // 获取单元格内容
  function getCell(row, col) {
    return cells.find(c => c.row === row && c.col === col);
  }

  // 选中单元格（单选）
  function handleCellClick(row, col) {
    setSelected({ startRow: row, endRow: row, startCol: col, endCol: col });
    setFillRange(null);
  }

  // 填充柄按下（统一用Pointer事件，兼容所有设备）
  function handleFillPointerDown(e) {
    e.stopPropagation();
    draggingFill.current = true;
    setFillRange({
      type: null,
      startRow: selected.startRow,
      endRow: selected.startRow,
      startCol: selected.startCol,
      endCol: selected.startCol
    });
    document.body.style.cursor = 'crosshair';
    window.addEventListener('pointermove', handleFillPointerMove);
    window.addEventListener('pointerup', handleFillPointerUp, { once: true });
    window.addEventListener('pointercancel', handleFillPointerUp, { once: true });
  }

  // 填充拖动
  function handleFillPointerMove(e) {
    const grid = document.querySelector('.excel-grid');
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let row = Math.floor(y / CELL_SIZE);
    let col = Math.floor(x / CELL_SIZE);
    row = Math.max(0, Math.min(ROWS - 1, row));
    col = Math.max(0, Math.min(COLS - 1, col));
    setFillRange(fr => {
      if (!fr) return null;
      // 判断拖动方向
      const dr = Math.abs(row - fr.startRow);
      const dc = Math.abs(col - fr.startCol);
      if (dr >= dc) {
        // 纵向拖动
        return {
          type: 'col',
          startRow: fr.startRow,
          endRow: row,
          startCol: fr.startCol,
          endCol: fr.startCol
        };
      } else {
        // 横向拖动
        return {
          type: 'row',
          startRow: fr.startRow,
          endRow: fr.startRow,
          startCol: fr.startCol,
          endCol: col
        };
      }
    });
  }

  // 填充释放
  function handleFillPointerUp() {
    if (!fillRange) {
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handleFillPointerMove);
      return;
    }
    let value = '';
    let updateCells = cells;
    let newSelected = selected;
    if (fillRange.type === 'col') {
      // 纵向填充
      const { startRow, endRow, startCol } = fillRange;
      const from = Math.min(startRow, endRow);
      const to = Math.max(startRow, endRow);
      if (from !== to) {
        value = getCell(startRow, startCol)?.value || '';
        updateCells = cells.map(cell => {
          if (cell.col === startCol && cell.row >= from && cell.row <= to) {
            return { ...cell, value };
          }
          return cell;
        });
        newSelected = { startRow: from, endRow: to, startCol, endCol: startCol };
      }
    } else if (fillRange.type === 'row') {
      // 横向填充
      const { startRow, startCol, endCol } = fillRange;
      const from = Math.min(startCol, endCol);
      const to = Math.max(startCol, endCol);
      if (from !== to) {
        value = getCell(startRow, startCol)?.value || '';
        updateCells = cells.map(cell => {
          if (cell.row === startRow && cell.col >= from && cell.col <= to) {
            return { ...cell, value };
          }
          return cell;
        });
        newSelected = { startRow, endRow: startRow, startCol: from, endCol: to };
      }
    }
    setCells(updateCells);
    setSelected(newSelected);
    setFillRange(null);
    draggingFill.current = false;
    document.body.style.cursor = '';
    window.removeEventListener('pointermove', handleFillPointerMove);
  }

  // 编辑单元格内容
  function handleInputChange(e, row, col) {
    const val = e.target.value;
    setCells(prev => prev.map(cell => {
      if (cell.row === row && cell.col === col) {
        return { ...cell, value: val };
      }
      return cell;
    }));
  }

  return (
    <div className="relative w-full h-[800px] bg-slate-100 flex flex-col items-center justify-center select-none">
      <div
        className="excel-grid"
        style={{
          position: 'relative',
          width: COLS * CELL_SIZE,
          height: ROWS * CELL_SIZE,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        {cells.map(cell => {
          // 判断是否在选区
          const inSelected = cell.row >= selected.startRow && cell.row <= selected.endRow && cell.col >= selected.startCol && cell.col <= selected.endCol;
          // 填充区域高亮
          let isFill = false;
          if (fillRange) {
            if (fillRange.type === 'col' && cell.col === fillRange.startCol) {
              const from = Math.min(fillRange.startRow, fillRange.endRow);
              const to = Math.max(fillRange.startRow, fillRange.endRow);
              isFill = cell.row >= from && cell.row <= to;
            } else if (fillRange.type === 'row' && cell.row === fillRange.startRow) {
              const from = Math.min(fillRange.startCol, fillRange.endCol);
              const to = Math.max(fillRange.startCol, fillRange.endCol);
              isFill = cell.col >= from && cell.col <= to;
            }
          }
          return (
            <div
              key={cell.id}
              className="absolute border border-slate-300 bg-white flex items-center justify-center"
              style={{
                left: cell.col * CELL_SIZE,
                top: cell.row * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                zIndex: inSelected ? 2 : 1,
                boxSizing: 'border-box',
                outline: inSelected ? '2px solid #3b82f6' : isFill ? '2px solid #f59e42' : 'none',
                background: isFill ? '#fef3c7' : 'white',
              }}
              onClick={() => handleCellClick(cell.row, cell.col)}
            >
              <input
                type="text"
                value={cell.value}
                onChange={e => handleInputChange(e, cell.row, cell.col)}
                style={{
                  width: '80%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  textAlign: 'center',
                }}
                onPointerDown={e => e.stopPropagation()}
              />
              {/* 填充柄 */}
              {inSelected && selected.startRow === selected.endRow && selected.startCol === selected.endCol && (
                <div
                  onPointerDown={handleFillPointerDown}
                  style={{
                    position: 'absolute',
                    right: 2,
                    bottom: 2,
                    width: 10,
                    height: 10,
                    background: '#3b82f6',
                    borderRadius: 2,
                    cursor: 'crosshair',
                    zIndex: 3,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-slate-600">选中单元格右下角拖动可纵向/横向填充（仅复制内容）</div>
    </div>
  );
};

ExcelFillDemo.meta = { disableSandpack: true };
export default ExcelFillDemo;
