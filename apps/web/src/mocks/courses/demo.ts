export const demoCourse = {
  chapters: [
    {
      title: "Welcome to FinWise AI",
      content: [
        { type: 'text', content: "Welcome to the FinWise AI interactive demo. This short lesson is designed to show you how our education platform works." },
        { type: 'heading', content: "Interactive Learning" },
        { type: 'text', content: "Every lesson is broken down into easily digestible chapters. At the end of each chapter, a mini-quiz helps reinforce what you just read." },
        { type: 'alert', content: "The AI Mentor is always watching. If you get stuck or select a wrong answer, it's ready to jump in and guide you!" }
      ],
      miniQuiz: {
        question: "What is the primary purpose of this demo course?",
        options: ["To teach advanced options trading", "To demonstrate the FinWise learning platform", "To sell a subscription", "To test the user's math skills"],
        answerIndex: 1
      }
    },
    {
      title: "The Power of AI Mentorship",
      content: [
        { type: 'text', content: "FinWise AI doesn't just give you articles to read; it provides a conversational learning experience." },
        { type: 'text', content: "As you progress through your wealth-building journey, the AI tracks your understanding and adapts its advice." }
      ],
      miniQuiz: {
        question: "How does the AI Mentor assist you?",
        options: ["It ignores your progress", "It only talks when you ask about the weather", "It tracks your understanding and provides conversational guidance", "It makes trades for you automatically"],
        answerIndex: 2
      }
    }
  ],
  finalQuiz: [
    {
      id: "demo-q1",
      question: "Which of the following best describes FinWise AI's educational approach?",
      options: ["Reading long, boring textbooks", "Interactive, AI-guided learning chapters", "Watching 5-hour lectures", "Guessing random answers"],
      answerIndex: 1
    },
    {
      id: "demo-q2",
      question: "Are you ready to explore the rest of FinWise AI?",
      options: ["No, I'm scared of AI", "Yes, let's go!"],
      answerIndex: 1
    }
  ]
};
