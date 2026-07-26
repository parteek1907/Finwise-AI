export const course6 = {
  chapters: [
    {
      title: "Chapter 1: The Weight of Debt",
      content: [
        { type: 'text', content: "Debt is essentially borrowing from your future self. When you take on debt, you are committing future income to pay for a present expense, usually plus interest." },
        { type: 'text', content: "While some debt can be leveraged to buy appreciating assets (like a mortgage for a home), consumer debt (like credit cards) is toxic. It drains your monthly cash flow and prevents you from investing." },
        { type: 'alert', content: "When you have multiple debts, deciding which one to pay off first can be overwhelming. There are two main strategies mathematically and psychologically designed to get you out of debt: the Snowball method and the Avalanche method." }
      ],
      miniQuiz: {
        question: "What is consumer debt primarily doing to your financial future?",
        options: ["Building your credit score indefinitely", "Draining monthly cash flow and preventing wealth accumulation", "Increasing your net worth", "Providing tax deductions"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 2: The Debt Snowball",
      content: [
        { type: 'heading', content: "Psychology Over Math" },
        { type: 'text', content: "The Debt Snowball method prioritizes psychological momentum over mathematical efficiency." },
        { type: 'text', content: "Here is how it works: You list all your debts from smallest balance to largest balance, entirely ignoring the interest rates. You pay the minimum payment on everything except the smallest debt." },
        { type: 'text', content: "You attack that smallest debt with every extra dollar you have. Once it is paid off, you take the money you were paying on it and 'roll' it into the payment for the next smallest debt." }
      ],
      miniQuiz: {
        question: "In the Debt Snowball method, how do you order your debts?",
        options: ["Highest interest rate to lowest", "Largest balance to smallest balance", "Smallest balance to largest balance", "Oldest debt to newest debt"],
        answerIndex: 2
      }
    },
    {
      title: "Chapter 3: The Power of Momentum",
      content: [
        { type: 'text', content: "Mathematically, the Snowball method doesn't make sense. You might be paying off a 5% car loan before a 24% credit card simply because the car loan has a smaller total balance." },
        { type: 'text', content: "However, personal finance is 80% behavior and 20% head knowledge. By getting quick wins (crossing a debt completely off your list), you get a massive dopamine hit of success." },
        { type: 'alert', content: "This psychological momentum keeps people motivated. Many people who try to mathematically optimize their debt payoff lose steam and quit before they finish." }
      ],
      miniQuiz: {
        question: "Why does the Debt Snowball method work so well for many people despite not being mathematically optimal?",
        options: ["It legally reduces the principal owed", "It provides quick psychological wins that keep you motivated", "It forces banks to lower your interest rate", "It is required by law"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 4: The Debt Avalanche",
      content: [
        { type: 'heading', content: "The Mathematical Approach" },
        { type: 'text', content: "The Debt Avalanche method is the mathematically optimal way to pay off debt. You will pay the absolute least amount of money in interest by using this method." },
        { type: 'text', content: "In this method, you list your debts from highest interest rate to lowest interest rate. You pay minimums on everything, and attack the highest interest rate debt with all your extra cash." },
        { type: 'text', content: "Once the highest interest debt is gone, you move to the next highest." }
      ],
      miniQuiz: {
        question: "What dictates the payoff order in the Debt Avalanche method?",
        options: ["The total balance size", "The interest rate (highest to lowest)", "The name of the bank", "The monthly minimum payment"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 5: Avalanche Pitfalls",
      content: [
        { type: 'text', content: "While Avalanche saves you the most money in interest, it has a major psychological flaw." },
        { type: 'text', content: "If your highest interest debt is a massive $30,000 credit card bill, it might take you two years of aggressive payments to finally clear it. For two years, you don't get the satisfaction of crossing a debt off your list." },
        { type: 'alert', content: "Which method is better? The one you will actually stick to. If you are highly analytical and disciplined, use the Avalanche. If you need quick motivation, use the Snowball." }
      ],
      miniQuiz: {
        question: "What is the primary risk of using the Debt Avalanche method?",
        options: ["You pay more in total interest", "You might lose motivation because it can take a long time to see a debt fully eliminated", "Banks will penalize you", "It ruins your credit score"],
        answerIndex: 1
      }
    }
  ],
  finalQuiz: [
    {
      id: "l6-q1",
      question: "What does consumer debt (like credit cards) do to your financial profile?",
      options: ["Builds long-term wealth", "Drains monthly cash flow and prevents investing", "Creates tax shelters", "Increases your net worth"],
      answerIndex: 1
    },
    {
      id: "l6-q2",
      question: "What is the core philosophy behind the Debt Snowball method?",
      options: ["Mathematical optimization", "Psychological momentum through quick wins", "Negotiating with creditors", "Filing for bankruptcy"],
      answerIndex: 1
    },
    {
      id: "l6-q3",
      question: "How do you order debts in the Snowball method?",
      options: ["Highest interest to lowest interest", "Largest balance to smallest balance", "Smallest balance to largest balance", "Alphabetically"],
      answerIndex: 2
    },
    {
      id: "l6-q4",
      question: "In the Snowball method, what do you do with the money once a debt is paid off?",
      options: ["Spend it on a vacation", "Invest it immediately", "Roll it into the payment for the next smallest debt", "Save it in a checking account"],
      answerIndex: 2
    },
    {
      id: "l6-q5",
      question: "Why might the Snowball method be criticized by mathematicians?",
      options: ["It ignores interest rates, meaning you pay more total interest over time", "It is illegal in some states", "It takes longer than doing nothing", "It requires complex algorithms"],
      answerIndex: 0
    },
    {
      id: "l6-q6",
      question: "What dictates the payoff order in the Debt Avalanche method?",
      options: ["Smallest balance to largest", "Highest interest rate to lowest", "The age of the debt", "The type of debt"],
      answerIndex: 1
    },
    {
      id: "l6-q7",
      question: "What is the primary advantage of the Debt Avalanche method?",
      options: ["It gives you quick psychological wins", "It minimizes the total amount of interest paid", "It automatically improves your credit score by 100 points", "It is easier to understand"],
      answerIndex: 1
    },
    {
      id: "l6-q8",
      question: "What is the major psychological risk of the Debt Avalanche method?",
      options: ["You pay too little interest", "You might lose motivation if your highest-interest debt takes years to pay off", "You get addicted to paying off debt", "Creditors will lower your limits"],
      answerIndex: 1
    },
    {
      id: "l6-q9",
      question: "In both the Snowball and Avalanche methods, what do you do with the debts you aren't currently targeting?",
      options: ["Ignore them entirely", "Pay the minimum required payment", "Refinance them", "Pay half the minimum"],
      answerIndex: 1
    },
    {
      id: "l6-q10",
      question: "Which debt payoff method is ultimately 'the best'?",
      options: ["Always the Avalanche", "Always the Snowball", "The one that aligns with your personal psychology and that you will actually stick to", "Neither, you should just invest instead"],
      answerIndex: 2
    }
  ]
};
