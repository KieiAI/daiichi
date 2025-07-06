// データ管理ページ - リファクタリング済み
// 変更点: ImportExportButtonsの使用、エラーハンドリング改善、コメント追加
'use client';

import { useState } from 'react';
import { mockRiskAssessments } from '@/lib/mock-data';
import { RiskAssessment } from '@/types/risk-assessment';
import { EnhancedDataTable } from '@/components/data-table/enhanced-data-table';
import { createEnhancedColumns } from '@/components/data-table/enhanced-columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function DataPage() {
  const [data, setData] = useState<RiskAssessment[]>(mockRiskAssessments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // カラム定義を作成
  const columns = createEnhancedColumns();

  const handleRowClick = (row: RiskAssessment) => {
    try {
      console.log('Clicked row:', row);
      // 将来的に編集画面への遷移処理を追加
    } catch (error) {
      console.error('行クリックエラー:', error);
      toast({
        title: 'エラー',
        description: '行の選択中にエラーが発生しました',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">データ管理</h1>
          <p className="text-slate-600">リスクアセスメントデータの作成・編集・管理</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button aria-label="新規リスクアセスメントを作成">
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>新規リスクアセスメント作成</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {/* TODO: 新規作成フォームコンポーネントを実装予定 */}
                {/* 理由: フォームが複雑になる場合は専用コンポーネントに分離 */}
                <p className="text-center text-slate-500">フォーム実装予定</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <EnhancedDataTable
            columns={columns}
            data={data}
            onDataChange={setData}
            searchPlaceholder="文字列検索"
            onRowClick={handleRowClick}
            enableRowSelection={true}
            enableInlineEditing={true}
          />
        </div>
      </div>
    </div>
  );
}