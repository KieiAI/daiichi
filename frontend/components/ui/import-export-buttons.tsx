// 共通のインポート/エクスポートボタンコンポーネント
// 変更理由: 重複コードの排除とコンポーネントの再利用性向上
'use client';

import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';

interface ImportExportButtonsProps {
  onImport?: () => void;
  onExport?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ImportExportButtons({ 
  onImport, 
  onExport, 
  disabled = false,
  className = ""
}: ImportExportButtonsProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Button 
        variant="outline" 
        onClick={onImport}
        disabled={disabled}
        aria-label="データをインポート"
      >
        <Upload className="mr-2 h-4 w-4" />
        インポート
      </Button>
      <Button 
        variant="outline" 
        onClick={onExport}
        disabled={disabled}
        aria-label="データをエクスポート"
      >
        <Download className="mr-2 h-4 w-4" />
        エクスポート
      </Button>
    </div>
  );
}