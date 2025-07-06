/**
 * リスクアセスメント計算ライブラリ
 * リスクスコア、レベル、メトリクスの計算を担当
 */

import { RiskAssessment, RiskMetrics, RiskLevelCount, RiskMatrixData } from '@/types/risk-assessment';

// 定数定義
export const RISK_LEVELS = ['I', 'II', 'III', 'IV'] as const;
export const RISK_LEVEL_THRESHOLDS = {
  IV: 15,  // 足し算ベースの閾値に変更
  III: 12,
  II: 8,
  I: 0
} as const;

export const RISK_LEVEL_COLORS = {
  'IV': '#ef4444', // red-500 - 高リスク
  'III': '#f97316', // orange-500 - 中高リスク
  'II': '#eab308', // yellow-500 - 中リスク
  'I': '#22c55e', // green-500 - 低リスク
} as const;

/**
 * リスクスコアを計算する（足し算）
 * @param severity 重篤度 (1-10)
 * @param probability 発生確率 (1-6)
 * @param exposure 暴露頻度 (1-6)
 * @returns 計算されたリスクスコア
 * @throws {Error} 無効な入力値の場合
 */
export function calculateRiskScore(severity: number, probability: number, exposure: number): number {
  // 入力値のバリデーション
  if (!Number.isInteger(severity) || severity < 1 || severity > 10) {
    throw new Error(`重篤度は1-10の整数である必要があります。入力値: ${severity}`);
  }
  if (!Number.isInteger(probability) || probability < 1 || probability > 6) {
    throw new Error(`発生確率は1-6の整数である必要があります。入力値: ${probability}`);
  }
  if (!Number.isInteger(exposure) || exposure < 1 || exposure > 6) {
    throw new Error(`暴露頻度は1-6の整数である必要があります。入力値: ${exposure}`);
  }

  // 足し算でリスクスコアを計算
  return severity + probability + exposure;
}

/**
 * リスクスコアからリスクレベルを決定する
 * @param riskScore リスクスコア
 * @returns リスクレベル (I, II, III, IV)
 * @throws {Error} 無効なリスクスコアの場合
 */
export function getRiskLevel(riskScore: number): string {
  if (typeof riskScore !== 'number' || riskScore < 0) {
    throw new Error(`リスクスコアは0以上の数値である必要があります。入力値: ${riskScore}`);
  }

  if (riskScore >= RISK_LEVEL_THRESHOLDS.IV) return 'IV';
  if (riskScore >= RISK_LEVEL_THRESHOLDS.III) return 'III';
  if (riskScore >= RISK_LEVEL_THRESHOLDS.II) return 'II';
  return 'I';
}

/**
 * リスクレベルに対応する色を取得する
 * @param level リスクレベル
 * @returns 16進数カラーコード
 */
export function getRiskLevelColor(level: string): string {
  return RISK_LEVEL_COLORS[level as keyof typeof RISK_LEVEL_COLORS] || '#6b7280';
}

/**
 * リスクアセスメントデータからメトリクスを計算する
 * @param assessments リスクアセスメントデータ配列
 * @returns 計算されたメトリクス
 * @throws {Error} 空の配列が渡された場合
 */
