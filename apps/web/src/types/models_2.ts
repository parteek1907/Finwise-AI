export interface PortfolioModel2 {
  id: string;
  balance: number;
  riskTolerance: 'low' | 'medium' | 'high';
  timestamp: Date;
}