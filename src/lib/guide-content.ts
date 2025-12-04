export type GuideStep = 'PROFILE' | 'REWARD' | 'CAMPAIGN' | 'STAFF' | 'COMPLETED';

export const GUIDE_CONTENT: Record<GuideStep, string> = {
  PROFILE: "Welcome! To get started, please go to your Business Profile and complete your details (Address, Phone, etc).",
  REWARD: "Great job! Now, navigate to the Rewards section and create your first reward for your customers.",
  CAMPAIGN: "Next, go to Campaigns and launch a new campaign to engage your audience.",
  STAFF: "Almost there! Manage your team by adding Staff members to help run your business.",
  COMPLETED: "You're all set! You've completed the setup guide.",
};
