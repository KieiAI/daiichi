'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  ColumnSizingState,
} from '@tanstack/react-table';
import { ChevronDown, Search, Plus, Trash2, Download, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/excel-utils';
import { calculateBasicStats } from '@/lib/report-utils';
import { ImportDialog } from '@/components/data-table/import-dialog';
import { ExportDialog } from '@/components/data-table/export-dialog';
import { SaveDialog } from '@/components/data-table/save-dialog';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface EnhancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataChange?: (data: TData[]) => void;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  enableInlineEditing?: boolean;
  onSave?: () => void;
  onExecute?: () => void;
  isLoading?: boolean;
}

export function EnhancedDataTable<TData, TValue>({
  columns,
  data,
  onDataChange,
  searchPlaceholder = "検索...",
  onRowClick,
  enableRowSelection = true,
  enableInlineEditing = true,
  onSave,
  onExecute,
  isLoading = false,
}: EnhancedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [tableScale, setTableScale] = React.useState(1.0);
  const { toast } = useToast();

  // テーブルコンテナの参照
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  // 初期列幅設定
  const initialColumnSizing = React.useMemo(() => ({
    select: 40,
    id: 50,
    work: 200,
    workElement: 220,
    knowledgeFile: 140,
    hazard: 280,
    riskReduction: 280,
    measureType: 120,
    severity: 50,
    probability: 50,
    exposure: 50,
    riskScore: 60,
    riskLevel: 70,
    severityAfter: 60,
    probabilityAfter: 60,
    exposureAfter: 60,
    riskScoreAfter: 70,
    riskLevelAfter: 80,
  }), []);

  // 行選択用のカラムを追加
  const enhancedColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;
    
    const selectionColumn: ColumnDef<TData, TValue> = {
      id: 'select',
      header: ({ table }) => (
        <div className="w-10 h-full flex items-center justify-center p-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="全行選択"
            className="mx-auto scale-90"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-10 h-full flex items-center justify-center p-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="行選択"
            className="mx-auto scale-90"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: true,
      size: 40,
      minSize: 35,
      maxSize: 50,
    };
    
    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    globalFilterFn: 'includesString',
    enableRowSelection: enableRowSelection,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    initialState: {
      pagination: {
        pageSize: data.length || 1000, // 全データを表示
      },
      columnSizing: initialColumnSizing,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnSizing,
      globalFilter,
    },
  });

  // 新規行追加
  const handleAddRow = () => {
    if (!onDataChange) return;
    
    const newRow = {
      id: Math.max(...data.map((item: any) => item.id || 0)) + 1,
      work: '',
      workElement: '',
      knowledgeFile: '',
      reference: '',
      hazard: '',
      riskReduction: '',
      measureType: '管理的対策',
      severity: 1,
      probability: 1,
      exposure: 1,
      riskScore: 3,
      riskLevel: 'I',
      severityAfter: 1,
      probabilityAfter: 1,
      exposureAfter: 1,
      riskScoreAfter: 3,
      riskLevelAfter: 'I',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    } as TData;
    
    onDataChange([...data, newRow]);
    
    // 新規行追加後に表の一番下にスクロール
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({
          top: tableContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100); // DOM更新を待つため少し遅延
    
    toast({
      title: '新規行追加',
      description: '新しい行が追加されました',
    });
  };

  // 選択行削除
  const handleDeleteSelected = () => {
    if (!onDataChange) return;
    
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast({
        title: '選択エラー',
        description: '削除する行を選択してください',
        variant: 'destructive',
      });
      return;
    }

    const selectedIds = selectedRows.map(row => (row.original as any).id);
    const newData = data.filter((item: any) => !selectedIds.includes(item.id));
    
    onDataChange(newData);
    setRowSelection({});
    
    toast({
      title: '削除完了',
      description: `${selectedRows.length}行が削除されました`,
    });
  };

  // インポートダイアログからのデータ受信
  const handleImportData = (importedData: TData[]) => {
    if (onDataChange) {
      onDataChange(importedData);
    }
  };

  // 統計情報の計算
  const stats = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        totalRisks: 0,
        highRisks: 0,
        highRisksAfter: 0,
        improvementRate: 0,
        riskReductionRate: 0,
        selectedCount: 0,
        filteredCount: 0
      };
    }

    const basicStats = calculateBasicStats(data as any[]);
    const selectedCount = table.getFilteredSelectedRowModel().rows.length;
    const filteredCount = table.getFilteredRowModel().rows.length;

    return {
      ...basicStats,
      selectedCount,
      filteredCount
    };
  }, [data, table]);

  // テーブルサイズ変更
  const handleZoomIn = () => {
    setTableScale(prev => Math.min(3.0, prev + 0.1));
  };

  const handleZoomOut = () => {
    setTableScale(prev => Math.max(0.3, prev - 0.1));
  };

  const resetZoom = () => {
    setTableScale(1.0);
  };

  // 保存処理
  const handleSaveWithTitle = async (title: string) => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ツールバー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="文字列検索"
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10 no-focus-style"
            />
          </div>
        </div>
        

      {/* インポートダイアログ */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportData}
      />

      {/* エクスポートダイアログ */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={data as any[]}
        selectedData={table.getFilteredSelectedRowModel().rows.length > 0 
          ? table.getFilteredSelectedRowModel().rows.map(row => row.original) as any[]
          : undefined
        }
      />

      {/* 保存ダイアログ */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        data={data as any[]}
        onSave={handleSaveWithTitle}
      />
        <div className="flex items-center space-x-2">
          {/* データ操作ボタン */}
          {/* 選択行削除ボタン（チェックが入っている場合のみ表示） */}
          {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={!onDataChange}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              選択行削除
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            disabled={!onDataChange}
            className="h-8 w-8 p-0"
            title="インポート"
          >
            <Upload className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="h-8 w-8 p-0"
            title="エクスポート"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* シートサイズ変更ボタン */}
          <div className="flex items-center space-x-1 border border-gray-200 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={tableScale <= 0.3}
              className="h-8 w-8 p-0 rounded-none border-r border-gray-200"
              title="シートを縮小"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="h-8 px-2 rounded-none text-xs font-mono min-w-12"
              title="サイズをリセット"
            >
              {Math.round(tableScale * 100)}%
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={tableScale >= 3.0}
              className="h-8 w-8 p-0 rounded-none border-l border-gray-200"
              title="シートを拡大"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={!onDataChange}
          >
            <Plus className="mr-2 h-4 w-4" />
            新規行追加
          </Button>

          {/* 列表示切り替え */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                列表示 <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  // カラムIDを日本語名にマッピング
                  const getColumnLabel = (columnId: string) => {
                    const labelMap: Record<string, string> = {
                      'id': 'ID',
                      'work': '作業',
                      'workElement': '作業要素',
                      'knowledgeFile': '使用ナレッジファイル名',
                      'knowledgeFile': '参照',
                      'hazard': '危険性・有害性',
                      'riskReduction': 'リスク低減措置',
                      'measureType': '対策分類',
                      'severity': '重篤度',
                      'probability': '発生確率',
                      'exposure': '暴露頻度',
                      'riskScore': 'リスク点数',
                      'riskLevel': 'リスクレベル',
                      'severityAfter': '低減後重篤度',
                      'probabilityAfter': '低減後発生確率',
                      'exposureAfter': '低減後暴露頻度',
                      'riskScoreAfter': '低減後リスク点数',
                      'riskLevelAfter': '低減後リスクレベル',
                    };
                    return labelMap[columnId] || columnId;
                  };

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {getColumnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 実行・保存ボタン */}
          {(onSave || onExecute) && (
            <>
              {onSave && (
                <Button
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  保存
                </Button>
              )}
              
              {onExecute && (
                <Button
                  onClick={onExecute}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      実行中...
                    </div>
                  ) : (
                    '実行'
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* テーブル */}
      <div 
        ref={tableContainerRef}
        className="rounded-md border overflow-auto max-h-[calc(100vh-300px)]"
      >
        <div 
          className="transition-all duration-200"
          style={{ 
            transform: `scale(${tableScale})`,
            transformOrigin: 'top left',
            width: `${100 / tableScale}%`
          }}
        >
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className={`border-r border-gray-200 last:border-r-0 relative bg-white ${
                        header.column.id === 'select' ? 'p-0 w-10' : ''
                      }`}
                      style={{ 
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-blue-500 transition-colors ${
                              header.column.getIsResizing() ? 'bg-blue-500' : ''
                            }`,
                            style: {
                              transform: 'translateX(50%)',
                            },
                          }}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`
                    ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    ${row.getIsSelected() ? "bg-blue-50" : ""}
                  `}
                  onClick={() => {
                    if (onRowClick && !row.getIsSelected()) {
                      onRowClick(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={`border-r border-gray-200 last:border-r-0 ${
                        cell.column.id === 'select' ? 'p-0 w-10' : 'p-0'
                      }`}
                      style={{ 
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={enhancedColumns.length}
                  className="h-24 text-center"
                >
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} 行選択中
            </>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          全 {table.getFilteredRowModel().rows.length} 行を表示中
        </div>
      </div>
    </div>
  );
}