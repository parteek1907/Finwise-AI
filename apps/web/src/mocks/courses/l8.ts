export const course8 = {
  chapters: [
    {
      title: "Chapter 1: The Taxman Cometh",
      content: [
        { type: 'text', content: "Taxes are often the single largest expense in a person's life. Earning a high salary is only part of the equation; keeping that money out of the hands of the IRS is the other half." },
        { type: 'text', content: "When you invest in a regular, taxable brokerage account, you are taxed multiple times: you are taxed on the income you used to fund the account, you are taxed on the dividends the account pays out every year, and you are taxed on the capital gains when you finally sell the stock." },
        { type: 'alert', content: "This 'tax drag' can cost you hundreds of thousands of dollars over a lifetime of investing." }
      ],
      miniQuiz: {
        question: "What is 'tax drag'?",
        options: ["The slow process of filing taxes", "The reduction of potential investment returns due to taxes paid on dividends and capital gains", "A specific tax levied on rich investors", "A government penalty for not investing"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 2: The Tax Shelter",
      content: [
        { type: 'text', content: "To incentivize citizens to save for retirement, governments created 'Tax-Advantaged Accounts' like the 401(k) and the IRA." },
        { type: 'text', content: "A massive misconception is that a 401(k) is an investment itself. It is not. A 401(k) is simply a 'basket' or a 'tax shelter'. You put money into the basket, and the basket protects the money from taxes. Once the money is inside the basket, you must then choose what to buy with it (like an S&P 500 index fund)." }
      ],
      miniQuiz: {
        question: "Which of the following best describes an IRA or a 401(k)?",
        options: ["A specific stock you buy", "A government bond", "A 'basket' or account structure that shelters your investments from taxes", "A high-interest loan"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 3: Traditional Accounts",
      content: [
        { type: 'heading', content: "Tax-Deferred Growth" },
        { type: 'text', content: "A 'Traditional' account (like a Traditional 401k or Traditional IRA) gives you a tax break today. If you make $100,000 and put $10,000 into a Traditional 401(k), the IRS only taxes you as if you made $90,000." },
        { type: 'text', content: "The money grows tax-free for decades. However, when you retire and withdraw the money, every dollar you take out is taxed as ordinary income." }
      ],
      miniQuiz: {
        question: "When do you pay taxes on money invested in a Traditional 401(k)?",
        options: ["Before you contribute it", "Every single year as it grows", "When you withdraw the money in retirement", "You never pay taxes on it"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 4: Roth Accounts",
      content: [
        { type: 'heading', content: "Tax-Free Growth" },
        { type: 'text', content: "A 'Roth' account (like a Roth IRA) is the exact opposite. You get no tax break today. You fund the account with after-tax money." },
        { type: 'alert', content: "However, all the growth inside the account, and all the withdrawals you make in retirement, are 100% tax-free. If you put in $10,000 and it grows to $100,000, you never pay a single dime of taxes on that $90,000 of profit." }
      ],
      miniQuiz: {
        question: "What is the primary benefit of a Roth IRA?",
        options: ["You get a massive tax deduction today", "Your employer matches 200% of it", "All growth and withdrawals in retirement are 100% tax-free", "It guarantees against market crashes"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 5: Traditional vs. Roth",
      content: [
        { type: 'text', content: "Which is better? It depends entirely on your current tax bracket versus your expected tax bracket in retirement." },
        { type: 'text', content: "If you are a 22-year-old making $40,000 a year, your current tax rate is very low. You should use a Roth account, pay the low tax today, and enjoy tax-free withdrawals when you are a millionaire." },
        { type: 'text', content: "If you are a 45-year-old CEO making $500,000 a year, your current tax rate is massive. You should use a Traditional account to get the tax break today, because your income (and tax bracket) will likely drop when you retire." }
      ],
      miniQuiz: {
        question: "Who generally benefits the most from utilizing a Roth account?",
        options: ["A high-earner in the peak of their career (high tax bracket)", "A young earner currently in a low tax bracket", "Someone who plans to withdraw the money next year", "Foreign investors"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 6: The Employer Match",
      content: [
        { type: 'text', content: "Many employers offer a 401(k) match. For example, they might match 100% of your contributions up to 5% of your salary." },
        { type: 'alert', content: "This is literal free money. It is an immediate 100% return on your investment. If you make $100,000 and contribute $5,000, your employer just hands you another $5,000." },
        { type: 'text', content: "You should always, under every circumstance, contribute at least enough to your 401(k) to get the full employer match before investing anywhere else." }
      ],
      miniQuiz: {
        question: "Why should you always secure the full employer match in your 401(k)?",
        options: ["It is required by federal law", "It is free money that provides an immediate, guaranteed return on your investment", "It lowers your credit score", "It prevents you from being fired"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 7: The HSA (Health Savings Account)",
      content: [
        { type: 'text', content: "The HSA is the ultimate tax shelter. It is the only account in the US tax code that is 'Triple Tax-Advantaged'." },
        { type: 'text', content: "1. Contributions are tax-deductible (like a Traditional IRA). \n2. The money grows tax-free. \n3. Withdrawals are completely tax-free if used for qualified medical expenses." },
        { type: 'text', content: "Savvy investors pay for their current medical expenses out of pocket, let their HSA money grow invested in the stock market for decades, and then withdraw it tax-free in retirement when medical expenses naturally rise." }
      ],
      miniQuiz: {
        question: "Why is the HSA often called a 'Triple Tax-Advantaged' account?",
        options: ["Because you can open three of them", "Because contributions are deductible, growth is tax-free, and qualified withdrawals are tax-free", "Because it is taxed at a flat 3%", "Because it avoids state, local, and federal sales taxes"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 8: The Order of Operations",
      content: [
        { type: 'heading', content: "How to fund your accounts" },
        { type: 'text', content: "If you have extra money to invest, follow this general flowchart to minimize taxes and maximize growth:\n\n1. 401(k) up to the Employer Match (Free money)\n2. Max out HSA (Triple tax-advantaged)\n3. Max out Roth IRA (Tax-free growth)\n4. Go back and max out the rest of the 401(k)\n5. Finally, put any leftover money into a taxable brokerage account." }
      ],
      miniQuiz: {
        question: "According to the financial order of operations, what is the very first thing you should do with your investment dollars?",
        options: ["Max out a taxable brokerage", "Contribute to a 401(k) up to the employer match", "Buy crypto", "Max out a Roth IRA"],
        answerIndex: 1
      }
    }
  ],
  finalQuiz: [
    {
      id: "l8-q1",
      question: "What is 'tax drag'?",
      options: ["Taking a long time to file taxes", "The loss of compounding growth due to paying taxes on dividends and capital gains every year", "A specific IRS penalty", "A type of tax software"],
      answerIndex: 1
    },
    {
      id: "l8-q2",
      question: "True or False: A 401(k) is an investment just like a stock or a bond.",
      options: ["True, it is a specific stock you buy", "False, it is merely a tax-advantaged 'basket' that holds investments you choose", "True, the government guarantees its return", "False, it is a bank account"],
      answerIndex: 1
    },
    {
      id: "l8-q3",
      question: "When are you taxed on a Traditional IRA?",
      options: ["When you contribute the money", "Every year on the growth", "Only when you withdraw the money in retirement", "You are never taxed on it"],
      answerIndex: 2
    },
    {
      id: "l8-q4",
      question: "What is the primary advantage of a Roth IRA?",
      options: ["You receive a tax deduction in the year you contribute", "All growth and qualified withdrawals in retirement are completely tax-free", "Your employer is legally required to match it", "It is immune to stock market crashes"],
      answerIndex: 1
    },
    {
      id: "l8-q5",
      question: "If you are a 22-year-old earning $35,000 a year, which account structure generally makes the most sense for you?",
      options: ["Traditional, because you need the tax deduction now", "Roth, because you are in a low tax bracket now and the tax-free growth will be massively valuable", "A standard taxable brokerage", "A savings account"],
      answerIndex: 1
    },
    {
      id: "l8-q6",
      question: "Why do financial experts call an employer 401(k) match 'free money'?",
      options: ["Because you don't have to work for it", "Because it is an immediate, guaranteed return on your contributed money", "Because it isn't taxed ever", "Because you can withdraw it tomorrow with no penalty"],
      answerIndex: 1
    },
    {
      id: "l8-q7",
      question: "What does 'Triple Tax-Advantaged' mean in the context of an HSA?",
      options: ["You avoid federal, state, and local taxes", "Contributions are deductible, growth is tax-free, and qualified medical withdrawals are tax-free", "You pay taxes three times", "You get three times the employer match"],
      answerIndex: 1
    },
    {
      id: "l8-q8",
      question: "What happens if you use HSA funds for non-medical expenses before age 65?",
      options: ["Nothing, it's your money", "You pay standard income taxes plus a severe 20% penalty", "You lose the account", "The government takes 100% of it"],
      answerIndex: 1
    },
    {
      id: "l8-q9",
      question: "According to standard financial order of operations, what should you fund immediately AFTER getting your employer match?",
      options: ["A taxable brokerage account", "High-yield savings account for a vacation", "An HSA or Roth IRA, depending on eligibility", "Whole life insurance"],
      answerIndex: 2
    },
    {
      id: "l8-q10",
      question: "Why should a taxable brokerage account generally be the last account you fund?",
      options: ["Because it has the highest fees", "Because it offers no tax shelter, subjecting you to yearly tax drag", "Because it is illegal to fund it first", "Because it only allows you to buy risky stocks"],
      answerIndex: 1
    }
  ]
};
