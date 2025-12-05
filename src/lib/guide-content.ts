export type GuideStep = 'REWARD' | 'CAMPAIGN' | 'STAFF' | 'COMPLETED';

export const GUIDE_CONTENT: Record<GuideStep, string> = {
  REWARD: "Navigate to the Rewards section and create your first reward for your customers.",
  CAMPAIGN: "Next, go to Campaigns and launch a new campaign to engage your audience.",
  STAFF: "Almost there! Manage your team by adding Staff members to help run your business.",
  COMPLETED: "You're all set! You've completed the setup guide.",
};
