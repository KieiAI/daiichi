'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryItemCard } from '@/components/history/history-item-card';
import { ChatHistoryCard } from '@/components/history/chat-history-card';
import { useToast } from '@/hooks/use-toast';
import { 
  FileSpreadsheet, 
  MessageSquare, 
  Clock, 
  Search, 
  Filter
} from 'lucide-react';

interface RiskAssessmentHistoryItem {
  id: number;
  title: string;
  date: string;
  totalRisks: number;
  highRisks: number;
  description: string;
  type: 'risk-assessment';
  tags?: string[];
}

interface ChatHistoryItem {
  id: number;
  title: string;
  date: string;
  messageCount: number;
  lastMessage: string;
  type: 'chat';
  tags?: string[];
}

type HistoryItem = RiskAssessmentHistoryItem | ChatHistoryItem;
type SortOption = 'date-desc' | 'date-asc' | 'title';

// リスクアセスメント履歴のモックデータ
const mockRiskAssessmentHistory: RiskAssessmentHistoryItem[] = [
  {
    id: 1,
    title: '2024年度 第1四半期 リスクアセスメント',
    date: '2024-03-31',
    totalRisks: 10,
    highRisks: 4,
    description: '製造ライン全体の包括的なリスク評価を実施',
    type: 'risk-assessment',
    tags: ['製造ライン', '四半期評価']
  },
  {
    id: 2,
    title: '2023年度 年次リスクアセスメント',
    date: '2023-12-31',
    totalRisks: 15,
    highRisks: 6,
    description: '年次定期評価として全部門のリスク分析を実施',
    type: 'risk-assessment',
    tags: ['年次評価', '全部門']
  },
  {
    id: 3,
    title: '新設備導入時 リスクアセスメント',
    date: '2023-09-15',
    totalRisks: 8,
    highRisks: 2,
    description: '新規導入設備に関する安全性評価',
    type: 'risk-assessment',
    tags: ['新設備', '導入評価']
  },
  {
    id: 4,
    title: '緊急時対応 リスクアセスメント',
    date: '2023-06-20',
    totalRisks: 12,
    highRisks: 5,
    description: '緊急事態発生時の対応手順に関するリスク評価',
    type: 'risk-assessment',
    tags: ['緊急時対応', 'BCP']
  },
  {
    id: 5,
    title: '2023年度 第2四半期 リスクアセスメント',
    date: '2023-06-30',
    totalRisks: 9,
    highRisks: 3,
    description: '定期四半期評価として実施',
    type: 'risk-assessment',
    tags: ['四半期評価']
  },
  {
    id: 6,
    title: '高所作業安全評価',
    date: '2024-03-28',
    totalRisks: 5,
    highRisks: 2,
    description: '高所作業に関するリスク評価',
    type: 'risk-assessment',
    tags: ['高所作業']
  }
];

// チャット履歴のモックデータ
const mockChatHistory: ChatHistoryItem[] = [
  {
    id: 101,
    title: '高所作業の安全対策について',
    date: '2024-03-28',
    messageCount: 15,
    lastMessage: 'フルハーネス型安全帯の正しい装着方法について詳しく教えていただき、ありがとうございました。',
    type: 'chat',
    tags: ['高所作業', '安全帯']
  },
  {
    id: 102,
    title: '化学物質取扱いのリスク評価',
    date: '2024-03-25',
    messageCount: 23,
    lastMessage: 'SDSの確認方法と保護具の選定基準がよく理解できました。',
    type: 'chat',
    tags: ['化学物質', 'SDS']
  },
  {
    id: 103,
    title: '建設現場での重機操作安全',
    date: '2024-03-20',
    messageCount: 18,
    lastMessage: '重機の日常点検項目と作業半径の管理について確認できました。',
    type: 'chat',
    tags: ['重機操作', '建設現場']
  },
  {
    id: 104,
    title: '緊急時対応計画の策定',
    date: '2024-03-15',
    messageCount: 12,
    lastMessage: '避難経路の設定と連絡体制の整備について相談しました。',
    type: 'chat',
    tags: ['緊急時対応', 'BCP']
  },
  {
    id: 105,
    title: '個人用保護具の選定基準',
    date: '2024-03-10',
    messageCount: 8,
    lastMessage: '作業内容に応じた適切なPPEの選び方を学びました。',
    type: 'chat',
    tags: ['PPE', '保護具']
  }
];

