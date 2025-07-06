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
  Save, 
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskAssessment } from '@/types/risk-assessment';

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RiskAssessment[];
  onSave: (title: string) => Promise<void>;
}

export function SaveDialog({ open, onOpenChange, data, onSave }: SaveDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const { toast } = useToast();

  // デフォルトタイトルを生成
  const generateDefaultTitle = () => {
    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `リスクアセスメント - ${today}`;
  };

  // ダイアログが開かれた時にデフォルトタイトルを設定
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !title) {
      setTitle(generateDefaultTitle());
    }
    if (!newOpen) {
      // ダイアログを閉じる時にリセット
      setSaveComplete(false);
      setIsSaving(false);
    }
    onOpenChange(newOpen);
  };

  // 保存実行
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'タイトルエラー',
        description: 'タイトルを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave(title.trim(), description.trim());
      setSaveComplete(true);
      
      toast({
        title: '保存完了',
        description: `「${title}」として保存されました`,
      });
    } catch (error) {
      toast({
        title: '保存エラー',
        description: error instanceof Error ? error.message : '保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ダイアログを閉じる
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSaveComplete(false);
    setIsSaving(false);
    onOpenChange(false);
  };

  // 統計情報の計算
  const stats = {
    totalItems: data.length,
    highRisks: data.filter(item => ['V', 'IV'].includes(item.riskLevel)).length,
    recentItems: data.filter(item => {
      const itemDate = new Date(item.updatedAt || item.createdAt || '');
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Save className="h-6 w-6 text-emerald-600" />
            <span>保存</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-6">
          {/* タイトル入力 */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              タイトル <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="リスクアセスメントのタイトルを入力してください"
                className="border-gray-200 no-focus-style"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* 説明入力 */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              説明
            </Label>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="リスクアセスメントの詳細説明や目的を入力してください（任意）"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isSaving}
                rows={3}
              />
            </div>
          </div>

          {/* データプレビュー */}
          <div className="space-y-3 flex-1 overflow-hidden">
            <Label className="text-sm font-medium text-gray-700">
              データプレビュー（最新5件）
            </Label>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="max-h-48 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200">ID</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200">作業</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200">危険性・有害性</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200">リスクレベル</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200">更新日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((item, index) => (
                      <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-3 py-2 text-gray-700 font-medium">{item.id}</td>
                        <td className="px-3 py-2 text-gray-700">
                          <div className="max-w-32 truncate" title={item.work}>
                            {item.work}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          <div className="max-w-40 truncate" title={item.hazard}>
                            {item.hazard}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            item.riskLevel === 'IV' ? 'bg-red-100 text-red-800' :
                            item.riskLevel === 'III' ? 'bg-orange-100 text-orange-800' :
                            item.riskLevel === 'II' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600">
                          {item.updatedAt || item.createdAt}
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
            disabled={isSaving}
            className="px-6"
          >
            キャンセル
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>保存中...</span>
              </div>
            ) : saveComplete ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>保存完了</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>保存</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}