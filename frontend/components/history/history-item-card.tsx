// 履歴アイテムカードコンポーネント
// 変更理由: 履歴表示ロジックの分離と可読性向上
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileSpreadsheet, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface HistoryItem {
  id: number;
  title: string;
  date: string;
  totalRisks: number;
  highRisks: number;
  description: string;
  type: 'risk-assessment';
}

interface HistoryItemCardProps {
  item: HistoryItem;
  onView: (item: HistoryItem) => void;
  onDownload?: (item: HistoryItem) => void;
}

export function HistoryItemCard({ item, onView, onDownload }: HistoryItemCardProps) {
  const handleView = () => {
    try {
      onView(item);
    } catch (error) {
      console.error('履歴表示エラー:', error);
    }
  };

  const handleDownload = () => {
    try {
      onDownload?.(item);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-emerald-500">
      <CardHeader>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-slate-900 mb-2 flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <span>{item.title}</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(item.date), 'yyyy年MM月dd日', { locale: ja })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileSpreadsheet className="h-4 w-4" />
              <span>総リスク数: {item.totalRisks}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-red-600">高リスク: {item.highRisks}</span>
            </div>
          </div>
          <p className="text-slate-600 text-sm">{item.description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500">
              総リスク数: {item.totalRisks}件
            </div>
            <div className="text-sm text-slate-500">
              高リスク: {item.highRisks}件
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              aria-label={`${item.title}の詳細を表示`}
            >
              <Eye className="mr-2 h-4 w-4" />
              詳細表示
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
              aria-label={`${item.title}をダウンロード`}
            >
              <Download className="mr-2 h-4 w-4" />
              ダウンロード
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}