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
import { EditableCell } from '@/components/data-table/editable-cell';
import { getRiskLevelColor } from '@/lib/risk-calculations';

// リスクレベルバッジコンポーネント
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

// 編集可能なカラム定義を作成する関数
export function createEnhancedColumns(
  onDataUpdate?: (id: number, field: keyof RiskAssessment, value: string | number) => void
): ColumnDef<RiskAssessment>[] {
  
  const measureTypeOptions = ['設計時対策', '工学的対策', '管理的対策', '個人用保護具'];
  const riskLevelOptions = ['I', 'II', 'III', 'IV'];

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          ID
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-full h-full flex items-center justify-center p-2 font-medium">
          {row.getValue('id')}
        </div>
      ),
      size: 50,
      minSize: 40,
      maxSize: 80,
      enableResizing: true,
    },
    {
      accessorKey: 'work',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          作業
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('work')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'work', value)}
          type="textarea"
          className="min-w-[150px]"
        />
      ),
      size: 200,
      minSize: 150,
      maxSize: 350,
      enableResizing: true,
    },
    {
      accessorKey: 'workElement',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          作業要素
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('workElement')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'workElement', value)}
          type="textarea"
          className="min-w-[200px]"
        />
      ),
      size: 220,
      minSize: 180,
      maxSize: 400,
      enableResizing: true,
    },
    {
      accessorKey: 'knowledgeFile',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          参照
        </div>
      ),
      cell: ({ row }) => (
        <div className="p-2">
          <div className="text-xs break-words whitespace-normal leading-tight">
            {row.getValue('knowledgeFile') || '-'}
          </div>
        </div>
      ),
      size: 140,
      minSize: 120,
      maxSize: 220,
      enableResizing: true,
    },
    {
      accessorKey: 'hazard',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          危険性・有害性
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('hazard')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'hazard', value)}
          type="textarea"
          className="min-w-[250px]"
        />
      ),
      size: 280,
      minSize: 220,
      maxSize: 450,
      enableResizing: true,
    },
    {
      accessorKey: 'riskReduction',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          リスク低減措置
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('riskReduction')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'riskReduction', value)}
          type="textarea"
          className="min-w-[250px]"
        />
      ),
      size: 280,
      minSize: 220,
      maxSize: 450,
      enableResizing: true,
    },
    {
      accessorKey: 'measureType',
      header: ({ column }) => (
        <div className="flex items-center justify-center h-36 p-2 text-center">
          対策分類
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-2 text-center">
          <EditableCell
            value={row.getValue('measureType')}
            onSave={(value) => onDataUpdate?.(row.original.id, 'measureType', value)}
            type="select"
            options={measureTypeOptions}
            className="min-w-[120px] text-center"
          />
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 160,
      enableResizing: true,
    },
    {
      accessorKey: 'severity',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          重篤度
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('severity')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'severity', value)}
          type="number"
          className="text-center font-medium flex items-center justify-center"
        />
      ),
      size: 50,
      minSize: 40,
      maxSize: 70,
      enableResizing: true,
    },
    {
      accessorKey: 'probability',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          発生確率
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('probability')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'probability', value)}
          type="number"
          className="text-center font-medium flex items-center justify-center"
        />
      ),
      size: 50,
      minSize: 40,
      maxSize: 70,
      enableResizing: true,
    },
    {
      accessorKey: 'exposure',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          暴露頻度
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('exposure')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'exposure', value)}
          type="number"
          className="text-center font-medium flex items-center justify-center"
        />
      ),
      size: 50,
      minSize: 40,
      maxSize: 70,
      enableResizing: true,
    },
    {
      accessorKey: 'riskScore',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          リスク点数
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium p-2 flex items-center justify-center">
          {row.getValue('riskScore')}
        </div>
      ),
      size: 60,
      minSize: 50,
      maxSize: 80,
      enableResizing: true,
    },
    {
      accessorKey: 'riskLevel',
      header: ({ column }) => (
        <div className="h-36 flex items-center justify-center">
          <div className="writing-mode-vertical">
            リスクレベル
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center p-2 flex items-center justify-center">
          <RiskLevelBadge level={row.getValue('riskLevel')} />
        </div>
      ),
      size: 70,
      minSize: 60,
      maxSize: 100,
      enableResizing: true,
    },
    {
      accessorKey: 'severityAfter',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          低減後重篤度
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('severityAfter')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'severityAfter', value)}
          type="number"
          className="text-center font-medium flex items-center justify-center"
        />
      ),
      size: 60,
      minSize: 50,
      maxSize: 80,
      enableResizing: true,
    },
    {
      accessorKey: 'probabilityAfter',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          低減後発生確率
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('probabilityAfter')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'probabilityAfter', value)}
          type="number"
          className="text-center font-medium flex items-center justify-center"
        />
      ),
      size: 60,
      minSize: 50,
      maxSize: 80,
      enableResizing: true,
    },
    {
      accessorKey: 'exposureAfter',
      header: ({ column }) => (
        <div className="writing-mode-vertical text-center h-36 flex items-center justify-center">
          低減後暴露頻度
        </div>
      ),
      cell: ({ row }) => (
        <EditableCell
          value={row.getValue('exposureAfter')}
          onSave={(value) => onDataUpdate?.(row.original.id, 'exposureAfter', value)}
          type="number"
          className="text-center font-medium flex items-center justify-center"
        />
      ),
      size: 60,
      minSize: 50,
      maxSize: 80,
      enableResizing: true,
    },
    {
      accessorKey: 'riskScoreAfter',
      header: ({ column }) => (
        <div className="h-36 flex items-center justify-center">
          <div className="writing-mode-vertical">
            低減後リスク点数
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium p-2 flex items-center justify-center">
          {row.getValue('riskScoreAfter')}
        </div>
      ),
      size: 70,
      minSize: 60,
      maxSize: 90,
      enableResizing: true,
    },
    {
      accessorKey: 'riskLevelAfter',
      header: ({ column }) => (
        <div className="h-36 flex items-center justify-center">
          <div className="writing-mode-vertical">
            低減後リスクレベル
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center p-2 flex items-center justify-center">
          <RiskLevelBadge level={row.getValue('riskLevelAfter')} />
        </div>
      ),
      size: 80,
      minSize: 70,
      maxSize: 110,
      enableResizing: true,
    },
  ];
}