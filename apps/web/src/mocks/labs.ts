export const lab1 = {
  chapters: [
    {
      title: "Chapter 1: Welcome to the Live Market",
      content: [
        { type: 'text', content: "Welcome to Live Trading Labs! Here, you won't just read about concepts—you will observe them in real-time and practice them in our Virtual Market." },
        { type: 'heading', content: "Observe Before You Act" },
        { type: 'text', content: "Look at the Live Market panel docked next to this lesson. It shows a real, live chart of a major asset. Notice how the price fluctuates every few seconds." },
        { type: 'alert', content: "The market is driven by supply and demand. Every green tick means a buyer was willing to pay a higher price. Every red tick means a seller accepted a lower price." },
        { type: 'text', content: "Take two minutes to just watch the chart. What trend do you see? Is it moving generally up or down?" }
      ],
      mission: {
        type: 'observation',
        title: "Market Observation",
        prompt: "Spend 30 seconds observing the live chart. What is the current overall trend?",
        options: ["Uptrend", "Downtrend", "Sideways / Ranging"],
        answerIndex: 0
      }
    },
    {
      title: "Chapter 2: Identifying Key Zones",
      content: [
        { type: 'text', content: "Prices don't move randomly. They often stop and reverse at certain invisible boundaries. We call these Support and Resistance." },
        { type: 'heading', content: "Support & Resistance" },
        { type: 'text', content: "Support is the 'floor'—a price level where buyers step in, preventing the price from falling further. Resistance is the 'ceiling'—a price level where sellers take control, preventing it from rising." },
        { type: 'text', content: "Use the 'Explain This Chart' button on the Live Market panel to see if the AI can identify any current support or resistance zones on today's chart." }
      ],
      mission: {
        type: 'action',
        title: "Find a Mover",
        prompt: "Your mission: Switch to the Virtual Market and find a stock that is currently UP more than 2% today.",
        validation: "find_gainer"
      }
    }
  ],
  finalQuiz: [
    {
      id: "lab1-q1",
      question: "What does a green tick on a live market chart represent?",
      options: ["A seller sold at a lower price", "A buyer bought at a higher price", "The market closed", "A dividend was paid"],
      answerIndex: 1
    }
  ]
};

export const lab2 = {
  chapters: [
    {
      title: "Chapter 1: The Anatomy of a Candle",
      content: [
        { type: 'text', content: "Traders use Japanese Candlestick charts because they pack a lot of information into a single visual." },
        { type: 'text', content: "Each candle shows the Open, High, Low, and Close (OHLC) for a specific time period. A green candle means it closed higher than it opened. A red candle means it closed lower." },
        { type: 'heading', content: "Wicks and Bodies" },
        { type: 'text', content: "The thick part is the 'body' (the difference between Open and Close). The thin lines are 'wicks' or 'shadows', showing the highest and lowest prices reached during that time." }
      ],
      mission: {
        type: 'observation',
        title: "Candle Spotting",
        prompt: "Look at the live chart. Find a candle with a very long lower wick. What does this indicate?",
        options: ["Strong selling pressure", "Buyers rejecting lower prices", "Market indecision", "Low volatility"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 2: Practice Your Setup",
      content: [
        { type: 'text', content: "Now it's time to put your knowledge to the test. Before you enter any trade, you must define your risk." },
        { type: 'alert', content: "Never enter a trade without knowing exactly where you will exit if you are wrong. This is called a Stop Loss." }
      ],
      mission: {
        type: 'trade_setup',
        title: "Execute a Practice Trade",
        prompt: "Click 'Practice This Concept' to open the Virtual Market. Place a virtual BUY order for 10 shares of Apple (AAPL) and set a stop loss 2% below your entry price.",
        validation: "trade_with_stoploss"
      }
    }
  ],
  finalQuiz: [
    {
      id: "lab2-q1",
      question: "What does a long lower wick on a candlestick suggest?",
      options: ["Strong selling pressure", "Buyers stepped in to push the price back up", "The market is about to crash", "Low trading volume"],
      answerIndex: 1
    }
  ]
};
