import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Faq3Props {
  heading: string;
  description: string;
  items?: FaqItem[];
}

const faqItems = [
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
  }
];

const Faq3 = ({
  heading = "Frequently asked questions",
  description = "Find answers to common questions about our products. Can't find what you're looking for? Contact our support team.",
  items = faqItems,
}: Faq3Props) => {
  return (
    <div className="w-full">
      <div className="mx-auto flex flex-col text-center mb-12">
        <h2 className="mb-4 text-4xl font-bold lg:text-6xl" style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
          {heading}
        </h2>
        <p className="text-lg opacity-80" style={{ maxWidth: '600px', margin: '0 auto' }}>{description}</p>
      </div>
      <Accordion
        type="single"
        collapsible
        className="w-full"
      >
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-70 text-left">
              <div className="font-semibold py-4 text-xl lg:text-2xl">
                {item.question}
              </div>
            </AccordionTrigger>
            <AccordionContent className="mb-4">
              <div className="text-base lg:text-lg leading-relaxed text-left opacity-80">
                {item.answer}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export { Faq3 };
