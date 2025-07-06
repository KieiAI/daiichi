'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'こんにちは！リスクアセスメントに関するご質問やご相談がございましたら、お気軽にお聞かせください。作業の危険性分析、対策の提案、安全管理のベストプラクティスなど、幅広くサポートいたします。',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // メッセージ送信後に最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ページ読み込み時に入力フィールドにフォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // AIの応答をシミュレート
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      'ご質問ありがとうございます。リスクアセスメントにおいて、作業の危険性を特定し、適切な対策を講じることは非常に重要です。具体的にどのような作業についてお聞かせいただけますでしょうか？',
      'その作業については、以下の点に注意が必要です：\n\n1. 作業環境の安全確認\n2. 適切な保護具の着用\n3. 作業手順の遵守\n4. 緊急時の対応準備\n\n詳細な分析を行うために、もう少し具体的な情報をお聞かせください。',
      '高所作業に関するリスクですね。墜落・転落防止のために以下の対策をお勧めします：\n\n• フルハーネス型安全帯の着用\n• 作業床の設置\n• 手すりの設置\n• 安全ネットの展張\n• 作業計画の策定と周知\n\nこれらの対策について、さらに詳しくご説明いたしましょうか？',
      'リスク評価の手法についてですが、一般的には以下の要素を考慮します：\n\n• 重篤度（Severity）: 1-10\n• 発生確率（Probability）: 1-6\n• 暴露頻度（Exposure）: 1-6\n\nこれらを組み合わせてリスクスコアを算出し、適切な対策を検討します。具体的な評価方法についてご質問はありますか？',
      '化学物質の取り扱いについてですね。以下の安全対策が重要です：\n\n• SDS（安全データシート）の確認\n• 適切な保護具の選定と着用\n• 換気設備の確保\n• 緊急時の対応手順の確立\n• 定期的な健康診断の実施\n\n特にどの化学物質についてお聞きになりたいですか？',
      '重機操作の安全管理についてお答えします：\n\n• 日常点検の実施\n• 作業半径内への立入禁止\n• 合図者の配置\n• 適切な資格者による操作\n• 定期的な技能講習の受講\n\n具体的にどの重機についてご相談でしょうか？'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enterの場合は改行を許可（デフォルトの動作）
      return;
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      content: 'チャットがクリアされました。新しい会話を始めましょう！',
      role: 'assistant',
      timestamp: new Date(),
    }]);
    toast({
      title: 'チャットクリア',
      description: 'チャット履歴がクリアされました',
    });
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'コピー完了',
      description: 'メッセージがクリップボードにコピーされました',
    });
  };

  const handleExportChat = () => {
    const chatData = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'エクスポート完了',
      description: 'チャット履歴がダウンロードされました',
    });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50">
      {/* メッセージエリア */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                    {/* アバター */}
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* メッセージバブル */}
                    <div className={`group relative ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                          {message.content}
                        </div>
                      </div>
                      
                      {/* タイムスタンプとアクション */}
                      <div className={`flex items-center mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(message.content)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {message.role === 'assistant' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* ローディング表示 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 入力エリア */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          {/* メイン入力エリア */}
          <div className="relative">
            {/* 入力フィールドコンテナ */}
            <div className="relative bg-white rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200 shadow-sm hover:shadow-md">
              {/* 入力フィールド */}
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="リスクアセスメントについて質問してください..."
                disabled={isLoading}
                className="w-full border-0 no-focus-style min-h-[52px] max-h-32 text-sm px-4 py-3 pr-16 rounded-2xl resize-none overflow-y-auto bg-transparent placeholder-gray-500"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '52px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(Math.max(target.scrollHeight, 52), 128) + 'px';
                }}
              />
            
              {/* 送信ボタン */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg scale-100'
                    : 'bg-gray-200 text-gray-400 scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          
            {/* ツールバー */}
            <div className="flex items-center justify-between mt-3">
              {/* 左側: 操作説明 */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded-md shadow-sm">Enter</kbd>
                  <span>送信</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded-md shadow-sm">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded-md shadow-sm">Enter</kbd>
                  <span>改行</span>
                </span>
              </div>
            
              {/* 右側: アクションボタン */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-gray-500 hover:text-gray-700 h-8 px-3 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  クリア
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportChat}
                  className="text-gray-500 hover:text-gray-700 h-8 px-3 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  エクスポート
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}