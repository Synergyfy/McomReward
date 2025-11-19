import { Reveal } from "@/components/ui/reveal"

export default function Header() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-background to-background/40 p-8 sm:p-12">
      <div className="pointer-events-none absolute inset-0 animated-gradient opacity-60" />
      <div className="relative text-center">
        <Reveal animationClass="text-reveal" delayMs={60}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">
            Choose your membership — grow your business and reward your customers.
          </h1>
        </Reveal>
        <Reveal animationClass="text-reveal" delayMs={140}>
          <p className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto text-balance">
            Bronze, Silver, Gold, Platinum — pick the one that fits your business or your life.
          </p>
        </Reveal>

      </div>
    </div>
  )
}
