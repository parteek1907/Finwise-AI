export interface PortfolioModel24 {
  id: string;
  balance: number;
  riskTolerance: 'low' | 'medium' | 'high';
  timestamp: Date;
}