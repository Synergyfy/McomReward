"use client"

import { useState } from "react"
import Header from "@/components/pricing/header"
import PricingCards from "@/components/pricing/pricing-cards"
import BillingToggle from "@/components/pricing/billing-toggle"
import ComparisonTable from "@/components/pricing/comparison-table"
import BadgeExplanation from "@/components/pricing/badge-explanation"
import FAQ from "@/components/pricing/faq"
import FooterCTA from "@/components/pricing/footer-cta"
import ChatbotFab from "@/components/chatbot/ChatbotFab"
import ChatbotPanel from "@/components/chatbot/ChatbotPanel"
import ProductOwnerCTA from "@/components/pricing/product-owner-cta" // Import the new component

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"quarterly" | "annual">("quarterly")
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [showFullPage, setShowFullPage] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <section className="fade-in pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Header />
      </section>

      <section className="slide-up px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <BillingToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      </section>

      <section id="plans" className="slide-up px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <PricingCards billingCycle={billingCycle} />
      </section>

      {!showFullPage && (
        <div className="relative flex justify-center mb-12">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
          <button
            onClick={() => setShowFullPage(true)}
            className="relative z-20 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            View More
          </button>
        </div>
      )}

      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${showFullPage ? 'max-h-full' : 'max-h-0'}`}>
        <section className="slide-up bg-primary/5 py-12 px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-7xl mx-auto">
            <BadgeExplanation />
          </div>
        </section>

        <section className="slide-up px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <ComparisonTable />
        </section>

        {/* New ProductOwnerCTA component */}
        <section className="slide-up px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <ProductOwnerCTA />
        </section>

        <section className="slide-up px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <FAQ />
        </section>

        <section className="slide-up bg-primary/10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <FooterCTA />
          </div>
        </section>
      </div>

      <ChatbotFab onClick={() => setIsChatbotOpen(!isChatbotOpen)} />
      <ChatbotPanel isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </main>
  )
}
