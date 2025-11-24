import { redirect } from 'next/navigation';

export default function CampaignPage({ params }: { params: { campaignId: string } }) {
    redirect(`/dashboard/campaigns/${params.campaignId}/overview`);
}
