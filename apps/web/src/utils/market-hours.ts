export type MarketRegion = 'US' | 'IN' | 'CRYPTO';

export interface ExchangeStatus {
  isOpen: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
  timeUntilOpen?: string;
}

export const getMarketRegion = (exchange?: string): MarketRegion => {
  if (!exchange) return 'US';
  const ex = exchange.toUpperCase();
  if (ex === 'NSE' || ex === 'BSE' || ex === 'NIFTY') return 'IN';
  if (ex === 'CRYPTO') return 'CRYPTO';
  return 'US';
};

const formatTimeRemaining = (targetDate: Date, region: MarketRegion): string => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) return 'Opening now';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Choose timezone based on region
  const timeZone = region === 'IN' ? 'Asia/Kolkata' : 'America/New_York';
  const tzAbbr = region === 'IN' ? 'IST' : 'EST';
  
  const timeString = targetDate.toLocaleTimeString("en-US", { timeZone, hour: 'numeric', minute: '2-digit' });
  
  if (diffHours < 24 && now.getDate() !== targetDate.getDate()) {
    return `Opens Tomorrow • ${timeString} ${tzAbbr}`;
  } else if (diffHours < 24) {
    return `Opens Today • ${timeString} ${tzAbbr}`;
  }
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = new Date(targetDate.toLocaleString("en-US", { timeZone })).getDay();
  return `Opens ${days[targetDay]} • ${timeString} ${tzAbbr}`;
};

export const getExchangeStatus = (region: MarketRegion): ExchangeStatus => {
  if (region === 'CRYPTO') {
    return { isOpen: true }; // Crypto never sleeps
  }

  const now = new Date();
  
  if (region === 'US') {
    // US Market: 9:30 AM to 4:00 PM EST (Eastern Time)
    const estTimeStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const estDate = new Date(estTimeStr);
    
    const day = estDate.getDay();
    const isWeekend = day === 0 || day === 6;
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();
    
    const isOpen = !isWeekend && (
      (hours > 9 || (hours === 9 && minutes >= 30)) && 
      (hours < 16)
    );
    
    if (isOpen) {
      // Find today's close time (4:00 PM EST)
      return { isOpen: true };
    } else {
      // Find next open time
      const nextOpen = new Date(estDate);
      if (hours >= 16) {
        nextOpen.setDate(nextOpen.getDate() + (day === 5 ? 3 : day === 6 ? 2 : 1));
      } else if (day === 0) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      } else if (day === 6) {
        nextOpen.setDate(nextOpen.getDate() + 2);
      }
      nextOpen.setHours(9, 30, 0, 0);
      
      // Calculate diff using actual Date objects, converting back to local
      const msUntilOpen = nextOpen.getTime() - estDate.getTime();
      const localNextOpen = new Date(now.getTime() + msUntilOpen);
      
      return {
        isOpen: false,
        nextOpenTime: localNextOpen.toISOString(),
        timeUntilOpen: formatTimeRemaining(localNextOpen, region)
      };
    }
  } 
  
  if (region === 'IN') {
    // Indian Market: 9:15 AM to 3:30 PM IST (Asia/Kolkata)
    const istTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istTimeStr);
    
    const day = istDate.getDay();
    const isWeekend = day === 0 || day === 6;
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    
    const isOpen = !isWeekend && (
      (hours > 9 || (hours === 9 && minutes >= 15)) && 
      (hours < 15 || (hours === 15 && minutes < 30))
    );
    
    if (isOpen) {
      return { isOpen: true };
    } else {
      const nextOpen = new Date(istDate);
      if (hours > 15 || (hours === 15 && minutes >= 30)) {
        nextOpen.setDate(nextOpen.getDate() + (day === 5 ? 3 : day === 6 ? 2 : 1));
      } else if (day === 0) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      } else if (day === 6) {
        nextOpen.setDate(nextOpen.getDate() + 2);
      }
      nextOpen.setHours(9, 15, 0, 0);
      
      const msUntilOpen = nextOpen.getTime() - istDate.getTime();
      const localNextOpen = new Date(now.getTime() + msUntilOpen);
      
      return {
        isOpen: false,
        nextOpenTime: localNextOpen.toISOString(),
        timeUntilOpen: formatTimeRemaining(localNextOpen, region)
      };
    }
  }

  return { isOpen: true };
};
