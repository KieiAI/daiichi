// データテーブルカラム定義 - リファクタリング済み
// 変更点: SortableHeaderコンポーネントの使用、エラーハンドリング改善
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { RiskAssessment } from '@/types/risk-assessment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableHeader } from '@/components/data-table/sortable-header';
import { getRiskLevelColor } from '@/lib/risk-calculations';

// リスクレベルバッジコンポーネント（メモ化対象）
function RiskLevelBadge({ level }: { level: string }) {
  const color = getRiskLevelColor(level);
  return (
    <Badge
      variant="outline"
      style={{ borderColor: color, color: color }}
      className="font-medium"
    >
      {level}
    </Badge>
  );
}

// セルの安全な表示コンポーネント
function SafeCell({ value, maxWidth = 150, title }: { 
  value: string; 
  maxWidth?: number; 
  title?: string; 
}) {
  return (
    <div 
      className="truncate" 
      style={{ maxWidth: maxWidth }}
      title={title || value}
    >
      {value || '-'}
    </div>
  );
}

export const columns: ColumnDef<RiskAssessment>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <SortableHeader column={column}>
        ID
      </SortableHeader>
    ),
    cell: ({ row }) => <div className="w-[60px]">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'work',
    header: ({ column }) => (
      <SortableHeader column={column}>
        作業
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <SafeCell value={row.getValue('work')} maxWidth={150} />
    ),
  },
  {
    accessorKey: 'workElement',
    header: '作業要素',
    cell: ({ row }) => (
      <SafeCell value={row.getValue('workElement')} maxWidth={200} />
    ),
  },
  {
    accessorKey: 'knowledgeFile',
    header: '使用ナレッジファイル名',
    cell: ({ row }) => (
      <SafeCell value={row.getValue('knowledgeFile')} maxWidth={180} />
    ),
  },
  {
    accessorKey: 'hazard',
    header: '危険性・有害性',
    cell: ({ row }) => (
      <SafeCell value={row.getValue('hazard')} maxWidth={250} />
    ),
  },
  {
    accessorKey: 'riskReduction',
    header: 'リスク低減措置',
    cell: ({ row }) => (
      <SafeCell value={row.getValue('riskReduction')} maxWidth={250} />
    ),
  },
  {
    accessorKey: 'measureType',
    header: '対策分類',
    cell: ({ row }) => (
      <div className="min-w-[80px]">
        <Badge variant="secondary" className="whitespace-nowrap">
        {row.getValue('measureType') || '未分類'}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'severity',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          重篤度
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('severity')}
      </div>
    ),
  },
  {
    accessorKey: 'probability',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          発生確率
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('probability')}
      </div>
    ),
  },
  {
    accessorKey: 'exposure',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          暴露頻度
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('exposure')}
      </div>
    ),
  },
  {
    accessorKey: 'riskScore',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          リスク点数
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('riskScore')}
      </div>
    ),
  },
  {
    accessorKey: 'riskLevel',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          リスクレベル
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <RiskLevelBadge level={row.getValue('riskLevel')} />
      </div>
    ),
  },
  {
    accessorKey: 'severityAfter',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          低減後重篤度
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('severityAfter')}
      </div>
    ),
  },
  {
    accessorKey: 'probabilityAfter',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          低減後発生確率
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('probabilityAfter')}
      </div>
    ),
  },
  {
    accessorKey: 'exposureAfter',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          低減後暴露頻度
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('exposureAfter')}
      </div>
    ),
  },
  {
    accessorKey: 'riskScoreAfter',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          低減後リスク点数
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('riskScoreAfter')}
      </div>
    ),
  },
  {
    accessorKey: 'riskLevelAfter',
    header: ({ column }) => (
      <SortableHeader column={column} className="writing-mode-vertical">
        <div className="writing-mode-vertical text-center min-h-[200px] flex items-center justify-center">
          低減後リスクレベル
        </div>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <RiskLevelBadge level={row.getValue('riskLevelAfter')} />
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const assessment = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              aria-label={`ID ${assessment.id}のアクションメニュー`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('詳細表示:', assessment)}>
              詳細表示
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('編集:', assessment)}>
              編集
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => console.log('削除:', assessment)}
            >
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];