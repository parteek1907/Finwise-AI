export interface PortfolioModel20 {
  id: string;
  balance: number;
  riskTolerance: 'low' | 'medium' | 'high';
  timestamp: Date;
}