"use client";

import type React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "What is StockWise and who should use it?",
    answer:
      "StockWise is an AI-powered portfolio dashboard designed for investors of all experience levels. Whether you're a beginner learning to invest or a seasoned professional managing complex portfolios, our platform provides intelligent insights, risk analysis, and personalized recommendations to help you make smarter investment decisions.",
  },
  {
    question: "How does StockWise's AI analysis work?",
    answer:
      "Our AI analyzes your portfolio composition, market trends, and risk factors to provide personalized insights. It identifies overexposure to specific sectors or regions, suggests diversification opportunities, and alerts you to potential risks. The AI learns from market patterns and your investment behavior to deliver increasingly relevant recommendations.",
  },
  {
    question: "Can I connect my existing brokerage accounts?",
    answer:
      "Yes! StockWise integrates with major brokerages and financial institutions through secure API connections. You can automatically sync your holdings from multiple accounts to get a unified view of your entire investment portfolio. We support popular platforms like Schwab, Fidelity, TD Ameritrade, and many others.",
  },
  {
    question: "Is my financial data secure with StockWise?",
    answer:
      "Absolutely. We use bank-level security measures including 256-bit SSL encryption, secure data transmission, and compliance with financial industry standards. Your data is never shared with third parties, and we offer read-only access to your accounts, meaning we can view your holdings but cannot execute trades on your behalf.",
  },
  {
    question: "What kind of insights and recommendations do I get?",
    answer:
      "StockWise provides comprehensive portfolio analysis including sector allocation, geographic diversification, risk assessment, and performance benchmarking. You'll receive personalized recommendations for rebalancing, alerts for unusual market movements affecting your holdings, and insights into potential investment opportunities based on your risk profile.",
  },
  {
    question: "Do you offer a free trial or free plan?",
    answer:
      "Yes! Our Starter plan is completely free and includes basic portfolio tracking for up to 10 holdings, monthly AI insights, and risk assessment tools. For more advanced features like real-time tracking, unlimited holdings, and weekly AI reports, you can upgrade to our Professional plan with a 14-day free trial.",
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  };
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">
          {question}
        </div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${
              isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"
            }`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${
            isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"
          }`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Everything you need to know about StockWise and how it can enhance
            your investment strategy
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem
            key={index}
            {...faq}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </section>
  );
}
