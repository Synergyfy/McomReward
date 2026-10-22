import { redirect } from "next/navigation";

export default function LegacyCheckoutConfirmationPage() {
  redirect("/dashboard/subscription");
}
