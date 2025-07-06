export interface RiskAssessment {
  id: number;
  work: string;
  workElement: string;
  knowledgeFile: string;
  reference: string;
  hazard: string;
  riskReduction: string;
  measureType: string;
  severity: number;
  probability: number;
  exposure: number;
  riskScore: number;
  riskLevel: string;
  severityAfter: number;
  probabilityAfter: number;
  exposureAfter: number;
  riskScoreAfter: number;
  riskLevelAfter: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskMetrics {
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  averageRiskScore: number;
  averageRiskScoreAfter: number;
  improvementRate: number;
  riskReductionRate: number;
}

export interface RiskLevelCount {
  level: string;
  count: number;
  color: string;
}

export interface RiskMatrixData {
  severity: number;
  probability: number;
  count: number;
  risks: RiskAssessment[];
}

export interface SankeyData {
  source: string;
  target: string;
  value: number;
}