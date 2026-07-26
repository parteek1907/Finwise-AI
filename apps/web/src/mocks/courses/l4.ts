export const course4 = {
  chapters: [
    {
      title: "Chapter 1: The Magic of Index Funds",
      content: [
        { type: 'text', content: "Investing doesn't have to mean sitting in front of six monitors analyzing stock charts all day. In fact, the best investors in the world do almost nothing." },
        { type: 'text', content: "An index fund is a mutual fund or exchange-traded fund (ETF) designed to follow certain preset rules so that it can track a specified basket of underlying investments, like the S&P 500." },
        { type: 'alert', content: "Historically, broad market index funds have outperformed the vast majority of actively managed mutual funds over a 10-year period, largely due to their extremely low fees." },
        { type: 'text', content: "Instead of paying a Wall Street manager 2% of your portfolio every year to guess which stocks will win (and they usually guess wrong), you pay an algorithm 0.03% to simply buy a piece of every major company." }
      ],
      miniQuiz: {
        question: "Why do Index Funds generally outperform Active Managers over long periods?",
        options: ["Index funds have significantly lower fees and don't try to guess the market", "Index funds only buy high-risk tech stocks", "Index funds are guaranteed by the US government", "Active managers are not allowed to buy good stocks"],
        answerIndex: 0
      }
    },
    {
      title: "Chapter 2: Diversification at a Discount",
      content: [
        { type: 'heading', content: "Don't Put All Your Eggs in One Basket" },
        { type: 'text', content: "If you buy $1,000 of Apple stock, your entire wealth is tied to the success of one company. If Apple has a bad year, you have a bad year." },
        { type: 'text', content: "By purchasing a single share of an S&P 500 index fund, you are instantly buying tiny fractions of 500 of the largest, most successful companies in the US simultaneously." },
        { type: 'alert', content: "If one company in the S&P 500 goes bankrupt, it is simply removed from the index and replaced by the next largest company. Your portfolio barely feels a ripple. This is the ultimate power of diversification." }
      ],
      miniQuiz: {
        question: "What happens if a single company goes bankrupt when you own an S&P 500 index fund?",
        options: ["You lose all your money", "The fund goes bankrupt", "The company drops out of the index and is replaced, causing minimal impact to you", "You owe the government money"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 3: The Snowball Effect of Compound Interest",
      content: [
        { type: 'text', content: "The real magic of index funds happens over decades, not days. This is due to compound interest." },
        { type: 'text', content: "Compound interest is when the interest you earn on your investments starts earning interest of its own. It's a snowball rolling down a hill, gathering more and more snow." },
        { type: 'heading', content: "Time in the market > Timing the market" },
        { type: 'text', content: "If you invest $500 a month into an S&P 500 index fund from age 25 to 65, assuming historical average returns of around 8-10%, you will retire a multi-millionaire." },
        { type: 'text', content: "You don't need to pick the next Apple or Amazon. You just need to buy the whole market and wait." }
      ],
      miniQuiz: {
        question: "What is compound interest?",
        options: ["The interest you pay on a credit card", "When your earned interest starts earning its own interest", "A flat fee charged by index funds", "The rate of inflation"],
        answerIndex: 1
      }
    }
  ],
  finalQuiz: [
    {
      id: "l4-q1",
      question: "What is an Index Fund?",
      options: ["A fund managed by a Wall Street stock picker", "A fund that automatically tracks a specific basket of stocks, like the S&P 500", "A type of government bond", "A cryptocurrency"],
      answerIndex: 1
    },
    {
      id: "l4-q2",
      question: "Why do Index Funds typically have lower fees than actively managed funds?",
      options: ["They perform worse", "They use algorithms to track an index rather than paying highly-salaried managers to pick stocks", "They are subsidized by the government", "They charge hidden fees instead"],
      answerIndex: 1
    },
    {
      id: "l4-q3",
      question: "Over a 10-year period, how do Index Funds generally compare to actively managed funds?",
      options: ["They drastically underperform", "They perform exactly the same", "They outperform the vast majority of active funds", "They lose all their money"],
      answerIndex: 2
    },
    {
      id: "l4-q4",
      question: "What is the S&P 500?",
      options: ["A list of the 500 poorest companies", "An index tracking 500 of the largest publicly traded companies in the US", "A new tech startup", "A type of savings account"],
      answerIndex: 1
    },
    {
      id: "l4-q5",
      question: "What is the primary benefit of owning a broad market Index Fund?",
      options: ["Instant diversification across hundreds of companies", "Guaranteed 20% returns every year", "Zero taxes", "The ability to day-trade easily"],
      answerIndex: 0
    },
    {
      id: "l4-q6",
      question: "If a company in the S&P 500 fails, what happens to the index?",
      options: ["The index collapses", "The index fund is dissolved", "The failing company is removed and replaced by another large company", "All investors must pay a fine"],
      answerIndex: 2
    },
    {
      id: "l4-q7",
      question: "Which of the following describes 'Compound Interest'?",
      options: ["Interest calculated solely on the principal", "Interest earned on both the principal and the accumulated interest", "A penalty for early withdrawal", "The fee paid to an active manager"],
      answerIndex: 1
    },
    {
      id: "l4-q8",
      question: "What is the most important factor in harnessing compound interest?",
      options: ["Picking the right individual stock", "Time (starting as early as possible)", "Checking your portfolio daily", "Watching the financial news"],
      answerIndex: 1
    },
    {
      id: "l4-q9",
      question: "Which strategy is recommended for building long-term wealth with Index Funds?",
      options: ["Time in the market (buying and holding)", "Timing the market (buying low and selling high rapidly)", "Trading based on emotions", "Investing only during bull markets"],
      answerIndex: 0
    },
    {
      id: "l4-q10",
      question: "How can an average earner become a millionaire for retirement?",
      options: ["Winning the lottery", "Inheriting money", "Consistently investing a portion of their income into index funds over decades", "Starting a tech company"],
      answerIndex: 2
    }
  ]
};
