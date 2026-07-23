import React from "react";
import { Header } from "@/components/ui/header-2";
import { Footer } from "@/components/landing/Footer";

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-[#DDD7C9]">
      <Header />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-8 text-[#303A3C]">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans !normal-case mb-4" style={{ fontSize: '2.5rem' }}>Cookie Policy</h1>
            <p className="text-sm opacity-60 uppercase tracking-widest font-semibold">Last Updated: July 23, 2026</p>
          </div>
          
          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>1. What Are Cookies</h2>
            <p className="leading-relaxed opacity-90">
              As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>2. How We Use Cookies</h2>
            <p className="leading-relaxed opacity-90">
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>3. The Cookies We Set</h2>
            <ul className="list-disc pl-6 space-y-2 opacity-90">
              <li><strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.</li>
              <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
              <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>4. Third Party Cookies</h2>
            <p className="leading-relaxed opacity-90">
              In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
            </p>
            <ul className="list-disc pl-6 space-y-2 opacity-90">
              <li>This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience.</li>
              <li>Third party analytics are used to track and measure usage of this site so that we can continue to produce engaging educational content.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold font-sans !normal-case" style={{ fontSize: '1.5rem' }}>5. More Information</h2>
            <p className="leading-relaxed opacity-90">
              Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
            </p>
            <p className="leading-relaxed opacity-90">
              For more information, please contact us at privacy@finwise.ai.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
