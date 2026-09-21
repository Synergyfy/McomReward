import { CreateLoyaltySetupTemplateInternalDto } from "./dto/loyalty-setup-template.dto";

export const BUILT_IN_TEMPLATES: CreateLoyaltySetupTemplateInternalDto[] = [
  {
    name: "Restaurant Rewards Pack",
    description:
      "Welcome reward, birthday treat, referral incentive, and a visit-based loyalty stamp card.",
    sectorKey: "restaurant",
    benefits: [
      "Increase repeat visits by up to 35%",
      "Boost average order value with reward-driven upsells",
      "Reduce customer acquisition cost through referrals",
      "Build a loyal diner community with birthday perks",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "Spend £20, receive a free dessert voucher",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎉",
      },
      {
        key: "birthday",
        name: "Birthday Reward",
        description: "Free dessert on your birthday",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎂",
      },
      {
        key: "referral",
        name: "Referral Reward",
        description: "Refer a customer and receive £5 credit",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "👥",
      },
      {
        key: "visit",
        name: "Visit Reward",
        description: "Buy 5 main courses, get 1 free",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 5,
        image: "🔄",
      },
    ],
    campaigns: [
      {
        key: "new-customer",
        name: "New Customer Campaign",
        description:
          "Attract first-time diners with a Welcome Reward plus a free starter on their second visit.",
        includedRewardKeys: ["welcome"],
      },
      {
        key: "summer",
        name: "Summer Dining Campaign",
        description:
          "Promote al fresco dining with Welcome Reward and Referral Reward bundled together.",
        includedRewardKeys: ["welcome", "referral"],
      },
      {
        key: "birthday",
        name: "Birthday Campaign",
        description:
          "Celebrate customer birthdays with a free dessert and a Referral Reward for their guests.",
        includedRewardKeys: ["birthday", "referral"],
      },
    ],
  },
  {
    name: "Coffee Shop Rewards Pack",
    description:
      "Welcome pastry offer, birthday coffee, and a buy-5-get-1-free stamp card.",
    sectorKey: "cafe",
    benefits: [
      "Drive morning foot traffic with pastry incentives",
      "Increase frequency with buy-5-get-1-free stamp cards",
      "Boost customer satisfaction with birthday treats",
      "Encourage trial of higher-margin items",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "Buy any coffee, receive a free pastry",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "☕",
      },
      {
        key: "birthday",
        name: "Birthday Reward",
        description: "Free coffee on your birthday",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎂",
      },
      {
        key: "visit",
        name: "Visit Reward",
        description: "Buy 5 coffees, get 1 free",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 5,
        image: "🔄",
      },
    ],
    campaigns: [
      {
        key: "new-customer",
        name: "New Customer Campaign",
        description:
          "Welcome new customers with a free pastry on their first coffee purchase.",
        includedRewardKeys: ["welcome"],
      },
      {
        key: "birthday",
        name: "Birthday Campaign",
        description:
          "Offer a free coffee and pastry for birthday celebrations.",
        includedRewardKeys: ["birthday", "welcome"],
      },
    ],
  },
  {
    name: "Retail Rewards Pack",
    description:
      "Welcome discount, birthday voucher, and a referral reward — build a complete retail loyalty ecosystem.",
    sectorKey: "retail",
    benefits: [
      "Increase average transaction value with spend-based rewards",
      "Drive repeat purchases through birthday and seasonal offers",
      "Grow customer base organically with referral incentives",
      "Improve customer retention with a structured loyalty programme",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "Spend £50, receive £5 off your next purchase",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🛍️",
      },
      {
        key: "birthday",
        name: "Birthday Reward",
        description: "£10 birthday voucher",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎂",
      },
      {
        key: "referral",
        name: "Referral Reward",
        description: "Refer a friend and both get £10 off",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "👥",
      },
    ],
    campaigns: [
      {
        key: "new-customer",
        name: "New Customer Campaign",
        description:
          "Attract new shoppers with £5 off their first £50 purchase.",
        includedRewardKeys: ["welcome"],
      },
      {
        key: "seasonal",
        name: "Seasonal Campaign",
        description:
          "Bundle Welcome Reward and Referral Reward for seasonal promotions.",
        includedRewardKeys: ["welcome", "referral"],
      },
    ],
  },
  {
    name: "Salon Rewards Pack",
    description:
      "First-visit discount, birthday freebie, referral incentive, and a loyalty stamp card.",
    sectorKey: "salon",
    benefits: [
      "Fill appointment books with first-visit discount offers",
      "Increase visit frequency with loyalty stamp cards",
      "Generate new leads through client referral rewards",
      "Delight customers with personalised birthday perks",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "20% off your first visit",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "💇",
      },
      {
        key: "birthday",
        name: "Birthday Reward",
        description: "Free treatment up to £30 on your birthday",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎂",
      },
      {
        key: "referral",
        name: "Referral Reward",
        description: "Refer a friend and get 25% off your next visit",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "👥",
      },
      {
        key: "visit",
        name: "Visit Reward",
        description: "Every 5th visit, get 15% off",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 5,
        image: "🔄",
      },
    ],
    campaigns: [
      {
        key: "new-customer",
        name: "New Customer Campaign",
        description:
          "Welcome first-time clients with 20% off their first treatment.",
        includedRewardKeys: ["welcome"],
      },
      {
        key: "birthday",
        name: "Birthday Campaign",
        description:
          "Celebrate birthdays with a free treatment and referral offer for friends.",
        includedRewardKeys: ["birthday", "referral"],
      },
    ],
  },
  {
    name: "Service Business Rewards Pack",
    description: "New-client discount, birthday credit, and referral reward.",
    sectorKey: "service",
    benefits: [
      "Attract new clients with first-booking discount",
      "Secure repeat bookings through loyalty incentives",
      "Build a referral network among existing clients",
      "Stand out from competitors with a professional loyalty programme",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "15% off your first booking",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "📋",
      },
      {
        key: "birthday",
        name: "Birthday Reward",
        description: "£20 credit on your birthday",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎂",
      },
      {
        key: "referral",
        name: "Referral Reward",
        description: "Refer a client and get £25 credit",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "👥",
      },
    ],
    campaigns: [
      {
        key: "new-customer",
        name: "New Customer Campaign",
        description: "Attract new clients with 15% off their first booking.",
        includedRewardKeys: ["welcome"],
      },
      {
        key: "seasonal",
        name: "Seasonal Campaign",
        description:
          "Seasonal promotion bundling Welcome Reward and Referral Reward.",
        includedRewardKeys: ["welcome", "referral"],
      },
    ],
  },
  {
    name: "Gym & Fitness Rewards Pack",
    description:
      "Welcome trial offer, birthday perk, referral bonus, and a visit-based stamp card to keep members coming back.",
    sectorKey: "gym",
    benefits: [
      "Boost membership sign-ups with free trial sessions",
      "Increase member retention with visit-based rewards",
      "Grow membership base through referral incentives",
      "Enhance member experience with birthday and achievement perks",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "Free personal training session on signup",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "💪",
      },
      {
        key: "birthday",
        name: "Birthday Reward",
        description: "Free smoothie on your birthday",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎂",
      },
      {
        key: "referral",
        name: "Referral Reward",
        description: "Refer a friend and both get a free week",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "👥",
      },
      {
        key: "visit",
        name: "Visit Reward",
        description: "Visit 10 times, get a free month upgrade",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 10,
        image: "🔄",
      },
    ],
    campaigns: [
      {
        key: "new-customer",
        name: "New Member Campaign",
        description: "Welcome new members with a free PT session and smoothie.",
        includedRewardKeys: ["welcome"],
      },
      {
        key: "birthday",
        name: "Birthday Campaign",
        description:
          "Celebrate member birthdays with a free smoothie and referral bonus.",
        includedRewardKeys: ["birthday", "referral"],
      },
    ],
  },
  {
    name: "Custom Rewards Pack",
    description:
      "Start from scratch and build your own loyalty programme. You configure everything in the next steps.",
    sectorKey: "custom",
    benefits: [
      "Full flexibility to design your own loyalty programme",
      "Choose exactly which rewards and campaigns to offer",
      "Tailor every aspect to your specific business needs",
    ],
    rewards: [
      {
        key: "welcome",
        name: "Welcome Reward",
        description: "Configure your own welcome offer",
        rewardType: "Voucher",
        pointsRequired: 0,
        stampsRequired: 0,
        image: "🎯",
      },
    ],
    campaigns: [],
  },
];
