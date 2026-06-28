export interface PortfolioModel3 {
  id: string;
  balance: number;
  riskTolerance: 'low' | 'medium' | 'high';
  timestamp: Date;
}