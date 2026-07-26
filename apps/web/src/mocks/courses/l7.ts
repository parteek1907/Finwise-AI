export const course7 = {
  chapters: [
    {
      title: "Chapter 1: The Engine of Returns",
      content: [
        { type: 'text', content: "Asset allocation is an investment strategy that aims to balance risk and reward by apportioning a portfolio's assets according to an individual's goals, risk tolerance, and investment horizon." },
        { type: 'alert', content: "Numerous academic studies have shown that asset allocation is the primary driver of your portfolio's returns, accounting for roughly 90% of your long-term success. The specific individual stocks or mutual funds you pick only account for the remaining 10%." },
        { type: 'text', content: "In other words, deciding HOW MUCH of your money is in stocks versus bonds is far more important than deciding WHICH stocks to buy." }
      ],
      miniQuiz: {
        question: "What is the primary driver of a portfolio's long-term returns?",
        options: ["Picking the right individual tech stocks", "Market timing", "Overall Asset Allocation", "Trading frequency"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 2: The Core Asset Classes",
      content: [
        { type: 'text', content: "There are three main traditional asset classes: Equities (Stocks), Fixed Income (Bonds), and Cash Equivalents." },
        { type: 'heading', content: "Stocks (Equities)" },
        { type: 'text', content: "When you buy a stock, you are buying a tiny piece of ownership in a business. Stocks offer the highest potential returns over the long run, but they are highly volatile and can crash 30-50% in a given year." },
        { type: 'heading', content: "Bonds (Fixed Income)" },
        { type: 'text', content: "When you buy a bond, you are lending money to a company or government. They agree to pay you a fixed interest rate over a set period. Bonds offer lower returns than stocks, but provide much-needed stability to a portfolio during market crashes." }
      ],
      miniQuiz: {
        question: "What is the fundamental difference between a stock and a bond?",
        options: ["Stocks are loans, bonds are ownership", "Stocks are ownership in a company, bonds are loans to an entity", "Stocks always go up, bonds always go down", "There is no difference"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 3: The 60/40 Rule",
      content: [
        { type: 'heading', content: "The Classic Balanced Portfolio" },
        { type: 'text', content: "For decades, the standard balanced portfolio consisted of 60% stocks and 40% bonds. The idea was that the 60% in stocks would provide the growth engine, while the 40% in bonds would act as a shock absorber during recessions." },
        { type: 'text', content: "When the stock market crashes, bonds usually hold their value or even go up, as investors flee to safety." },
        { type: 'alert', content: "While 60/40 is a great baseline, your specific allocation should depend on your age." }
      ],
      miniQuiz: {
        question: "What is the purpose of the 40% bond allocation in a traditional 60/40 portfolio?",
        options: ["To maximize aggressive growth", "To act as a shock absorber and reduce volatility during stock market crashes", "To legally avoid paying taxes", "To track the price of gold"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 4: Age and Risk Tolerance",
      content: [
        { type: 'text', content: "Your investment horizon (how long until you need the money) is the most critical factor in asset allocation." },
        { type: 'text', content: "A 25-year-old who won't touch their money for 40 years can afford a massive stock market crash, because they have decades for the market to recover. They might choose a 90% stock / 10% bond allocation." },
        { type: 'text', content: "A 65-year-old retiring tomorrow cannot afford a 40% drop in their portfolio. They need stability. They might choose a 40% stock / 60% bond allocation." },
        { type: 'heading', content: "The Rule of 110" },
        { type: 'text', content: "A simple rule of thumb: Subtract your age from 110. The result is the percentage of your portfolio that should be in stocks. If you are 30: 110 - 30 = 80% stocks." }
      ],
      miniQuiz: {
        question: "Why should a younger investor generally hold a higher percentage of stocks?",
        options: ["Because stocks pay higher dividends than bonds", "Because they have a longer time horizon to recover from inevitable market crashes", "Because bonds are illegal for young people", "Because younger people pay lower taxes"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 5: Rebalancing",
      content: [
        { type: 'text', content: "Over time, your asset allocation will drift. If you start with a 60/40 portfolio, and the stock market has a massive boom, your portfolio might drift to 80% stocks and 20% bonds." },
        { type: 'alert', content: "This means you are now taking on more risk than you originally intended." },
        { type: 'text', content: "To fix this, you must 'Rebalance'. This involves selling some of your high-performing stocks (selling high) and using the money to buy more bonds (buying low) to return your portfolio to its target 60/40 split." }
      ],
      miniQuiz: {
        question: "What is the purpose of portfolio rebalancing?",
        options: ["To pay more taxes to the government", "To return a drifted portfolio back to its target risk level", "To eliminate bonds entirely", "To pick the best performing stocks"],
        answerIndex: 1
      }
    }
  ],
  finalQuiz: [
    {
      id: "l7-q1",
      question: "What factor is responsible for roughly 90% of a portfolio's long-term returns?",
      options: ["Stock picking", "Market timing", "Asset allocation", "The broker you use"],
      answerIndex: 2
    },
    {
      id: "l7-q2",
      question: "Which of the following represents an ownership stake in a company?",
      options: ["A corporate bond", "A treasury bill", "A stock (equity)", "A certificate of deposit"],
      answerIndex: 2
    },
    {
      id: "l7-q3",
      question: "What is the primary role of bonds in a portfolio?",
      options: ["To generate massive capital gains", "To provide stability and act as a shock absorber during stock market declines", "To increase overall risk", "To eliminate the need for diversification"],
      answerIndex: 1
    },
    {
      id: "l7-q4",
      question: "What is the traditional 'Balanced Portfolio' ratio?",
      options: ["100% Stocks", "60% Stocks / 40% Bonds", "50% Real Estate / 50% Gold", "90% Bonds / 10% Stocks"],
      answerIndex: 1
    },
    {
      id: "l7-q5",
      question: "How does a long investment horizon affect your risk tolerance?",
      options: ["It decreases your risk tolerance because the future is unknown", "It increases your risk tolerance because you have time to recover from market crashes", "It has no effect on risk tolerance", "It legally requires you to hold more bonds"],
      answerIndex: 1
    },
    {
      id: "l7-q6",
      question: "According to the 'Rule of 110', what percentage of their portfolio should a 40-year-old hold in stocks?",
      options: ["40%", "60%", "70%", "100%"],
      answerIndex: 2
    },
    {
      id: "l7-q7",
      question: "Why might a retiree hold a larger percentage of bonds than a 25-year-old?",
      options: ["Bonds offer higher long-term returns", "Retirees need capital preservation and income stability rather than aggressive growth", "It is legally mandated for retirees", "Bonds are tax-free"],
      answerIndex: 1
    },
    {
      id: "l7-q8",
      question: "What happens to a 60/40 portfolio during a prolonged bull market (stocks going up)?",
      options: ["It stays exactly 60/40", "It drifts, becoming heavier in stocks (e.g., 70/30), thereby increasing portfolio risk", "It drifts, becoming heavier in bonds", "The bonds expire"],
      answerIndex: 1
    },
    {
      id: "l7-q9",
      question: "What does 'Rebalancing' involve?",
      options: ["Closing your account and moving to a new broker", "Selling underperforming assets and buying more of the overperforming ones", "Selling a portion of your over-weighted assets to buy under-weighted assets, restoring your target allocation", "Borrowing money to buy more stocks"],
      answerIndex: 2
    },
    {
      id: "l7-q10",
      question: "By rebalancing, you are mathematically forcing yourself to do what?",
      options: ["Buy high and sell low", "Buy low and sell high", "Pay maximum taxes", "Lose money"],
      answerIndex: 1
    }
  ]
};
