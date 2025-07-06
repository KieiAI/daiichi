// ソート可能なヘッダーコンポーネント
// 変更理由: 重複するソートヘッダーロジックの抽象化
'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Column } from '@tanstack/react-table';

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader<TData>({ 
  column, 
  children, 
  className = "" 
}: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className={className}
      aria-label={`${children}でソート`}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}