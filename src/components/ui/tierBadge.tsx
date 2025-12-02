import { Medal, Award, Trophy, Crown } from "lucide-react";

export const tierIcons = {
  Bronze: Medal,
  Silver: Award,
  Gold: Trophy,
  Platinum: Crown,
};

export type TierName = keyof typeof tierIcons;

export const isTierName = (name: string): name is TierName => {
  return name in tierIcons;
};


const tierStyles = {
  Bronze: "bg-amber-100 text-amber-700",
  Silver: "bg-gray-200 text-gray-700",
  Gold: "bg-yellow-100 text-yellow-700",
  Platinum: "bg-blue-100 text-blue-700",
};

export default function TierBadge({ tier = "Silver" }: { tier?: keyof typeof tierIcons }) {
  const Icon = tierIcons[tier] || Medal;
  const style = tierStyles[tier] || "bg-gray-100 text-gray-700";

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm ${style}`}
    >
      <Icon size={16} />
      <span>{tier} Member</span>
    </div>
  );
}
