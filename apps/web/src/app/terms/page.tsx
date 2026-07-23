import React from "react";
import { Header } from "@/components/ui/header-2";
import { Footer } from "@/components/landing/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-[#DDD7C9]">
      <Header />
      <main className="flex-grow px-6 md:px-12" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
        <div className="mx-auto text-[#303A3C] flex flex-col gap-12" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans !normal-case mb-4" style={{ fontSize: '2.5rem' }}>Terms of Service</h1>
            <p className="text-sm opacity-60 uppercase tracking-widest font-semibold">Last Updated: July 23, 2026</p>
          </div>
          
          <section className="flex flex-col gap-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>1. Acceptance of Terms</h2>
            <p className="leading-relaxed opacity-90">
              By accessing and using FinWise AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>2. Educational Purposes Only</h2>
            <p className="leading-relaxed opacity-90">
              The information provided by FinWise AI, including through our AI Mentor and simulations, is for educational and informational purposes only. It does not constitute financial, investment, legal, or tax advice. We do not manage your money. You are solely responsible for evaluating the merits and risks associated with the use of any information provided by the Service before making any decisions based on such information.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>3. User Accounts</h2>
            <p className="leading-relaxed opacity-90">
              To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>4. Subscriptions and Payments</h2>
            <p className="leading-relaxed opacity-90">
              Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select. At the end of each period, your subscription will automatically renew under the exact same conditions unless you cancel it or we cancel it.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>5. Intellectual Property</h2>
            <p className="leading-relaxed opacity-90">
              The Service and its original content, features, and functionality are and will remain the exclusive property of FinWise AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
