const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 5);
    const res = await yahooFinance.chart('AAPL', { period1, interval: '5m' });
    console.log("Quotes count:", res.quotes.length);
    if (res.quotes.length > 0) {
      console.log("First quote:", res.quotes[0].date);
      console.log("Last quote:", res.quotes[res.quotes.length - 1].date);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
