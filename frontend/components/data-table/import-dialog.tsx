'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskAssessment } from '@/types/risk-assessment';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: RiskAssessment[]) => void;
}

interface FilePreview {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  data?: RiskAssessment[];
  error?: string;
  file: File;
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [textInput, setTextInput] = useState('');
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 複数PDFファイル選択処理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);

    try {
      const newPreviews: FilePreview[] = [];

      for (const file of files) {
        const preview: FilePreview = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
        };

        try {
          // PDFファイルのみ受け入れ
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            preview.content = `PDFファイル（${Math.round(file.size / 1024)}KB）`;
          } else {
            preview.error = 'PDFファイルのみアップロード可能です';
          }
        } catch (error) {
          preview.error = error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました';
        }

        newPreviews.push(preview);
      }

      setFilePreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      toast({
        title: 'ファイル読み込みエラー',
        description: error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ファイル削除
  const handleRemoveFile = (id: string) => {
    setFilePreviews(prev => prev.filter(file => file.id !== id));
  };

  // 全ファイル削除
  const handleRemoveAllFiles = () => {
    setFilePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ファイルサイズのフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // PDFファイルアイコン
  const getPDFIcon = () => (
    <FileText className="h-5 w-5 text-blue-600" />
  );

  // 作業と作業要素に分解（PDFファイルとテキストから）
  const handleDecompose = () => {
    // テキストファイルやテキスト入力から抽出したコンテンツを使用
    const textContents: string[] = [];
    const pdfFiles: File[] = [];
    
    // テキスト入力
    if (textInput.trim()) {
      textContents.push(textInput.trim());
    }
    
    // PDFファイルの収集
    filePreviews.forEach(preview => {
      if (!preview.error && (preview.file.type === 'application/pdf' || preview.file.name.toLowerCase().endsWith('.pdf'))) {
        pdfFiles.push(preview.file);
      }
    });

    if (textContents.length === 0 && pdfFiles.length === 0) {
      toast({
        title: '分析できるデータがありません',
        description: 'テキストを入力するか、PDFファイルを選択してください',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'AI分析開始',
      description: `${pdfFiles.length}個のPDFファイルとテキストを分析しています...`,
      variant: 'default',
    });
    
    // 模擬的なAI分析処理
    setTimeout(() => {
      const mockData: RiskAssessment[] = [];
      
      // PDFファイルごとに複数の作業項目を生成
      pdfFiles.forEach((file, fileIndex) => {
        const baseId = Date.now() + fileIndex * 1000;
        
        // 各PDFから2-3個の作業項目を生成
        const itemsPerFile = Math.floor(Math.random() * 2) + 2; // 2-3個
        
        for (let i = 0; i < itemsPerFile; i++) {
          mockData.push({
            id: baseId + i,
            work: `${file.name}から抽出された作業 ${i + 1}`,
            workElement: `PDF分析による作業要素 ${i + 1}`,
            knowledgeFile: file.name,
            reference: `AI分析結果 - ${file.name}`,
            hazard: `PDFファイル「${file.name}」の内容分析により特定された危険性 ${i + 1}`,
            riskReduction: `PDF分析に基づく推奨対策 ${i + 1}`,
            measureType: ['管理的対策', '工学的対策', '設計時対策'][Math.floor(Math.random() * 3)],
            severity: Math.floor(Math.random() * 6) + 4, // 4-9
            probability: Math.floor(Math.random() * 4) + 2, // 2-5
            exposure: Math.floor(Math.random() * 4) + 2, // 2-5
            riskScore: 0, // 後で計算
            riskLevel: 'IV',
            severityAfter: Math.floor(Math.random() * 4) + 2, // 2-5
            probabilityAfter: Math.floor(Math.random() * 3) + 1, // 1-3
            exposureAfter: Math.floor(Math.random() * 3) + 2, // 2-4
            riskScoreAfter: 0, // 後で計算
            riskLevelAfter: 'III',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          });
        }
      });
      
      // テキスト入力からも項目を生成
      if (textContents.length > 0) {
        const textBaseId = Date.now() + 10000;
        mockData.push({
          id: textBaseId,
          work: 'テキスト入力から抽出された作業',
          workElement: 'テキスト分析による作業要素',
          knowledgeFile: 'テキスト入力',
          reference: 'AI分析結果 - テキスト入力',
          hazard: 'テキスト内容に基づく危険性の特定',
          riskReduction: 'テキスト分析による推奨対策',
          measureType: '管理的対策',
          severity: 6,
          probability: 4,
          exposure: 3,
          riskScore: 13,
          riskLevel: 'IV',
          severityAfter: 6,
          probabilityAfter: 2,
          exposureAfter: 3,
          riskScoreAfter: 11,
          riskLevelAfter: 'III',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        });
      }
      
      // リスクスコアを計算
      mockData.forEach(item => {
        item.riskScore = item.severity + item.probability + item.exposure;
        item.riskScoreAfter = item.severityAfter + item.probabilityAfter + item.exposureAfter;
        
        // リスクレベルを決定
        item.riskLevel = item.riskScore >= 15 ? 'IV' : item.riskScore >= 12 ? 'III' : item.riskScore >= 8 ? 'II' : 'I';
        item.riskLevelAfter = item.riskScoreAfter >= 15 ? 'IV' : item.riskScoreAfter >= 12 ? 'III' : item.riskScoreAfter >= 8 ? 'II' : 'I';
      });
      
      onImport(mockData);
      onOpenChange(false);
      resetDialog();
      
      toast({
        title: 'AI分析完了',
        description: `${mockData.length}件のリスクアセスメント項目が生成されました`,
      });
    }, 3000);
  };

  // ダイアログリセット
  const resetDialog = () => {
    setFilePreviews([]);
    setTextInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ダイアログを閉じる
  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  // 統計情報の計算
  const totalFiles = filePreviews.length;
  const successfulFiles = filePreviews.filter(f => !f.error).length;
  const errorFiles = filePreviews.filter(f => f.error).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>PDFファイルアップロード</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* ファイルアップロードエリア */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">PDFファイル（複数選択可能）</Label>
              {filePreviews.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAllFiles}
                  className="text-red-600 hover:text-red-700 h-8"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  全て削除
                </Button>
              )}
            </div>
            
            {/* ドラッグ&ドロップエリア */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  const event = { target: { files } } as React.ChangeEvent<HTMLInputElement>;
                  handleFileSelect(event);
                }
              }}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    PDFファイルを選択またはドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    複数のPDFファイルを同時にアップロードできます
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />

            {/* 統計情報 */}
            {filePreviews.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-800 font-medium">
                      選択ファイル: {totalFiles}件
                    </span>
                    {successfulFiles > 0 && (
                      <span className="text-green-700">
                        読み込み成功: {successfulFiles}件
                      </span>
                    )}
                    {errorFiles > 0 && (
                      <span className="text-red-700">
                        エラー: {errorFiles}件
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ファイルプレビューリスト */}
            {filePreviews.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filePreviews.map((preview) => (
                  <div key={preview.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            {getPDFIcon()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{preview.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(preview.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(preview.id)}
                          className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* エラー表示 */}
                      {preview.error && (
                        <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">読み込みエラー</p>
                            <p className="text-sm">{preview.error}</p>
                          </div>
                        </div>
                      )}

                      {/* 成功表示 */}
                      {!preview.error && (
                        <div className="flex items-start space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{preview.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 処理中表示 */}
            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">ファイルを処理中...</span>
              </div>
            )}
          </div>

          {/* テキスト入力エリア */}
          <div className="space-y-3">
            <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
              追加テキスト入力（オプション）
            </Label>
            <Textarea
              id="text-input"
              placeholder="PDFファイルに加えて、追加の作業内容やリスク情報があれば入力してください..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-32 resize-none border-gray-200 no-focus-style"
            />
          </div>
        </div>

        {/* フッターボタン */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6"
          >
            キャンセル
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDecompose}
              disabled={successfulFiles === 0 && !textInput.trim()}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              AI分析実行
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}