export function calculateMetrics(assessments: RiskAssessment[]): RiskMetrics {
  if (!Array.isArray(assessments) || assessments.length === 0) {
    throw new Error('リスクアセスメントデータが空です');
  }

  const totalRisks = assessments.length;
  
  // リスクレベル別の件数を計算
  const highRisks = assessments.filter(a => ['IV', 'III'].includes(a.riskLevel)).length;
  const mediumRisks = assessments.filter(a => a.riskLevel === 'II').length;
  const lowRisks = assessments.filter(a => a.riskLevel === 'I').length;
  
  // 平均リスクスコアを計算
  const totalRiskScore = assessments.reduce((sum, a) => sum + a.riskScore, 0);
  const totalRiskScoreAfter = assessments.reduce((sum, a) => sum + a.riskScoreAfter, 0);
  const averageRiskScore = totalRiskScore / totalRisks;
  const averageRiskScoreAfter = totalRiskScoreAfter / totalRisks;
  
  // リスク低減率を計算
  const totalReduction = totalRiskScore - totalRiskScoreAfter;
  const riskReductionRate = totalRiskScore > 0 ? (totalReduction / totalRiskScore) * 100 : 0;
  
  // 改善率を計算（高リスクの減少率）
  const highRisksAfter = assessments.filter(a => ['IV', 'III'].includes(a.riskLevelAfter)).length;
  const improvementRate = highRisks > 0 ? ((highRisks - highRisksAfter) / highRisks) * 100 : 0;
  
  return {
    totalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    averageRiskScore: Number(averageRiskScore.toFixed(2)),
    averageRiskScoreAfter: Number(averageRiskScoreAfter.toFixed(2)),
    improvementRate: Number(improvementRate.toFixed(2)),
    riskReductionRate: Number(riskReductionRate.toFixed(2)),
  };
}

/**
 * リスクレベル別の件数を取得する
 * @param assessments リスクアセスメントデータ配列
 * @param isAfter 対策後のデータを使用するかどうか
 * @returns リスクレベル別件数配列
 */
export function getRiskLevelCounts(assessments: RiskAssessment[], isAfter: boolean = false): RiskLevelCount[] {
  if (!Array.isArray(assessments)) {
    throw new Error('assessmentsは配列である必要があります');
  }

  const field = isAfter ? 'riskLevelAfter' : 'riskLevel';
  
  return RISK_LEVELS.map(level => ({
    level,
    count: assessments.filter(a => a[field] === level).length,
    color: getRiskLevelColor(level),
  }));
}

/**
 * リスクマトリックスデータを作成する
 * @param assessments リスクアセスメントデータ配列
 * @param isAfter 対策後のデータを使用するかどうか
 * @returns リスクマトリックスデータ配列
 */
export function createRiskMatrix(assessments: RiskAssessment[], isAfter: boolean = false): RiskMatrixData[] {
  if (!Array.isArray(assessments)) {
    throw new Error('assessmentsは配列である必要があります');
  }

  const matrix: RiskMatrixData[] = [];
  const severityField = isAfter ? 'severityAfter' : 'severity';
  const probabilityField = isAfter ? 'probabilityAfter' : 'probability';
  
  // 重篤度1-10、発生確率1-6の全組み合わせをチェック
  for (let severity = 1; severity <= 10; severity++) {
    for (let probability = 1; probability <= 6; probability++) {
      const risks = assessments.filter(
        a => a[severityField] === severity && a[probabilityField] === probability
      );
      
      if (risks.length > 0) {
        matrix.push({
          severity,
          probability,
          count: risks.length,
          risks,
        });
      }
    }
  }
  
  return matrix;
}

/**
 * リスクアセスメントデータを検証し、計算フィールドを更新する
 * @param assessment リスクアセスメントデータ
 * @returns 検証・更新されたリスクアセスメントデータ
 */
export function validateAndCalculateRiskAssessment(assessment: RiskAssessment): RiskAssessment {
  try {
    // 対策前のリスクスコアとレベルを計算
    const riskScore = calculateRiskScore(assessment.severity, assessment.probability, assessment.exposure);
    const riskLevel = getRiskLevel(riskScore);
    
    // 対策後のリスクスコアとレベルを計算
    const riskScoreAfter = calculateRiskScore(assessment.severityAfter, assessment.probabilityAfter, assessment.exposureAfter);
    const riskLevelAfter = getRiskLevel(riskScoreAfter);
    
    return {
      ...assessment,
      riskScore,
      riskLevel,
      riskScoreAfter,
      riskLevelAfter,
    };
  } catch (error) {
    console.error(`リスクアセスメントID ${assessment.id} の計算でエラーが発生しました:`, error);
    throw new Error(`リスクアセスメントデータの計算に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}