'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Download, 
  FileSpreadsheet, 
  CheckCircle,
  Loader2,
  X,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/excel-utils';
import { RiskAssessment } from '@/types/risk-assessment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getRiskLevelColor } from '@/lib/risk-calculations';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RiskAssessment[];
  selectedData?: RiskAssessment[];
}

export function ExportDialog({ open, onOpenChange, data, selectedData }: ExportDialogProps) {
  const [fileName, setFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const { toast } = useToast();

  // デフォルトファイル名を生成
  const generateDefaultFileName = () => {
    const today = new Date().toISOString().split('T')[0];
    const dataType = selectedData && selectedData.length > 0 ? '選択データ' : '全データ';
    return `リスクアセスメント_${dataType}_${today}`;
  };

  // ダイアログが開かれた時にデフォルトファイル名を設定
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !fileName) {
      setFileName(generateDefaultFileName());
    }
    if (!newOpen) {
      // ダイアログを閉じる時にリセット
      setExportComplete(false);
      setIsExporting(false);
    }
    onOpenChange(newOpen);
  };

  // エクスポート実行
  const handleExport = async () => {
    if (!fileName.trim()) {
      toast({
        title: 'ファイル名エラー',
        description: 'ファイル名を入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = selectedData && selectedData.length > 0 ? selectedData : data;
      const fullFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      
      await exportToExcel(exportData, fullFileName);
      
      setExportComplete(true);
      
      toast({
        title: 'エクスポート完了',
        description: `${exportData.length}件のデータがエクスポートされました`,
      });
    } catch (error) {
      toast({
        title: 'エクスポートエラー',
        description: error instanceof Error ? error.message : 'エクスポートに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ダイアログを閉じる
  const handleClose = () => {
    setFileName('');
    setExportComplete(false);
    setIsExporting(false);
    onOpenChange(false);
  };

  const exportDataCount = selectedData && selectedData.length > 0 ? selectedData.length : data.length;
  const exportDataType = selectedData && selectedData.length > 0 ? '選択されたデータ' : '全データ';
  const previewData = selectedData && selectedData.length > 0 ? selectedData : data;

  // リスクレベルバッジコンポーネント
  const RiskLevelBadge = ({ level }: { level: string }) => {
    const color = getRiskLevelColor(level);
    return (
      <Badge
        variant="outline"
        style={{ borderColor: color, color: color }}
        className="font-medium text-xs"
      >
        {level}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Download className="h-6 w-6 text-green-600" />
            <span>データエクスポート</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-6">
          {/* ファイル名入力 */}
          <div className="space-y-3">
            <Label htmlFor="filename" className="text-sm font-medium text-gray-700">
              ファイル名
            </Label>
            <div className="relative">
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="ファイル名を入力してください"
                className="pr-16 border-gray-200 no-focus-style"
                disabled={isExporting}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                .xlsx
              </div>
            </div>
          </div>

          {/* テーブルプレビュー */}
          <div className="space-y-3 flex-1 overflow-hidden">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">
                プレビュー
              </Label>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex-1">
              <div className="h-96 overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 min-w-12">ID</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 min-w-32">作業</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 min-w-40">作業要素</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 min-w-48">危険性・有害性</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 min-w-48">リスク低減措置</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 min-w-24">対策分類</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-16">重篤度</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-16">発生確率</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-16">暴露頻度</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-20">リスクスコア</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-20">リスクレベル</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-16">低減後重篤度</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-16">低減後発生確率</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-16">低減後暴露頻度</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-20">低減後リスクスコア</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-20">低減後リスクレベル</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, index) => (
                        <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-3 py-2 text-gray-700 font-medium">{item.id}</td>
                          <td className="px-3 py-2 text-gray-700">
                            <div className="max-w-32 truncate" title={item.work}>
                              {item.work}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            <div className="max-w-40 truncate" title={item.workElement}>
                              {item.workElement}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            <div className="max-w-48 truncate" title={item.hazard}>
                              {item.hazard}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            <div className="max-w-48 truncate" title={item.riskReduction}>
                              {item.riskReduction}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {item.measureType}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.severity}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.probability}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.exposure}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.riskScore}</td>
                          <td className="px-3 py-2 text-center">
                            <RiskLevelBadge level={item.riskLevel} />
                          </td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.severityAfter}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.probabilityAfter}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.exposureAfter}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-700">{item.riskScoreAfter}</td>
                          <td className="px-3 py-2 text-center">
                            <RiskLevelBadge level={item.riskLevelAfter} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        </div>

        {/* フッターボタン */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
            className="px-6"
          >
            キャンセル
          </Button>
          
          <Button
            onClick={handleExport}
            disabled={isExporting || !fileName.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-6"
          >
            {isExporting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>エクスポート中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>エクスポート</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}