// レポート計算ユーティリティ
// 変更理由: 複雑な計算ロジックの分離と再利用性向上
import { RiskAssessment } from '@/types/risk-assessment';
import { RISK_LEVEL_COLORS } from '@/lib/risk-calculations';

// 基本統計の計算
export function calculateBasicStats(data: RiskAssessment[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      totalRisks: 0,
      highRisks: 0,
      highRisksAfter: 0,
      improvementRate: 0,
      riskReductionRate: 0
    };
  }

  const totalRisks = data.length;
  const highRisks = data.filter(a => ['IV', 'III'].includes(a.riskLevel)).length;
  const highRisksAfter = data.filter(a => ['IV', 'III'].includes(a.riskLevelAfter)).length;
  
  const improvementRate = highRisks > 0 ? ((highRisks - highRisksAfter) / highRisks) * 100 : 0;
  
  const totalRiskScore = data.reduce((sum, a) => sum + a.riskScore, 0);
  const totalRiskScoreAfter = data.reduce((sum, a) => sum + a.riskScoreAfter, 0);
  const riskReductionRate = totalRiskScore > 0 ? ((totalRiskScore - totalRiskScoreAfter) / totalRiskScore) * 100 : 0;

  return {
    totalRisks,
    highRisks,
    highRisksAfter,
    improvementRate,
    riskReductionRate
  };
}

// リスクレベル分布の計算
export function calculateRiskLevelDistribution(data: RiskAssessment[], isAfter: boolean = false) {
  const levels = ['I', 'II', 'III', 'IV'];
  const field = isAfter ? 'riskLevelAfter' : 'riskLevel';
  
  return levels.map(level => ({
    level,
    count: data.filter(a => a[field] === level).length,
    color: RISK_LEVEL_COLORS[level as keyof typeof RISK_LEVEL_COLORS] || '#6b7280',
  }));
}

// 対策前後比較データの作成
export function createComparisonData(data: RiskAssessment[]) {
  const levels = ['I', 'II', 'III', 'IV'];
  const beforeData = calculateRiskLevelDistribution(data, false);
  const afterData = calculateRiskLevelDistribution(data, true);
  
  return levels.map(level => ({
    level: `レベル ${level}`,
    対策前: beforeData.find(item => item.level === level)?.count || 0,
    対策後: afterData.find(item => item.level === level)?.count || 0,
  }));
}

// 対策分類分布の計算
export function calculateMeasureTypeDistribution(data: RiskAssessment[]) {
  const measureTypes = {
    '設計時対策': 0,
    '工学的対策': 0,
    '管理的対策': 0,
    '個人用保護具': 0
  };

  data.forEach(assessment => {
    const type = assessment.measureType;
    if (type in measureTypes) {
      measureTypes[type as keyof typeof measureTypes]++;
    } else {
      measureTypes['設計時対策']++;
    }
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  return Object.entries(measureTypes)
    .filter(([_, count]) => count > 0)
    .map(([type, count], index) => ({
      name: type,
      value: count,
      color: colors[index % colors.length]
    }));
}

// ランキングデータの作成
export function createRankingData(data: RiskAssessment[], field: keyof RiskAssessment, limit: number = 5, isAfter: boolean = false) {
  // 対策前後に応じてフィールドを選択
  let sortField: keyof RiskAssessment;
  
  if (isAfter) {
    switch (field) {
      case 'riskScore':
        sortField = 'riskScoreAfter';
        break;
      case 'severity':
        sortField = 'severityAfter';
        break;
      case 'probability':
        sortField = 'probabilityAfter';
        break;
      case 'exposure':
        sortField = 'exposureAfter';
        break;
      default:
        sortField = field;
    }
  } else {
    sortField = field;
  }
  
  return data
    .sort((a, b) => (b[sortField] as number) - (a[sortField] as number))
    .slice(0, limit);
}

// エラーハンドリング付きの安全な計算関数
export function safeCalculateReportData(data: RiskAssessment[]) {
  try {
    if (!Array.isArray(data)) {
      throw new Error('データが配列ではありません');
    }

    return {
      basicStats: calculateBasicStats(data),
      riskLevelsBefore: calculateRiskLevelDistribution(data, false),
      riskLevelsAfter: calculateRiskLevelDistribution(data, true),
      comparisonData: createComparisonData(data),
      measureTypeData: calculateMeasureTypeDistribution(data),
      // 対策前のランキング
      riskScoreRankingBefore: createRankingData(data, 'riskScore', 5, false),
      severityRankingBefore: createRankingData(data, 'severity', 5, false),
      probabilityRankingBefore: createRankingData(data, 'probability', 5, false),
      exposureRankingBefore: createRankingData(data, 'exposure', 5, false),
      // 対策後のランキング
      riskScoreRankingAfter: createRankingData(data, 'riskScore', 5, true),
      severityRankingAfter: createRankingData(data, 'severity', 5, true),
      probabilityRankingAfter: createRankingData(data, 'probability', 5, true),
      exposureRankingAfter: createRankingData(data, 'exposure', 5, true),
    };
  } catch (error) {
    console.error('レポートデータ計算エラー:', error);
    return null;
  }
}