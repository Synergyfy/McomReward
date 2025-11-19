"use client"

import { Reveal } from "@/components/ui/reveal"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FooterCTA() {
  return (
    <section className="bg-gradient-to-b from-background to-background/50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal animationClass="text-reveal" delayMs={60}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">Have Questions?</h2>
        </Reveal>
        <Reveal animationClass="text-reveal" delayMs={140}>
          <p className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto text-balance mb-8">
            Want to know more about our plans or have a specific question? Get in touch with our team.
          </p>
        </Reveal>
        <div className="mt-8">
          <Link href="/contact" passHref>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
