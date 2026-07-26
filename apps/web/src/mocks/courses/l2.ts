export const course2 = {
  chapters: [
    {
      title: "Chapter 1: The Caveman Brain",
      content: [
        { type: 'text', content: "When it comes to managing money, your brain is often your worst enemy. It is wired for immediate survival, not long-term wealth accumulation." },
        { type: 'text', content: "Our ancestors had to eat today to survive; they couldn't save food for 30 years. Evolution prioritized immediate rewards over delayed ones." },
        { type: 'alert', content: "The 'Delay Discounting' trap occurs when you value a smaller, immediate reward over a larger, delayed reward. It's why we buy coffee today instead of saving for retirement in 30 years." },
        { type: 'text', content: "Your brain literally 'discounts' the value of the future reward because it feels abstract and far away, while the immediate reward is tangible." }
      ],
      miniQuiz: {
        question: "What does 'Delay Discounting' refer to?",
        options: ["Waiting for items to go on discount", "Valuing immediate small rewards over larger delayed rewards", "Refusing to spend any money", "Paying off debt slowly"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 2: The Future Self Gap",
      content: [
        { type: 'text', content: "Studies using fMRI brain scans show that when people are asked to think about their 'future self', the parts of the brain that light up are the same parts that light up when thinking about a complete stranger." },
        { type: 'text', content: "This means when you put money into a retirement account, your brain physically feels like you are giving your money away to a stranger." },
        { type: 'heading', content: "Bridging the Gap" },
        { type: 'text', content: "To combat this, you have to find ways to make your future self feel 'real'. Visualizing your retirement, or using apps that age your face, have been shown to increase savings rates." }
      ],
      miniQuiz: {
        question: "How does the brain often perceive your 'future self'?",
        options: ["As your best friend", "As a complete stranger", "As an enemy", "As a wealthier version of you"],
        answerIndex: 1
      }
    },
    {
      title: "Chapter 3: Rules to Hack Your Psychology",
      content: [
        { type: 'text', content: "Since you can't rewire thousands of years of evolution, you have to build systems that bypass it." },
        { type: 'heading', content: "Automate Everything" },
        { type: 'text', content: "If you don't see the money, you won't spend it. Set up automatic transfers to your savings or investment accounts the exact day your paycheck hits. This removes the decision-making process entirely." },
        { type: 'heading', content: "The 48-Hour Rule" },
        { type: 'text', content: "For any non-essential purchase over $50, force yourself to wait 48 hours before buying. This kills the dopamine rush of impulse buying and forces your logical prefrontal cortex to evaluate the purchase." }
      ],
      miniQuiz: {
        question: "Why is automating investments an effective strategy?",
        options: ["It removes the temptation to spend by eliminating the manual decision", "It increases your dopamine", "It earns higher interest", "It makes you wealthy overnight"],
        answerIndex: 0
      }
    }
  ],
  finalQuiz: [
    {
      id: "l2-q1",
      question: "Which of the following best defines 'Delay Discounting'?",
      options: ["Buying items on sale", "Valuing a $10 reward today more than a $20 reward in a year", "Delaying payment on credit cards", "Discounting the impact of taxes"],
      answerIndex: 1
    },
    {
      id: "l2-q2",
      question: "Why did evolution wire our brains to prefer immediate rewards?",
      options: ["Because ancient markets required fast trading", "Because survival depended on immediate calories, not long-term planning", "Because our brains are inherently lazy", "It didn't; modern society caused this"],
      answerIndex: 1
    },
    {
      id: "l2-q3",
      question: "What happens in the brain when we think about our 'future self'?",
      options: ["It activates areas associated with deep self-reflection", "It activates the same areas as when we think about a stranger", "It releases large amounts of dopamine", "It causes anxiety and stress"],
      answerIndex: 1
    },
    {
      id: "l2-q4",
      question: "How does the 'Future Self Gap' affect saving behavior?",
      options: ["It makes us want to save too much", "It makes saving feel like giving money to someone else", "It has no impact on saving", "It makes us better investors"],
      answerIndex: 1
    },
    {
      id: "l2-q5",
      question: "What is a proven method to bridge the Future Self Gap?",
      options: ["Ignoring the future entirely", "Visualizing your retirement or using age-progression apps", "Spending all your money today", "Relying on the government"],
      answerIndex: 1
    },
    {
      id: "l2-q6",
      question: "What is the primary benefit of automating your savings?",
      options: ["You earn a higher interest rate", "You remove the emotional decision-making process", "Your bank gives you a bonus", "It legally reduces your tax burden"],
      answerIndex: 1
    },
    {
      id: "l2-q7",
      question: "What is the '48-Hour Rule'?",
      options: ["Waiting 48 hours to pay a bill", "Working 48 hours a week", "Waiting 48 hours before making a non-essential purchase", "Investing 48% of your income"],
      answerIndex: 2
    },
    {
      id: "l2-q8",
      question: "How does the 48-Hour Rule help prevent impulse buys?",
      options: ["It allows the initial dopamine spike to fade so logic can take over", "It gives the store time to lower the price", "It ensures the item goes out of stock", "It builds your credit score"],
      answerIndex: 0
    },
    {
      id: "l2-q9",
      question: "Why do we say our brain 'discounts' the future?",
      options: ["Because the future is guaranteed", "Because future rewards feel abstract and less valuable than tangible present rewards", "Because future money is worth more due to inflation", "Because we get a discount on future taxes"],
      answerIndex: 1
    },
    {
      id: "l2-q10",
      question: "Which part of the brain is forced to engage when you delay a purchase?",
      options: ["The amygdala (fear center)", "The prefrontal cortex (logical planning)", "The brain stem (basic survival)", "The hippocampus (memory)"],
      answerIndex: 1
    }
  ]
};
