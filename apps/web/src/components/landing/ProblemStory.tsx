"use client";

import { motion } from "framer-motion";

export function ProblemStory() {
  return (
    <section className="py-32 md:py-48 bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-16 md:space-y-32"
        >
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-heading font-medium text-foreground leading-tight">
              Most finance platforms<br />show you the market.
            </h2>
            <p className="mt-6 text-xl text-secondary font-sans max-w-xl">
              Charts, numbers, portfolios, red and green tickers. They optimize for transactions, not transformation.
            </p>
          </div>

          <div className="text-center md:text-right flex flex-col md:items-end">
            <h2 className="text-3xl md:text-5xl font-heading font-medium text-foreground leading-tight">
              We show you<br />yourself.
            </h2>
            <p className="mt-6 text-xl text-secondary font-sans max-w-xl">
              Your mindset, your habits, your emotional reactions. Because the best investment you can make is understanding how you think.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
