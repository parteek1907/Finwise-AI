export interface PortfolioModel12 {
  id: string;
  balance: number;
  riskTolerance: 'low' | 'medium' | 'high';
  timestamp: Date;
}