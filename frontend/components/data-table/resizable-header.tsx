'use client';

import { useState, useRef, useCallback } from 'react';
import { Column } from '@tanstack/react-table';

interface ResizableHeaderProps<TData> {
  column: Column<TData, unknown>;
  children: React.ReactNode;
  className?: string;
}

export function ResizableHeader<TData>({ 
  column, 
  children, 
  className = "" 
}: ResizableHeaderProps<TData>) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = column.getSize();

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(50, startWidthRef.current + diff);
      column.setSize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [column]);

  return (
    <div className={`relative ${className}`} style={{ width: column.getSize() }}>
      <div className="flex items-center justify-center h-full">
        {children}
      </div>
      <div
        className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 ${
          isResizing ? 'bg-blue-500' : 'bg-transparent'
        }`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}