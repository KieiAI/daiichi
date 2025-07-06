'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  Loader2,
  Home,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  pdfFile: File;
  className?: string;
  height?: string;
  showToolbar?: boolean;
  initialScale?: number;
}

interface ViewerState {
  numPages: number;
  pageNumber: number;
  scale: number;
  rotation: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  fileUrl: string;
}

const SCALE_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];
const MIN_SCALE = 0.25;
const MAX_SCALE = 5.0;

export default function PDFViewer({ 
  pdfFile, 
  className = '',
  height = 'h-96',
  showToolbar = true,
  initialScale = 1.0
}: PDFViewerProps) {
  const [state, setState] = useState<ViewerState>({
    numPages: 0,
    pageNumber: 1,
    scale: initialScale,
    rotation: 0,
    isFullscreen: false,
    isLoading: true,
    error: null,
    fileUrl: ''
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // PDF.js workerを設定（クライアントサイドでのみ実行）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf-worker.min.js`;
    }
  }, []);

  // PDF blob URLの作成と管理
  useEffect(() => {
    if (!pdfFile) {
      setState(prev => ({ ...prev, error: 'PDFファイルが指定されていません' }));
      return;
    }

    const url = URL.createObjectURL(pdfFile);
    setState(prev => ({ ...prev, fileUrl: url, error: null }));
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfFile]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isFullscreen) return;

      switch (e.key) {
        case 'Escape':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          e.preventDefault();
          goToFirstPage();
          break;
        case 'End':
          e.preventDefault();
          goToLastPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'r':
          e.preventDefault();
          rotate();
          break;
      }
    };

    if (state.isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [state.isFullscreen, state.pageNumber, state.numPages]);

  // PDF読み込み成功時のコールバック
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setState(prev => ({ 
      ...prev, 
      numPages, 
      isLoading: false, 
      error: null,
      pageNumber: Math.min(prev.pageNumber, numPages)
    }));
  }, []);

  // PDF読み込みエラー時のコールバック
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: 'PDFファイルの読み込みに失敗しました' 
    }));
    
    toast({
      title: 'PDFエラー',
      description: 'PDFファイルの読み込みに失敗しました',
      variant: 'destructive',
    });
  }, [toast]);

  // ページナビゲーション関数
  const goToFirstPage = () => setState(prev => ({ ...prev, pageNumber: 1 }));
  const goToLastPage = () => setState(prev => ({ ...prev, pageNumber: prev.numPages }));
  const goToPrevPage = () => setState(prev => ({ ...prev, pageNumber: Math.max(1, prev.pageNumber - 1) }));
  const goToNextPage = () => setState(prev => ({ ...prev, pageNumber: Math.min(prev.numPages, prev.pageNumber + 1) }));
  
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(state.numPages, page));
    setState(prev => ({ ...prev, pageNumber: validPage }));
  };

  // ズーム関数
  const zoomIn = () => setState(prev => ({ ...prev, scale: Math.min(MAX_SCALE, prev.scale + 0.25) }));
  const zoomOut = () => setState(prev => ({ ...prev, scale: Math.max(MIN_SCALE, prev.scale - 0.25) }));
  const resetZoom = () => setState(prev => ({ ...prev, scale: 1.0 }));
  const setScale = (scale: number) => setState(prev => ({ ...prev, scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale)) }));

  // 回転
  const rotate = () => setState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));

  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  // ダウンロード
  const downloadPDF = () => {
    if (state.fileUrl) {
      const link = document.createElement('a');
      link.href = state.fileUrl;
      link.download = pdfFile.name || 'document.pdf';
      link.click();
      
      toast({
        title: 'ダウンロード開始',
        description: 'PDFファイルのダウンロードを開始しました',
      });
    }
  };

  // ローディング表示
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-50">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">PDFを読み込み中</p>
          <p className="text-xs text-gray-500 mt-1">{pdfFile.name}</p>
        </div>
      </div>
    </div>
  );

  // エラー表示
  const ErrorDisplay = ({ error }: { error: string }) => (
    <div className="flex items-center justify-center h-full w-full bg-red-50">
      <div className="text-center space-y-3 p-6">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-900">読み込みエラー</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setState(prev => ({ ...prev, isLoading: true, error: null }))}
          className="text-red-700 border-red-300 hover:bg-red-100"
        >
          再試行
        </Button>
      </div>
    </div>
  );

  // ツールバーコンポーネント
  const Toolbar = () => (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 flex-shrink-0">
      {/* 左側: ページナビゲーション */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirstPage}
          disabled={state.pageNumber <= 1}
          className="h-8 w-8 p-0"
          title="最初のページ"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={state.pageNumber <= 1}
          className="h-8 w-8 p-0"
          title="前のページ"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={state.pageNumber}
            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
            className="w-12 px-2 py-1 text-center border border-gray-300 rounded text-sm h-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={1}
            max={state.numPages}
          />
          <span className="text-sm text-gray-600">/ {state.numPages}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={state.pageNumber >= state.numPages}
          className="h-8 w-8 p-0"
          title="次のページ"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToLastPage}
          disabled={state.pageNumber >= state.numPages}
          className="h-8 w-8 p-0"
          title="最後のページ"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* 中央: ファイル情報 */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <FileText className="h-4 w-4" />
        <span className="max-w-48 truncate">{pdfFile.name}</span>
      </div>

      {/* 右側: ズームとアクション */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={zoomOut}
          disabled={state.scale <= MIN_SCALE}
          className="h-8 w-8 p-0"
          title="縮小"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <select
          value={state.scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded h-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SCALE_PRESETS.map(scale => (
            <option key={scale} value={scale}>
              {Math.round(scale * 100)}%
            </option>
          ))}
        </select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={zoomIn}
          disabled={state.scale >= MAX_SCALE}
          className="h-8 w-8 p-0"
          title="拡大"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Button
          variant="outline"
          size="sm"
          onClick={rotate}
          className="h-8 w-8 p-0"
          title="回転"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0"
          title="フルスクリーン"
        >
          {state.isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={downloadPDF}
          className="h-8 w-8 p-0"
          title="ダウンロード"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // メインコンテナのクラス名
  const containerClassName = cn(
    'bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm',
    state.isFullscreen && 'fixed inset-0 z-50 rounded-none shadow-2xl',
    className
  );

  // PDF表示エリアの高さ
  const pdfAreaHeight = state.isFullscreen 
    ? 'h-[calc(100vh-60px)]' 
    : showToolbar 
      ? `${height.replace('h-', 'h-[calc(')}px-60px)]` 
      : height;

  // ファイルURLが準備できていない場合
  if (!state.fileUrl && !state.error) {
    return (
      <div className={containerClassName}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={containerClassName}>
      {/* ツールバー */}
      {showToolbar && <Toolbar />}

      {/* PDF表示エリア */}
      <div className={cn('bg-gray-100 overflow-hidden', pdfAreaHeight)}>
        {state.error ? (
          <ErrorDisplay error={state.error} />
        ) : (
          <ScrollArea className="h-full">
            <div className="flex justify-center items-start p-4 min-h-full">
              {state.isLoading && <LoadingSpinner />}
              
              <Document
                file={state.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                error={null}
                noData={null}
                className="flex justify-center"
              >
                <Page
                  pageNumber={state.pageNumber}
                  scale={state.scale}
                  rotate={state.rotation}
                  loading={
                    <div className="flex items-center justify-center h-96 w-full">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-96 w-full text-red-600">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">ページの読み込みに失敗しました</p>
                      </div>
                    </div>
                  }
                  className="shadow-lg border border-gray-300 bg-white"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* フルスクリーン時のキーボードショートカット表示 */}
      {state.isFullscreen && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg">
          <div className="space-y-1">
            <div>ESC: 閉じる</div>
            <div>←→: ページ移動</div>
            <div>+/-: ズーム</div>
            <div>R: 回転</div>
          </div>
        </div>
      )}

      {/* フルスクリーン時の閉じるボタン */}
      {state.isFullscreen && (
        <Button
          variant="outline"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 bg-white shadow-lg hover:bg-gray-50"
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          閉じる
        </Button>
      )}
    </div>
  );
}