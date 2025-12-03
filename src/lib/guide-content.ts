
export interface GuideStep {
    title: string;
    description: string;
}

export const REWARD_CREATION_STEPS: GuideStep[] = [
    {
        title: "Create Your Reward",
        description: "Welcome to the reward creation wizard. This guide will walk you through setting up a new reward for your customers. Start by selecting the type of reward you want to offer."
    },
    {
        title: "Enter Details",
        description: "Great! Now enter a catchy name for your reward, a description, and the value. Don't forget to set the points required to redeem it."
    }
];

export const CAMPAIGN_CREATION_STEPS: GuideStep[] = [
    {
        title: "Choose Campaign Type",
        description: "You have a reward! Now let's create a campaign to distribute it. Select the type of campaign that best fits your goals (e.g., QR Code for in-store)."
    },
    {
        title: "Set Campaign Details",
        description: "Give your campaign a name and customize its appearance. You can preview how it looks on the right."
    },
    {
        title: "Review and Launch",
        description: "Review all your settings. When you are ready, click 'Create Campaign' to launch it!"
    }
];

export const STAFF_CREATION_STEPS: GuideStep[] = [
    {
        title: "Manage Staff",
        description: "Your campaign is live! To help manage redemptions, you can add staff members. Select a business from the list below to manage its staff."
    }
];

export const BUSINESS_REWARD_CREATION_STEPS: GuideStep[] = [
    {
        title: "Create Business Reward",
        description: "Welcome! Start by entering a name for your reward. This is what your customers will see."
    },
    {
        title: "Review and Save",
        description: "Review the details of your reward. If everything looks good, click 'Create Reward' to save it to your inventory."
    }
];

export const BUSINESS_CAMPAIGN_CREATION_STEPS: GuideStep[] = [
    {
        title: "Create Campaign",
        description: "Now let's create a campaign to promote your reward. Choose the type of campaign you want to run."
    },
    {
        title: "Customize Campaign",
        description: "Set the details for your campaign, including the name, description, and which reward to include."
    },
    {
        title: "Launch Campaign",
        description: "Almost there! Review your campaign settings and click 'Create Campaign' to go live."
    }
];

export const BUSINESS_STAFF_MANAGEMENT_STEPS: GuideStep[] = [
    {
        title: "Add Staff Members",
        description: "You can add staff members here to help you scan and redeem rewards in your store."
    }
];

export const VOUCHER_CREATION_STEPS: GuideStep[] = [
    {
        title: "Create Voucher",
        description: "Vouchers are a great way to offer direct discounts or freebies. Fill in the details to create a new voucher."
    }
];

export const GUIDE_CONTENT: Record<string, GuideStep[]> = {
    'REWARD': REWARD_CREATION_STEPS,
    'CAMPAIGN': CAMPAIGN_CREATION_STEPS,
    'STAFF': STAFF_CREATION_STEPS,
    'BUSINESS_REWARD': BUSINESS_REWARD_CREATION_STEPS,
    'BUSINESS_CAMPAIGN': BUSINESS_CAMPAIGN_CREATION_STEPS,
    'BUSINESS_STAFF': BUSINESS_STAFF_MANAGEMENT_STEPS,
    'VOUCHER': VOUCHER_CREATION_STEPS
};
