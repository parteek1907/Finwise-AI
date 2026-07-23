import React from "react";
import { Header } from "@/components/ui/header-2";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-[#DDD7C9]">
      <Header />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-8 text-[#303A3C]">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans !normal-case mb-4" style={{ fontSize: '2.5rem' }}>Privacy Policy</h1>
            <p className="text-sm opacity-60 uppercase tracking-widest font-semibold">Last Updated: July 23, 2026</p>
          </div>
          
          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>1. Introduction</h2>
            <p className="leading-relaxed opacity-90">
              Welcome to FinWise AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>2. The Data We Collect About You</h2>
            <p className="leading-relaxed opacity-90">
              Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 opacity-90">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely by our third-party payment processors).</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products, simulator, and services.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>3. How We Use Your Personal Data</h2>
            <p className="leading-relaxed opacity-90">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 opacity-90">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
              <li>To provide contextual feedback and tailored educational scenarios via our AI Mentor.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>4. Data Security</h2>
            <p className="leading-relaxed opacity-90">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>5. Your Legal Rights</h2>
            <p className="leading-relaxed opacity-90">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
            <p className="leading-relaxed opacity-90">
              If you wish to exercise any of the rights set out above, please contact us at privacy@finwise.ai.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
