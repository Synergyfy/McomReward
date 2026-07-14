import { Settings, Megaphone, Zap } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function BadgeExplanation() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Reveal animationClass="text-reveal" delayMs={60}>
          <h2 className="text-3xl font-bold mb-6 text-balance">Your Membership Badge</h2>
        </Reveal>
        <Reveal animationClass="text-reveal" delayMs={140}>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto text-balance mb-8">
            Your membership comes with a physical NFC card — scan to share your business page and rewards instantly.
            Physical NFC card included for annual members.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <TooltipProvider>
          {[
            { icon: Settings, name: "Done-For-You Setup", desc: "We configure your account and assets so you can launch fast." },
            { icon: Megaphone, name: "Marketing Assets", desc: "Pre-made graphics, QR codes and scripts for posts and short videos." },
            { icon: Zap, name: "Automation Support", desc: "Guidance and tools to automate repeatable workflows." },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Reveal key={item.name} animationClass="card-reveal" delayMs={idx * 100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-card rounded-3xl p-8 text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 shadow-sm border-2 border-border hover:border-primary hover:bg-primary/5">
                      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300">
                        <Icon className="w-10 h-10 text-primary" strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-foreground mb-2 text-lg">{item.name}</h3>
                      <p className="text-sm text-foreground/60">{item.desc}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </Reveal>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}