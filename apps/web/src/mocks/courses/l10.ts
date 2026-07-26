export const course10 = {
  chapters: [
    {
      title: "Chapter 1: The Other Side of the Mountain",
      content: [
        { type: 'text', content: "Most financial advice focuses heavily on the accumulation phase: how to save, how to invest, and how to build a massive portfolio. But accumulating wealth is only half the battle." },
        { type: 'text', content: "The other half—the distribution phase—is arguably much harder. This is the process of withdrawing your money in a way that ensures you don't run out of money before you run out of life." },
        { type: 'alert', content: "If you screw up the accumulation phase, you just work a few years longer. If you screw up the distribution phase at age 80, you have no way to generate new income. The stakes are incredibly high." }
      ],
      miniQuiz: {
        question: "Why is the distribution (withdrawal) phase of retirement often considered more critical than the accumulation phase?",
        options: ["Because you pay higher taxes", "Because if you run out of money late in life, you cannot easily re-enter the workforce to generate new income", "Because the stock market always crashes when you retire", "Because banks charge higher fees for withdrawals"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 2: Sequence of Returns Risk",
      content: [
        { type: 'text', content: "The biggest threat to a new retiree is 'Sequence of Returns Risk'. This is the danger that the stock market crashes in the very early years of your retirement." },
        { type: 'text', content: "If the market drops 30% in year one, and you are forced to sell stocks to pay your living expenses, you are locking in massive losses. When the market eventually recovers, you have far fewer shares left to capture the upside." },
        { type: 'alert', content: "A market crash in year 1 of retirement can devastate a portfolio, whereas the exact same crash occurring in year 15 of retirement might have almost no impact on your long-term success." }
      ],
      miniQuiz: {
        question: "What is Sequence of Returns Risk?",
        options: ["The risk of living longer than expected", "The risk of high inflation destroying purchasing power", "The risk of experiencing a severe market crash early in retirement, forcing you to sell assets at depressed prices", "The risk of the government raising taxes"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 3: Mitigating the Risk",
      content: [
        { type: 'text', content: "How do you defend against a market crash early in retirement?" },
        { type: 'heading', content: "The Cash Buffer" },
        { type: 'text', content: "Many retirees keep 1 to 3 years' worth of living expenses in cash or short-term bonds. If the stock market crashes, they simply spend the cash buffer and DO NOT sell any of their stocks while they are down. This gives the market time to recover." },
        { type: 'heading', content: "Asset Allocation Shift" },
        { type: 'text', content: "This is also why retirees shift their portfolios from 90% stocks down to 60% or 40% stocks as they approach retirement age. The bonds act as a shock absorber against a severe crash." }
      ],
      miniQuiz: {
        question: "What is the purpose of holding a 1-3 year 'cash buffer' in retirement?",
        options: ["To buy luxury items", "To avoid selling stocks at a loss during a market crash by spending the cash instead", "To give to charity", "To avoid all taxes"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 4: The 4% Rule",
      content: [
        { type: 'text', content: "How much can you safely withdraw each year?" },
        { type: 'text', content: "In 1998, researchers published the Trinity Study. They tested various withdrawal rates against every historical market condition. They found that if a retiree withdrew 4% of their initial portfolio value in the first year, and then adjusted that dollar amount for inflation every subsequent year, the portfolio would have survived for 30 years in almost 100% of historical scenarios." },
        { type: 'alert', content: "This became known as the '4% Rule'. It is the golden rule of thumb for financial independence." }
      ],
      miniQuiz: {
        question: "Based on the Trinity Study, what is the '4% Rule'?",
        options: ["A rule stating you must earn a 4% dividend yield", "A safe withdrawal rate that historically prevented a 60/40 portfolio from running out of money over a 30-year period", "A 4% tax levied on all retirement accounts", "A required 4% match from your employer"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 5: Calculating Your Number",
      content: [
        { type: 'text', content: "You can use the 4% rule in reverse to figure out exactly how much money you need to retire." },
        { type: 'text', content: "Simply take your desired annual retirement expenses and multiply by 25 (which is the mathematical equivalent of dividing by 4%)." },
        { type: 'heading', content: "Example" },
        { type: 'text', content: "If you want to live on $60,000 a year in retirement: $60,000 x 25 = $1,500,000. \nYou need a portfolio of 1.5 million dollars to safely generate $60k a year." }
      ],
      miniQuiz: {
        question: "If you determine you need $80,000 a year to live comfortably in retirement, what is your target portfolio size according to the 4% rule math (x 25)?",
        options: ["$800,000", "$1,000,000", "$2,000,000", "$4,000,000"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 6: Dynamic Withdrawals",
      content: [
        { type: 'text', content: "While the 4% rule is a great baseline, rigidly pulling exactly 4% plus inflation every year is dangerous if the market goes into a severe multi-year depression." },
        { type: 'text', content: "Modern financial planners recommend a 'Dynamic Withdrawal Strategy'." },
        { type: 'text', content: "This means being flexible. If the market is booming, you might take a nice vacation. If the market crashes heavily, you 'tighten your belt', skip the vacation, and reduce your withdrawal rate to 3% for a year or two to protect the principal." }
      ],
      miniQuiz: {
        question: "What is the primary benefit of a 'Dynamic Withdrawal Strategy' over a rigid 4% rule?",
        options: ["It legally avoids all taxes", "It allows you to reduce withdrawals during market downturns to protect your portfolio from sequence of returns risk", "It guarantees a 10% return", "It forces you to spend more money"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 7: Tax Strategy in Drawdown",
      content: [
        { type: 'text', content: "Which account do you pull money from first: Traditional, Roth, or Taxable Brokerage?" },
        { type: 'text', content: "Generally, retirees spend down their taxable brokerage accounts first. This allows their tax-advantaged accounts (Traditional and Roth IRAs) to continue compounding tax-free for as long as possible." },
        { type: 'text', content: "Later in retirement, they strategically pull from Traditional and Roth accounts to carefully manage their tax brackets." }
      ],
      miniQuiz: {
        question: "As a general rule of thumb, which account type should a retiree usually withdraw from FIRST?",
        options: ["Roth IRA", "Traditional 401(k)", "Taxable Brokerage", "A high-interest credit card"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 8: Required Minimum Distributions (RMDs)",
      content: [
        { type: 'text', content: "The government gave you a tax break on your Traditional 401(k) and IRA for decades. Eventually, they want their tax money." },
        { type: 'alert', content: "By law, starting at age 73 (as of recent laws), the IRS forces you to withdraw a certain percentage of your Traditional retirement accounts every year and pay taxes on it. These are called Required Minimum Distributions (RMDs)." },
        { type: 'text', content: "If you fail to take your RMD, the IRS hits you with a massive penalty (currently 25% of the amount you were supposed to withdraw)." },
        { type: 'text', content: "Note: Roth accounts do NOT have RMDs during your lifetime, because the government already got their tax money upfront." }
      ],
      miniQuiz: {
        question: "What is an RMD (Required Minimum Distribution)?",
        options: ["A guaranteed monthly payment from the government", "A mandatory annual withdrawal from Traditional retirement accounts starting at age 73", "The minimum amount you must invest each month", "A fee paid to brokers"],
        answerIndex: 1
      }
    }
  ],
  finalQuiz: [
    {
      id: "l10-q1",
      question: "Why is the 'distribution phase' considered by some to be riskier than the 'accumulation phase'?",
      options: ["Taxes are automatically higher", "If you deplete your portfolio late in life, you likely cannot re-enter the workforce to fix it", "Brokers charge higher fees on withdrawals", "Inflation only happens during retirement"],
      answerIndex: 1
    },
    {
      id: "l10-q2",
      question: "What is 'Sequence of Returns Risk'?",
      options: ["The risk of outliving your money due to a long lifespan", "The risk of a severe market crash occurring in the first few years of retirement", "The risk of investing in the wrong sequence of stocks", "The risk of hyperinflation"],
      answerIndex: 1
    },
    {
      id: "l10-q3",
      question: "How does a 'cash buffer' protect against Sequence of Returns Risk?",
      options: ["It earns a higher return than stocks", "It prevents you from having to sell stocks at a massive loss during a market crash", "It legally shields you from IRS audits", "It guarantees you will win the lottery"],
      answerIndex: 1
    },
    {
      id: "l10-q4",
      question: "What was the main finding of the Trinity Study (The 4% Rule)?",
      options: ["Stocks always return 4% a year", "A 4% inflation-adjusted withdrawal rate historically allowed a balanced portfolio to survive 30 years", "You must pay 4% in taxes in retirement", "You should only hold 4% of your portfolio in stocks"],
      answerIndex: 1
    },
    {
      id: "l10-q5",
      question: "If you calculate that you need $50,000 a year from your investments to survive in retirement, how large must your portfolio be according to the 4% rule (x25)?",
      options: ["$500,000", "$1,000,000", "$1,250,000", "$2,000,000"],
      answerIndex: 2
    },
    {
      id: "l10-q6",
      question: "What does a 'Dynamic Withdrawal Strategy' involve?",
      options: ["Automatically selling all stocks", "Adjusting your withdrawal amount down during bad market years to preserve principal", "Taking out a flat $10,000 every single month regardless of market conditions", "Borrowing money on margin"],
      answerIndex: 1
    },
    {
      id: "l10-q7",
      question: "Why do financial planners often recommend withdrawing from taxable brokerage accounts before tax-advantaged accounts in early retirement?",
      options: ["Because taxable accounts have higher fees", "Because it allows tax-advantaged accounts to compound tax-free for longer", "Because it is illegal to touch an IRA before age 80", "Because taxable accounts earn higher interest"],
      answerIndex: 1
    },
    {
      id: "l10-q8",
      question: "What is a Required Minimum Distribution (RMD)?",
      options: ["The minimum amount you must invest to open an account", "A legally mandated annual withdrawal from Traditional accounts starting in your 70s", "The minimum age to collect Social Security", "A guaranteed dividend payment"],
      answerIndex: 1
    },
    {
      id: "l10-q9",
      question: "What happens if you fail to take your RMD?",
      options: ["Nothing", "Your account is closed", "You are hit with a severe IRS penalty on the amount you were supposed to withdraw", "You get a tax deduction"],
      answerIndex: 2
    },
    {
      id: "l10-q10",
      question: "Which of the following accounts does NOT have Required Minimum Distributions (RMDs) during the original owner's lifetime?",
      options: ["Traditional 401(k)", "Traditional IRA", "Roth IRA", "403(b)"],
      answerIndex: 2
    }
  ]
};
