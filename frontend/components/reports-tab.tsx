// レポートタブ - リファクタリング済み
// 変更点: report-utilsの使用、エラーハンドリング改善、パフォーマンス最適化
'use client';

import { useMemo } from 'react';
import { RiskAssessment } from '@/types/risk-assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Printer } from 'lucide-react';
import { safeCalculateReportData } from '@/lib/report-utils';

interface ReportsTabProps {
  data: RiskAssessment[];
}

// ランキングカードコンポーネント（分離して可読性向上）
function RankingCard({ 
  title, 
  ranking, 
  scoreField,
  isAfter = false
}: { 
  title: string; 
  ranking: RiskAssessment[]; 
  scoreField: keyof RiskAssessment; 
  isAfter?: boolean;
}) {
  // 対策前後に応じて表示するフィールドを決定
  const getDisplayValue = (risk: RiskAssessment) => {
    if (isAfter) {
      switch (scoreField) {
        case 'riskScore':
          return risk.riskScoreAfter;
        case 'severity':
          return risk.severityAfter;
        case 'probability':
          return risk.probabilityAfter;
        case 'exposure':
          return risk.exposureAfter;
        default:
          return risk[scoreField];
      }
    }
    return risk[scoreField];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranking.map((risk, index) => (
            <div key={risk.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start space-x-2.5">
                <div className="flex-shrink-0 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1.5">
                  {/* ヘッダー情報 */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{risk.work}</h4>
                    <p className="text-xs text-slate-600">{risk.workElement}</p>
                  </div>
                  
                  {/* スコア情報 */}
                  <div className="flex items-center space-x-1.5">
                    <Badge variant="destructive" className="text-xs px-2 py-0.5 font-bold">
                      {scoreField === 'riskScore' ? 'リスクスコア' : 
                       scoreField === 'severity' ? '重篤度' :
                       scoreField === 'probability' ? '発生確率' : '暴露頻度'}: {getDisplayValue(risk)}
                    </Badge>
                  </div>
                  
                  {/* 詳細情報 */}
                  <div className="space-y-0.5">
                    <div>
                      <span className="text-xs font-medium text-slate-500">危険性・有害性:</span>
                      <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">{risk.hazard}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500">リスク低減措置:</span>
                      <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">{risk.riskReduction}</p>
                    </div>
                  </div>
                  
                  {/* 数値データ */}
                  {/* 対策前後の数値比較 */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-2.5 rounded-lg border border-red-200 shadow-sm">
                        <div className="font-bold text-red-900 mb-2 text-xs tracking-wide">対策前</div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-red-700 text-xs">重篤度</span>
                            <span className="font-bold text-red-800 text-sm">{risk.severity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-700 text-xs">発生確率</span>
                            <span className="font-bold text-red-800 text-sm">{risk.probability}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-700 text-xs">暴露頻度</span>
                            <span className="font-bold text-red-800 text-sm">{risk.exposure}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-red-300 pt-1 mt-2">
                            <span className="text-red-800 font-semibold text-xs">リスクスコア</span>
                            <span className="font-bold text-red-900 text-base">{risk.riskScore}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-800 font-semibold text-xs">リスクレベル</span>
                            <Badge variant="destructive" className="text-xs px-2 py-0.5 font-bold">
                              {risk.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-2.5 rounded-lg border border-green-200 shadow-sm">
                        <div className="font-bold text-green-900 mb-2 text-xs tracking-wide">対策後</div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 text-xs">重篤度</span>
                            <span className="font-bold text-green-800 text-sm">{risk.severityAfter}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 text-xs">発生確率</span>
                            <span className="font-bold text-green-800 text-sm">{risk.probabilityAfter}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 text-xs">暴露頻度</span>
                            <span className="font-bold text-green-800 text-sm">{risk.exposureAfter}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-green-300 pt-1 mt-2">
                            <span className="text-green-800 font-semibold text-xs">リスクスコア</span>
                            <span className="font-bold text-green-900 text-base">{risk.riskScoreAfter}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-800 font-semibold text-xs">リスクレベル</span>
                            <Badge className="text-xs px-2 py-0.5 font-bold bg-green-600 text-white border-green-600 hover:bg-green-700">
                              {risk.riskLevelAfter}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 区切り線と引用（最下部に配置） */}
                  <div className="pt-1.5 border-t border-slate-200 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {risk.measureType}
                      </Badge>
                      <span className="text-xs text-slate-500 truncate">{risk.knowledgeFile}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsTab({ data }: ReportsTabProps) {
  // レポートデータの計算（メモ化でパフォーマンス最適化）
  const reportData = useMemo(() => {
    return safeCalculateReportData(data);
  }, [data]);

  // データが無効な場合のエラー表示
  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-500 py-8">
          <p>レポートデータの計算中にエラーが発生しました</p>
          <p className="text-sm text-gray-500 mt-2">データを確認してください</p>
        </div>
      </div>
    );
  }

  const {
    basicStats,
    riskLevelsBefore,
    riskLevelsAfter,
    comparisonData,
    measureTypeData,
    riskScoreRankingBefore,
    severityRankingBefore,
    probabilityRankingBefore,
    exposureRankingBefore,
    riskScoreRankingAfter,
    severityRankingAfter,
    probabilityRankingAfter,
    exposureRankingAfter,
  } = reportData;

  return (
    <>
      {/* 基本統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{basicStats.totalRisks}</div>
            <p className="text-sm text-slate-600">総リスク数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{basicStats.highRisks}</div>
            <p className="text-sm text-slate-600">高リスク数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{basicStats.improvementRate.toFixed(1)}%</div>
            <p className="text-sm text-slate-600">改善率</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{basicStats.riskReductionRate.toFixed(1)}%</div>
            <p className="text-sm text-slate-600">リスク低減率</p>
          </CardContent>
        </Card>
      </div>

      {/* 対策前後のリスク分布比較 */}
      <Card>
        <CardHeader>
          <CardTitle>対策前後のリスクレベル比較</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {`${entry.dataKey}: ${entry.value}件`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="対策前" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="対策後" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 対策前後のリスク分布 */}
      <Card>
        <CardHeader>
          <CardTitle>対策前後のリスク分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 対策前 */}
            <div>
              <h3 className="text-lg font-semibold text-center mb-4">対策前</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskLevelsBefore.filter(item => item.count > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ level, count, percent }) => `${level}: ${count} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {riskLevelsBefore.filter(item => item.count > 0).map((entry, index) => (
                        <Cell key={`cell-before-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = riskLevelsBefore.reduce((sum, item) => sum + item.count, 0);
                          const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0.0';
                          return (
                            <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                              <p className="font-medium">リスクレベル {data.level}</p>
                              <p className="text-sm text-slate-600">{`件数: ${data.count}`}</p>
                              <p className="text-sm text-slate-600">{`割合: ${percentage}%`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 対策後 */}
            <div>
              <h3 className="text-lg font-semibold text-center mb-4">対策後</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskLevelsAfter.filter(item => item.count > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ level, count, percent }) => `${level}: ${count} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {riskLevelsAfter.filter(item => item.count > 0).map((entry, index) => (
                        <Cell key={`cell-after-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = riskLevelsAfter.reduce((sum, item) => sum + item.count, 0);
                          const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0.0';
                          return (
                            <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                              <p className="font-medium">リスクレベル {data.level}</p>
                              <p className="text-sm text-slate-600">{`件数: ${data.count}`}</p>
                              <p className="text-sm text-slate-600">{`割合: ${percentage}%`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 対策分類の構成 */}
      <Card>
        <CardHeader>
          <CardTitle>対策分類の構成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={measureTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {measureTypeData.map((entry, index) => (
                    <Cell key={`cell-measure-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const total = measureTypeData.reduce((sum, item) => sum + item.value, 0);
                      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-slate-600">{`件数: ${data.value}`}</p>
                          <p className="text-sm text-slate-600">{`割合: ${percentage}%`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ランキング項目（タブ形式） */}
      <Card>
        <CardHeader>
          <CardTitle>項目別ランキング（TOP 5）</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="before" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="before">対策前</TabsTrigger>
              <TabsTrigger value="after">対策後</TabsTrigger>
            </TabsList>
            
            <TabsContent value="before" className="mt-4">
              <Tabs defaultValue="riskScore" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="riskScore">リスクスコア</TabsTrigger>
                  <TabsTrigger value="severity">重篤度</TabsTrigger>
                  <TabsTrigger value="probability">発生確率</TabsTrigger>
                  <TabsTrigger value="exposure">暴露頻度</TabsTrigger>
                </TabsList>
                
                <TabsContent value="riskScore" className="mt-4">
                  <RankingCard 
                    title="対策前 リスクスコア TOP 5" 
                    ranking={riskScoreRankingBefore} 
                    scoreField="riskScore" 
                    isAfter={false}
                  />
                </TabsContent>
                
                <TabsContent value="severity" className="mt-4">
                  <RankingCard 
                    title="対策前 重篤度 TOP 5" 
                    ranking={severityRankingBefore} 
                    scoreField="severity" 
                    isAfter={false}
                  />
                </TabsContent>
                
                <TabsContent value="probability" className="mt-4">
                  <RankingCard 
                    title="対策前 発生確率 TOP 5" 
                    ranking={probabilityRankingBefore} 
                    scoreField="probability" 
                    isAfter={false}
                  />
                </TabsContent>
                
                <TabsContent value="exposure" className="mt-4">
                  <RankingCard 
                    title="対策前 暴露頻度 TOP 5" 
                    ranking={exposureRankingBefore} 
                    scoreField="exposure" 
                    isAfter={false}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="after" className="mt-4">
              <Tabs defaultValue="riskScore" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="riskScore">リスクスコア</TabsTrigger>
                  <TabsTrigger value="severity">重篤度</TabsTrigger>
                  <TabsTrigger value="probability">発生確率</TabsTrigger>
                  <TabsTrigger value="exposure">暴露頻度</TabsTrigger>
                </TabsList>
                
                <TabsContent value="riskScore" className="mt-4">
                  <RankingCard 
                    title="対策後 リスクスコア TOP 5" 
                    ranking={riskScoreRankingAfter} 
                    scoreField="riskScore" 
                    isAfter={true}
                  />
                </TabsContent>
                
                <TabsContent value="severity" className="mt-4">
                  <RankingCard 
                    title="対策後 重篤度 TOP 5" 
                    ranking={severityRankingAfter} 
                    scoreField="severity" 
                    isAfter={true}
                  />
                </TabsContent>
                
                <TabsContent value="probability" className="mt-4">
                  <RankingCard 
                    title="対策後 発生確率 TOP 5" 
                    ranking={probabilityRankingAfter} 
                    scoreField="probability" 
                    isAfter={true}
                  />
                </TabsContent>
                
                <TabsContent value="exposure" className="mt-4">
                  <RankingCard 
                    title="対策後 暴露頻度 TOP 5" 
                    ranking={exposureRankingAfter} 
                    scoreField="exposure" 
                    isAfter={true}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}