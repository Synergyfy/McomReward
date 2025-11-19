"use client"

import { useState } from "react"
import { Reveal } from "@/components/ui/reveal"
import { ChevronDown } from "lucide-react"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is an NFC card?",
      answer:
        "An NFC (Near Field Communication) card is a physical card that, when scanned with a smartphone, shares your business page and rewards program instantly with customers.",
    },
    {
      question: "Can I change plans anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.",
    },
    {
      question: "Do I get help setting up?",
      answer: "All plans include Done-For-You Services with onboarding support to help you get started quickly.",
    },
    {
      question: "Is there a trial period?",
      answer: "Yes, we offer a 7-day Trial plan with all core features so you can test the platform before committing.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
    },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <Reveal animationClass="text-reveal" delayMs={60}>
        <h2 className="text-3xl font-bold mb-12 text-center text-balance">Frequently Asked Questions</h2>
      </Reveal>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Reveal key={index} animationClass="card-reveal" delayMs={index * 80}>
            <div className="border border-border rounded-lg bg-card transition-all duration-300 ease-in-out hover:shadow-md overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <span className="font-semibold text-left text-foreground">{faq.question}</span>
              <ChevronDown
                size={20}
                className={`text-primary transition-transform flex-shrink-0 ${openIndex === index ? "rotate-180" : ""}`}
              />
            </button>

            {openIndex === index && (
              <div className="px-6 py-4 bg-muted/20 border-t border-border text-foreground/80">{faq.answer}</div>
            )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
