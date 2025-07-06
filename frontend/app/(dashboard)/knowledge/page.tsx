'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Upload, 
  CheckCircle,
  Loader2,
  CloudUpload,
  X,
  FileSpreadsheet,
  File,
  Database,
  Archive,
  Calendar,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeFile {
  id: number;
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'text' | 'image' | 'other';
  size: number;
  uploadedAt: string;
  status: 'processing' | 'indexed' | 'error';
  description?: string;
  tags: string[];
  indexedChunks?: number;
}

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ファイルタイプアイコンの取得
  const getFileIcon = (type: KnowledgeFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-gray-600" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-gray-600" />;
      case 'word':
        return <File className="h-5 w-5 text-gray-600" />;
      case 'text':
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
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

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...droppedFiles]);
  };

  // ファイル選択処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // ファイル削除（選択されたファイルから）
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ファイルアップロード処理
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'ファイル未選択',
        description: 'アップロードするファイルを選択してください',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // 模擬的なアップロード処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFiles: KnowledgeFile[] = selectedFiles.map((file, index) => ({
        id: Math.max(...files.map(f => f.id), 0) + index + 1,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'processing' as const,
        description: uploadDescription,
        tags: uploadTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        indexedChunks: 0
      }));

      setFiles(prev => [...prev, ...newFiles]);
      
      // アップロード後にインデックス処理を開始
      setTimeout(() => {
        setFiles(prev => prev.map(file => 
          newFiles.some(nf => nf.id === file.id) 
            ? { ...file, status: 'indexed' as const, indexedChunks: Math.floor(Math.random() * 50) + 10 }
            : file
        ));
        
        toast({
          title: 'インデックス完了',
          description: `${newFiles.length}個のファイルがRAGシステムに追加されました`
        });
      }, 3000);

      // フォームリセット
      setSelectedFiles([]);
      setUploadDescription('');
      setUploadTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: 'アップロード完了',
        description: `${selectedFiles.length}個のファイルがアップロードされました。インデックス処理を開始します。`
      });
    } catch (error) {
      toast({
        title: 'アップロードエラー',
        description: 'ファイルのアップロードに失敗しました',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ファイルタイプの判定
  const getFileType = (fileName: string): KnowledgeFile['type'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'docx':
      case 'doc':
        return 'word';
      case 'txt':
        return 'text';
      default:
        return 'other';
    }
  };

  // 統計情報の計算
  const stats = {
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    lastUpdated: files.length > 0 ? files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0].uploadedAt : null
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ナレッジ管理</h1>
          <p className="text-slate-600">RAGシステムのナレッジベース管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 統計情報（3つの項目） */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString()}</div>
                    <p className="text-slate-600 text-sm">総ナレッジ数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{formatFileSize(stats.totalSize)}</div>
                    <p className="text-slate-600 text-sm">総容量</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString('ja-JP') : '未更新'}
                    </div>
                    <p className="text-slate-600 text-sm">最終更新日</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ナレッジファイルアップロード */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <CloudUpload className="h-6 w-6 text-gray-600" />
                  <span>ナレッジファイルアップロード</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* ドラッグ&ドロップエリア */}
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer ${
                    isDragOver 
                      ? 'border-gray-400 bg-gray-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <CloudUpload className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        ファイルをドラッグ&ドロップまたはクリックして選択
                      </h3>
                      <p className="text-gray-600 mb-4">
                        複数のファイルを同時にアップロードできます
                      </p>
                      <div className="flex justify-center space-x-6 text-sm">
                        <div className="flex flex-col items-center space-y-1">
                          <FileText className="h-6 w-6 text-gray-600" />
                          <span className="text-gray-600">PDF</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <FileSpreadsheet className="h-6 w-6 text-gray-600" />
                          <span className="text-gray-600">Excel</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <File className="h-6 w-6 text-gray-600" />
                          <span className="text-gray-600">Word</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <FileText className="h-6 w-6 text-gray-600" />
                          <span className="text-gray-600">テキスト</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* 選択されたファイル一覧 */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-900">
                        選択されたファイル ({selectedFiles.length}件)
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="mr-2 h-4 w-4" />
                        全て削除
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {getFileIcon(getFileType(file.name))}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedFile(index)}
                            className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* アップロードボタン */}
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || isUploading}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base font-medium"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        RAGシステムに追加 ({selectedFiles.length}件)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}