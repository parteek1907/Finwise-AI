import { NextResponse } from 'next/server';
import { yahooProvider } from '@/lib/yahoo-provider';

export async function GET() {
  try {
    const rates = await yahooProvider.getExchangeRates();
    return NextResponse.json(rates);
  } catch (error: any) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json({
      USD: 1,
      INR: 96.56,
      EUR: 0.88,
      GBP: 0.75
    });
  }
}
