'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Factory,
  FileSpreadsheet, 
  History, 
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Settings, 
  User,
  LogOut,
  Search,
  FileText,
  MessageSquare,
  Users,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { 
    name: 'チャット開始', 
    href: '/chat', 
    icon: MessageSquare,
    description: 'AIとの対話でリスク分析',
    color: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  { 
    name: 'シート作成', 
    href: '/', 
    icon: FileSpreadsheet,
    description: 'リスクアセスメント表を新規作成',
    color: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  },
  { 
    name: '過去の履歴', 
    href: '/history', 
    icon: History,
    description: '過去のアセスメント履歴',
    color: 'text-gray-300 hover:bg-gray-800 hover:text-white'
  },
];

const recentItems = [
  { name: '高所作業リスクアセスメント', date: '今日', href: '/', type: 'risk-assessment' },
  { name: '化学物質取扱いの相談', date: '今日', href: '/chat', type: 'chat' },
  { name: '足場組立作業の安全評価', date: '今日', href: '/', type: 'risk-assessment' },
  { name: '重機操作の安全対策について', date: '今日', href: '/chat', type: 'chat' },
  { name: 'コンクリート打設作業評価', date: '今日', href: '/', type: 'risk-assessment' },
  { name: '個人用保護具の選定相談', date: '今日', href: '/chat', type: 'chat' },
  { name: '電気工事安全管理', date: '今日', href: '/', type: 'risk-assessment' },
  { name: '溶接作業の換気対策', date: '今日', href: '/chat', type: 'chat' },
  
  { name: '建設現場安全点検', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '危険物取扱いの注意点', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '配管工事リスク評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '作業環境測定について', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '塗装作業安全対策', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '騒音対策の相談', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '解体工事安全計画', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '粉じん対策について', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '屋根工事安全評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '熱中症予防対策', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '地下工事リスク分析', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '酸欠事故防止策', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '橋梁工事安全管理', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全教育の実施方法', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: 'トンネル工事評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '緊急時対応手順', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '道路工事安全対策', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '交通誘導の安全確保', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '鉄骨建方作業評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: 'クレーン作業の注意点', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '内装工事安全計画', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '火災予防対策', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '外壁工事リスク評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全標識の設置基準', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '設備工事安全管理', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '作業手順書の作成', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '土木工事安全評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全衛生委員会運営', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '機械設備保守点検', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: 'KY活動の効果的実施', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '電気設備工事評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全パトロールの方法', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '給排水工事安全対策', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: 'ヒヤリハット活用法', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '空調工事リスク分析', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全大会の企画運営', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '防水工事安全計画', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '新人安全教育プログラム', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: 'エレベーター工事評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全管理体制の構築', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '消防設備工事安全対策', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: 'リスクアセスメント手法', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: '通信設備工事評価', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '安全文化の醸成方法', date: '過去30日間', href: '/chat', type: 'chat' },
  { name: 'ガス設備工事安全管理', date: '過去30日間', href: '/', type: 'risk-assessment' },
  { name: '事故調査の進め方', date: '過去30日間', href: '/chat', type: 'chat' },
  
  // 昨日のデータ
  { name: '足場解体作業安全評価', date: '昨日', href: '/', type: 'risk-assessment' },
  { name: '新人作業員の安全指導', date: '昨日', href: '/chat', type: 'chat' },
  { name: '配電盤工事リスク分析', date: '昨日', href: '/', type: 'risk-assessment' },
  { name: '作業環境改善の相談', date: '昨日', href: '/chat', type: 'chat' },
  { name: '防火設備点検評価', date: '昨日', href: '/', type: 'risk-assessment' },
  { name: '安全標語の作成方法', date: '昨日', href: '/chat', type: 'chat' },
  { name: '給水設備工事安全対策', date: '昨日', href: '/', type: 'risk-assessment' },
  { name: '労働災害防止策', date: '昨日', href: '/chat', type: 'chat' },
  { name: '照明設備更新工事', date: '昨日', href: '/', type: 'risk-assessment' },
  { name: '安全衛生教育計画', date: '昨日', href: '/chat', type: 'chat' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'risk-assessment' | 'chat'>('all');

  const filteredItems = recentItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (historyFilter === 'all' || item.type === historyFilter)
  );

  return (
    <div className={cn(
      'bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800',
      isCollapsed ? 'w-16' : 'w-80'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex flex-col items-center justify-center text-center transition-opacity duration-300 flex-1',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          )}>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">第一施設工業</span>
              <span className="text-xs text-white">リスクアセスメントAI</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "text-gray-400 hover:text-white hover:bg-gray-800 p-2 flex-shrink-0",
              isCollapsed && "absolute top-4 left-4 z-10"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden',
        isCollapsed ? 'hidden' : ''
      )}>
        {/* Main Navigation */}
        <div className="space-y-1 mb-6 mt-4 px-4 flex-shrink-0">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-200 group mb-2',
                  'px-3 py-2.5 space-x-3',
                  isActive
                    ? item.color || 'bg-blue-600 text-white shadow-lg'
                    : item.color || 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className={cn(
                  'flex-shrink-0 transition-transform duration-200',
                  'h-5 w-5',
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-white opacity-80">{item.description}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent History - Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-4">
          <div className="flex items-center justify-between px-3">
            <div className="text-sm font-medium text-gray-400">
              最近の履歴
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryFilter('all')}
                className={cn(
                  "h-6 w-6 p-0 rounded transition-colors",
                  historyFilter === 'all' 
                    ? "bg-gray-600 text-white hover:bg-gray-700" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
                title="全て表示"
              >
                <span className="text-xs font-bold">All</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryFilter('chat')}
                className={cn(
                  "h-6 w-6 p-0 rounded transition-colors",
                  historyFilter === 'chat' 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
                title="チャットのみ表示"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryFilter('risk-assessment')}
                className={cn(
                  "h-6 w-6 p-0 rounded transition-colors",
                  historyFilter === 'risk-assessment' 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
                title="シートのみ表示"
              >
                <FileSpreadsheet className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="px-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full h-8 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          
          {/* Today */}
          <div>
            <div className="text-xs font-medium text-gray-500 px-3 mb-2">今日</div>
            <div className="space-y-1">
              {filteredItems.filter(item => item.date === '今日').map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  {item.type === 'risk-assessment' ? (
                    <FileSpreadsheet className="mr-3 h-4 w-4 flex-shrink-0 text-emerald-400 group-hover:text-emerald-300" />
                  ) : (
                    <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0 text-blue-400 group-hover:text-blue-300" />
                  )}
                  <span className="truncate text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Yesterday */}
          <div>
            <div className="text-xs font-medium text-gray-500 px-3 mb-2">昨日</div>
            <div className="space-y-1">
              {filteredItems.filter(item => item.date === '昨日').map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  {item.type === 'risk-assessment' ? (
                    <FileSpreadsheet className="mr-3 h-4 w-4 flex-shrink-0 text-emerald-400 group-hover:text-emerald-300" />
                  ) : (
                    <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0 text-blue-400 group-hover:text-blue-300" />
                  )}
                  <span className="truncate text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Past 30 days */}
          <div>
            <div className="text-xs font-medium text-gray-500 px-3 mb-2">過去30日間</div>
            <div className="space-y-1">
              {filteredItems.filter(item => item.date === '過去30日間').slice(0, 5).map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  {item.type === 'risk-assessment' ? (
                    <FileSpreadsheet className="mr-3 h-4 w-4 flex-shrink-0 text-emerald-400 group-hover:text-emerald-300" />
                  ) : (
                    <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0 text-blue-400 group-hover:text-blue-300" />
                  )}
                  <span className="truncate text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 過去3ヶ月間 */}
          <div>
            <div className="text-xs font-medium text-gray-500 px-3 mb-2">過去3ヶ月間</div>
            <div className="space-y-1">
              {filteredItems.filter(item => item.date === '過去30日間').slice(5, 15).map((item, index) => (
                <Link
                  key={index + 5}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  {item.type === 'risk-assessment' ? (
                    <FileSpreadsheet className="mr-3 h-4 w-4 flex-shrink-0 text-emerald-400 group-hover:text-emerald-300" />
                  ) : (
                    <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0 text-blue-400 group-hover:text-blue-300" />
                  )}
                  <span className="truncate text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        'border-t border-gray-800 flex-shrink-0',
        isCollapsed ? 'hidden' : 'p-4'
      )}>
        <div className="space-y-2">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-800 p-3 rounded-lg"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">管理者</span>
                  <span className="text-xs text-gray-400">システム管理者</span>
                </div>
                <ChevronUp className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => router.push('/account')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>アカウント設定</span>
              </DropdownMenuItem>
              
              {/* ユーザー管理 */}
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => router.push('/users')}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>ユーザー管理</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => router.push('/knowledge')}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>ナレッジ管理</span>
              </DropdownMenuItem>
              
              {/* システム設定 */}
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => router.push('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>システム設定</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}