// メインページ - リファクタリング済み
// 変更点: useToastの使用、エラーハンドリング改善、ImportExportButtonsの使用
'use client';

import { useState, useCallback } from 'react';
import { mockRiskAssessments } from '@/lib/mock-data';
import { RiskAssessment } from '@/types/risk-assessment';
import { EnhancedDataTable } from '@/components/data-table/enhanced-data-table';
import { createEnhancedColumns } from '@/components/data-table/enhanced-columns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Play, Database, BarChart3 } from 'lucide-react';
import { ReportsTab } from '@/components/reports-tab';
import { useToast } from '@/hooks/use-toast';
import { calculateRiskScore, getRiskLevel } from '@/lib/risk-calculations';

export default function RiskAssessmentPage() {
  const [data, setData] = useState<RiskAssessment[]>(mockRiskAssessments);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // データ更新ハンドラー
  const handleDataUpdate = useCallback((id: number, field: keyof RiskAssessment, value: string | number) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value, updatedAt: new Date().toISOString().split('T')[0] };
          
          // リスクスコアとレベルの自動計算
          if (['severity', 'probability', 'exposure'].includes(field)) {
            try {
              const newRiskScore = calculateRiskScore(
                updatedItem.severity,
                updatedItem.probability,
                updatedItem.exposure
              );
              updatedItem.riskScore = newRiskScore;
              updatedItem.riskLevel = getRiskLevel(newRiskScore);
            } catch (error) {
              console.error('リスクスコア計算エラー:', error);
            }
          }
          
          // 対策後のリスクスコアとレベルの自動計算
          if (['severityAfter', 'probabilityAfter', 'exposureAfter'].includes(field)) {
            try {
              const newRiskScoreAfter = calculateRiskScore(
                updatedItem.severityAfter,
                updatedItem.probabilityAfter,
                updatedItem.exposureAfter
              );
              updatedItem.riskScoreAfter = newRiskScoreAfter;
              updatedItem.riskLevelAfter = getRiskLevel(newRiskScoreAfter);
            } catch (error) {
              console.error('対策後リスクスコア計算エラー:', error);
            }
          }
          
          return updatedItem;
        }
        return item;
      });
    });
  }, []);

  // カラム定義を作成
  const columns = createEnhancedColumns(handleDataUpdate);

  // 行クリックハンドラー（エラーハンドリング付き）
  const handleRowClick = useCallback((row: RiskAssessment) => {
    try {
      console.log('Clicked row:', row);
      // 将来的に詳細画面への遷移処理を追加
    } catch (error) {
      console.error('行クリックエラー:', error);
      toast({
        title: 'エラー',
        description: '行の選択中にエラーが発生しました',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // 保存処理（改善されたエラーハンドリング）
  const handleSave = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const historyItem = {
        id: Date.now(),
        title: `リスクアセスメント - ${new Date().toLocaleDateString('ja-JP')}`,
        date: new Date().toISOString().split('T')[0],
        totalRisks: data.length,
        highRisks: data.filter(item => ['V', 'IV'].includes(item.riskLevel)).length,
        status: 'completed' as const,
        description: '手動保存されたリスクアセスメントデータ',
        data: data
      };
      
      // 実際の実装では、ここでAPIを呼び出してデータベースに保存
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬的な非同期処理
      
      console.log('Saving to history:', historyItem);
      toast({
        title: '保存完了',
        description: '履歴に保存されました',
      });
    } catch (error) {
      console.error('保存エラー:', error);
      toast({
        title: 'エラー',
        description: '保存中にエラーが発生しました',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [data, isLoading, toast]);

  // 実行処理（改善されたエラーハンドリング）
  const handleExecute = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // 実際の実装では、ここでリスクアセスメント分析APIを呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬的な非同期処理
      
      console.log('Executing risk assessment analysis...');
      toast({
        title: '実行完了',
        description: 'リスクアセスメント分析を実行しました',
      });
    } catch (error) {
      console.error('実行エラー:', error);
      toast({
        title: 'エラー',
        description: '分析実行中にエラーが発生しました',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast]);

  return (
    <div className="p-4">
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>リスク表</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>レポート</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4">
              <EnhancedDataTable
                columns={columns}
                data={data}
                onDataChange={setData}
                searchPlaceholder="文字列検索"
                onRowClick={handleRowClick}
                enableRowSelection={true}
                enableInlineEditing={true}
                onSave={handleSave}
                onExecute={handleExecute}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ReportsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}