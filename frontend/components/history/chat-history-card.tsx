// チャット履歴カードコンポーネント
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Eye, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ChatHistoryItem {
  id: number;
  title: string;
  date: string;
  messageCount: number;
  lastMessage: string;
  type: 'chat';
}

interface ChatHistoryCardProps {
  item: ChatHistoryItem;
  onView: (item: ChatHistoryItem) => void;
  onDownload?: (item: ChatHistoryItem) => void;
}

export function ChatHistoryCard({ item, onView, onDownload }: ChatHistoryCardProps) {
  const handleView = () => {
    try {
      onView(item);
    } catch (error) {
      console.error('チャット履歴表示エラー:', error);
    }
  };

  const handleDownload = () => {
    try {
      onDownload?.(item);
    } catch (error) {
      console.error('チャット履歴ダウンロードエラー:', error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-slate-900 mb-2 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>{item.title}</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(item.date), 'yyyy年MM月dd日', { locale: ja })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>メッセージ数: {item.messageCount}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-l-gray-300">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">最後のメッセージ:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{item.lastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500">
              チャット履歴 • {item.messageCount}件のやり取り
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
              エクスポート
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}