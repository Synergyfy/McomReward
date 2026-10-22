import { redirect } from "next/navigation";

export default function LegacyPayPalReturnPage() {
  redirect("/dashboard/subscription");
}
