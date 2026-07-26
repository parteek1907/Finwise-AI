export const course9 = {
  chapters: [
    {
      title: "Chapter 1: The Contract",
      content: [
        { type: 'text', content: "Options are financial derivatives. That means their value is 'derived' from another underlying asset, like a stock (e.g., Apple or Tesla)." },
        { type: 'text', content: "When you buy an option, you are not buying the stock itself. You are buying a contract. This contract gives you the right, but NOT the obligation, to buy or sell the underlying stock at a specifically agreed-upon price on or before a specific date." },
        { type: 'alert', content: "Options trading involves massive leverage and significant risk. Unlike buying an index fund, if an option expires out of the money, you lose 100% of your initial investment." }
      ],
      miniQuiz: {
        question: "Does buying an option contract obligate you to buy or sell the stock?",
        options: ["Yes, always", "No, it gives you the right, but not the obligation", "Only if the stock goes up", "Only if the stock pays dividends"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 2: The Call Option",
      content: [
        { type: 'text', content: "There are two main flavors of options: Calls and Puts." },
        { type: 'heading', content: "The Call Option (Bullish)" },
        { type: 'text', content: "A Call option gives you the right to BUY an asset at the strike price. You buy a call when you are bullish—meaning you think the price of the stock is going to go up." },
        { type: 'text', content: "For example, if you buy a $100 Call on Apple, and Apple stock skyrockets to $150, you have the right to force the seller to give you the shares for only $100. You instantly make a huge profit." }
      ],
      miniQuiz: {
        question: "When would you typically buy a Call option?",
        options: ["When you think the stock price is going to crash", "When you think the stock price is going to rise significantly", "When you want to earn a dividend", "When you want a safe, guaranteed return"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 3: The Put Option",
      content: [
        { type: 'heading', content: "The Put Option (Bearish)" },
        { type: 'text', content: "A Put option gives you the right to SELL an asset at the strike price. You buy a put when you are bearish—meaning you think the price of the stock is going to go down." },
        { type: 'text', content: "For example, if you buy a $100 Put on Apple, and Apple stock crashes to $50, you have the right to force the seller to buy the shares from you at $100. This is often used as 'insurance' to protect a portfolio during a market crash." }
      ],
      miniQuiz: {
        question: "When would you typically buy a Put option?",
        options: ["When you believe the stock is going to crash", "When you believe the stock is going to go to the moon", "When you want to hold the stock forever", "When interest rates are high"],
        answerIndex: 0
      }
    },
    {
      title: "Chapter 4: The Strike Price and Expiration",
      content: [
        { type: 'text', content: "Every option contract has two key parameters:" },
        { type: 'text', content: "1. The Strike Price: The agreed-upon price at which the transaction will occur if you exercise the option." },
        { type: 'text', content: "2. The Expiration Date: The deadline. Options are a decaying asset. If the stock doesn't move past your strike price before the expiration date, the contract becomes completely worthless (expires worthless) and you lose the premium you paid for it." }
      ],
      miniQuiz: {
        question: "What happens to an option contract if the expiration date passes and it is out of the money?",
        options: ["It automatically rolls over to the next month", "It converts into standard shares", "It expires worthless and you lose the money you paid for it", "You owe the broker more money"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 5: The Premium",
      content: [
        { type: 'text', content: "Options aren't free. To buy the right to a contract, you have to pay the seller a fee. This is called the 'Premium'." },
        { type: 'alert', content: "One standard option contract usually represents 100 shares of the underlying stock. If the premium is listed at $2.00, it actually costs you $200 to buy the contract ($2.00 x 100 shares)." },
        { type: 'text', content: "The premium is determined by the stock's volatility, how close the strike price is to the current price, and how much time is left until expiration." }
      ],
      miniQuiz: {
        question: "If an option premium is quoted at $3.00, how much does one standard contract cost to buy?",
        options: ["$3.00", "$30.00", "$300.00", "$3,000.00"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 6: Theta (Time Decay)",
      content: [
        { type: 'text', content: "Options pricing is complex and governed by 'The Greeks'—variables like Delta, Gamma, Theta, and Vega." },
        { type: 'text', content: "The most ruthless Greek for an option buyer is Theta, which represents Time Decay." },
        { type: 'text', content: "Every single day that passes, your option contract loses value simply because there is less time for the stock to make the move you want. As you get closer to the expiration date, this time decay accelerates drastically." }
      ],
      miniQuiz: {
        question: "Which 'Greek' represents the daily decay in the value of an option contract due to the passage of time?",
        options: ["Delta", "Gamma", "Theta", "Vega"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 7: Selling Options",
      content: [
        { type: 'text', content: "For every buyer of an option, there is a seller (the writer)." },
        { type: 'text', content: "When you sell an option, you collect the premium upfront. If the option expires worthless (which most do), you keep the premium as pure profit." },
        { type: 'alert', content: "However, selling options (especially 'naked' options) exposes you to technically infinite risk. If you sell a Call on a stock, and that stock goes up 1000%, you are legally obligated to provide those shares at a massive loss." }
      ],
      miniQuiz: {
        question: "What is the primary risk of selling 'naked' Call options?",
        options: ["You might collect too much premium", "The risk is technically infinite if the stock price skyrockets", "You are guaranteed to lose 10% a year", "There is no risk"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 8: Hedging vs. Speculation",
      content: [
        { type: 'text', content: "Because of the high leverage, many retail traders use options to gamble (speculate) on earnings reports, often blowing up their entire accounts." },
        { type: 'text', content: "Institutional investors, however, use options primarily for Hedging. If a mutual fund holds 1 million shares of Apple, they might buy Put options on Apple as an insurance policy. If the market crashes, their Puts skyrocket in value, offsetting the losses in their stock portfolio." }
      ],
      miniQuiz: {
        question: "How do institutional investors typically use options?",
        options: ["To gamble on penny stocks", "As a hedging (insurance) mechanism to protect large portfolios against downside risk", "To avoid paying taxes entirely", "To illegally manipulate the market"],
        answerIndex: 1
      }
    }
  ],
  finalQuiz: [
    {
      id: "l9-q1",
      question: "What does it mean that an option is a 'derivative'?",
      options: ["It derives its value from an underlying asset, like a stock", "It is derived from government bonds", "It is a mathematical formula used to predict the future", "It means it pays a derived dividend"],
      answerIndex: 0
    },
    {
      id: "l9-q2",
      question: "If you are highly confident a stock is going to increase in value rapidly, which option would you typically buy?",
      options: ["A Put", "A Call", "A Covered Call", "A Short Put"],
      answerIndex: 1
    },
    {
      id: "l9-q3",
      question: "If you own a large stock portfolio and want to buy 'insurance' against a market crash, what should you buy?",
      options: ["Call options", "Put options", "Penny stocks", "Margin debt"],
      answerIndex: 1
    },
    {
      id: "l9-q4",
      question: "What is the 'Strike Price'?",
      options: ["The price the stock is currently trading at on the open market", "The price you pay the broker for the transaction", "The agreed-upon price at which the option can be exercised", "The highest price the stock reached in 52 weeks"],
      answerIndex: 2
    },
    {
      id: "l9-q5",
      question: "What is the 'Premium' in options trading?",
      options: ["The high-quality tier of brokerage accounts", "The upfront fee the buyer pays the seller for the rights of the contract", "The dividend paid out to option holders", "The tax levied on the trade"],
      answerIndex: 1
    },
    {
      id: "l9-q6",
      question: "How many shares of the underlying stock does one standard options contract typically represent?",
      options: ["10", "100", "1,000", "It varies randomly"],
      answerIndex: 1
    },
    {
      id: "l9-q7",
      question: "Which of the following describes 'Theta' in options pricing?",
      options: ["The volatility of the stock", "The change in price relative to interest rates", "The daily decay in the contract's value as it approaches expiration", "The probability of the stock going up"],
      answerIndex: 2
    },
    {
      id: "l9-q8",
      question: "Why is buying options considered significantly riskier than buying an index fund?",
      options: ["Because options don't exist", "Because if the option expires out of the money, you lose 100% of your invested premium", "Because index funds are insured by the FDIC", "Because you have to hold options for 10 years minimum"],
      answerIndex: 1
    },
    {
      id: "l9-q9",
      question: "What is the theoretical risk profile for a trader who SELLS a 'naked' Call option?",
      options: ["Fixed maximum loss", "Infinite potential loss if the stock price skyrockets", "Guaranteed profit", "Maximum loss of the premium collected"],
      answerIndex: 1
    },
    {
      id: "l9-q10",
      question: "If an option buyer does not exercise the contract before expiration, what happens?",
      options: ["They are forced to buy the stock anyway", "The contract is automatically extended", "The contract expires worthless and the seller keeps the premium", "The broker exercises it for them"],
      answerIndex: 2
    }
  ]
};
