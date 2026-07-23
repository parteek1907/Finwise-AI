import { useState } from 'react';
import { Gauge } from '@/components/ui/gauge'; 
import { Faq3 } from "@/components/ui/faq3";

export function GaugeDemo() {
  const [value, setValue] = useState(48); // Default value

  return (
    <main className="flex flex-col items-center gap-6">
      {/* Gauges */}
      <div className="flex gap-6">
        <Gauge size={100} primary={"success"} value={value} />
        <Gauge size={100} primary={"danger"} value={value} />
        <Gauge size={100} primary={"info"} value={value} />
        <Gauge size={100} primary={"warning"} value={value} />
      </div>

      {/* Slider to Control Gauge Value */}
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-64 h-2 mt-10 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      />
      
      {/* Display Value */}
      <span className="text-lg font-semibold">{value}%</span>
    </main>
  );
}

const demoData = {
  heading: "Frequently asked questions",
  description: "Find answers to common questions about our products. Can't find what you're looking for? Contact our support team.",
  items: [
    {
      id: "faq-1",
      question: "What is a FAQ?",
      answer:
        "A FAQ is a list of frequently asked questions and answers on a particular topic.",
    },
    {
      id: "faq-2",
      question: "What is the purpose of a FAQ?",
      answer:
        "The purpose of a FAQ is to provide answers to common questions and help users find the information they need quickly and easily.",
    },
    {
      id: "faq-3",
      question: "How do I create a FAQ?",
      answer:
        "To create a FAQ, you need to compile a list of common questions and answers on a particular topic and organize them in a clear and easy-to-navigate format.",
    },
    {
      id: "faq-4",
      question: "What are the benefits of a FAQ?",
      answer:
        "The benefits of a FAQ include providing quick and easy access to information, reducing the number of support requests, and improving the overall user experience.",
    },
    {
      id: "faq-5",
      question: "How should I organize my FAQ?",
      answer:
        "You should organize your FAQ in a logical manner, grouping related questions together and ordering them from most basic to more advanced topics.",
    },
    {
      id: "faq-6",
      question: "How long should FAQ answers be?",
      answer:
        "FAQ answers should be concise and to the point, typically a few sentences or a short paragraph is sufficient for most questions.",
    },
    {
      id: "faq-7",
      question: "Should I include links in my FAQ?",
      answer:
        "Yes, including links to more detailed information or related resources can be very helpful for users who want to learn more about a particular topic.",
    },
  ]
};

export function Faq3Demo() {
  return <Faq3 {...demoData} />;
}
