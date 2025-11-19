import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductOwnerCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          {/* Left Column: Image */}
          <div className="relative h-64 md:h-full w-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center px-8 py-4">
            <Image
              src="/product.jpg" // Placeholder image
              alt="Product Owner"
              layout="fill"
              objectFit="contain"
              className="drop-shadow-2xl"
            />
          </div>

          {/* Right Column: Text Content */}
          <div className="p-8 md:p-12 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Product Owner:</h2>
            <p className="text-lg text-muted-foreground">
              Someone who owns a product or service, but does NOT necessarily own a shop.
            </p>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">How it works:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Join MCOM but usually not with the same status as a business owner.</li>
                <li>Be added into a group by a Business Owner.</li>
                <li>Bring products into the group so that other businesses can cross-sell.</li>
                <li>Earn from other members selling their products.</li>
                <li>Get increased visibility through the network.</li>
                <li>Use QR plaques assigned to them (but they don’t physically place them in a shop unless arranged).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Benefits:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access to multiple physical shops selling your product</li>
                <li>More sales without needing a shop</li>
                <li>Automatic exposure to the group’s customers</li>
                <li>Shared revenue from the group network</li>
              </ul>
            </div>

            <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
              COMING SOON
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