export default function HistoryPage() {
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const { toast } = useToast();

  // 全履歴を統合
  const allHistory: HistoryItem[] = useMemo(() => {
    return [...mockRiskAssessmentHistory, ...mockChatHistory];
  }, []);

  // フィルタリングとソート
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = allHistory;

    // タブフィルター
    if (activeTab === 'risk-assessments') {
      filtered = filtered.filter(item => item.type === 'risk-assessment');
    } else if (activeTab === 'chats') {
      filtered = filtered.filter(item => item.type === 'chat');
    }

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        ('lastMessage' in item && item.lastMessage.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allHistory, activeTab, searchQuery, sortOption]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const riskAssessments = mockRiskAssessmentHistory;
    const chats = mockChatHistory;
    
    return {
      totalItems: allHistory.length,
      riskAssessments: riskAssessments.length,
      chats: chats.length,
    };
  }, [allHistory]);

  // 履歴表示処理
  const handleViewHistory = (item: HistoryItem) => {
    try {
      setSelectedHistory(item);
      console.log('Viewing history:', item);
      toast({
        title: '履歴選択',
        description: `${item.title}を選択しました`,
        variant: 'default'
      });
    } catch (error) {
      console.error('履歴表示エラー:', error);
      toast({
        title: 'エラー',
        description: '履歴の表示中にエラーが発生しました',
        variant: 'destructive'
      });
    }
  };

  // ダウンロード処理
  const handleDownload = (item: HistoryItem) => {
    try {
      console.log('Downloading:', item);
      toast({
        title: '準備中',
        description: 'ダウンロード機能は実装予定です',
        variant: 'default'
      });
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      toast({
        title: 'エラー',
        description: 'ダウンロード中にエラーが発生しました',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">過去の履歴</h1>
              <p className="text-gray-600">リスクアセスメント表とチャットの履歴を管理</p>
            </div>
          </div>

          {/* 検索とフィルター */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* 検索バー */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="タイトル、説明、タグで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 focus:ring-0 focus:border-0 bg-gray-50"
                />
              </div>

              {/* ソート */}
              <div className="flex items-center space-x-3">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">新しい順</option>
                  <option value="date-asc">古い順</option>
                  <option value="title">タイトル順</option>
                </select>
              </div>
            </div>

            {/* 検索結果表示 */}
            {searchQuery && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  「<span className="font-medium text-gray-900">{searchQuery}</span>」の検索結果: {filteredAndSortedHistory.length}件
                </p>
              </div>
            )}
          </div>
        </div>

        {/* タブメニュー */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-sm border border-gray-200">
            <TabsTrigger 
              value="all" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-gray-400"
            >
              <Clock className="h-4 w-4" />
              <span>全て ({allHistory.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="risk-assessments" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>リスク表 ({stats.riskAssessments})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chats" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:border-green-500"
            >
              <MessageSquare className="h-4 w-4" />
              <span>チャット ({stats.chats})</span>
            </TabsTrigger>
          </TabsList>
          
          {/* 全て */}
          <TabsContent value="all" className="space-y-4">
            {filteredAndSortedHistory.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedHistory.map((item) => (
                  <div key={`${item.type}-${item.id}`}>
                    {item.type === 'risk-assessment' ? (
                      <HistoryItemCard
                        item={item as RiskAssessmentHistoryItem}
                        onView={handleViewHistory}
                        onDownload={handleDownload}
                      />
                    ) : (
                      <ChatHistoryCard
                        item={item as ChatHistoryItem}
                        onView={handleViewHistory}
                        onDownload={handleDownload}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりません</h3>
                <p className="text-gray-500">検索条件を変更してお試しください</p>
              </div>
            )}
          </TabsContent>
          
          {/* リスクアセスメント */}
          <TabsContent value="risk-assessments" className="space-y-4">
            {filteredAndSortedHistory.filter(item => item.type === 'risk-assessment').length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedHistory
                  .filter(item => item.type === 'risk-assessment')
                  .map((item) => (
                    <HistoryItemCard
                      key={item.id}
                      item={item as RiskAssessmentHistoryItem}
                      onView={handleViewHistory}
                      onDownload={handleDownload}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">リスク表が見つかりません</h3>
                <p className="text-gray-500">検索条件を変更するか、新しいリスク表を作成してください</p>
              </div>
            )}
          </TabsContent>
          
          {/* チャット */}
          <TabsContent value="chats" className="space-y-4">
            {filteredAndSortedHistory.filter(item => item.type === 'chat').length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedHistory
                  .filter(item => item.type === 'chat')
                  .map((item) => (
                    <ChatHistoryCard
                      key={item.id}
                      item={item as ChatHistoryItem}
                      onView={handleViewHistory}
                      onDownload={handleDownload}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">チャット履歴が見つかりません</h3>
                <p className="text-gray-500">検索条件を変更するか、新しいチャットを開始してください</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 履歴詳細表示エリア（将来的に別ページまたはモーダルで実装） */}
        {selectedHistory && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">詳細表示機能は実装予定です</p>
          </div>
        )}
      </div>
    </div>
  );
}