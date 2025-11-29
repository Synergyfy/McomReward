import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation'; // Import useParams

export default function CampaignPage() {
    const params = useParams();
    const { businessId, campaignId } = params; // Extract businessId and campaignId
    redirect(`/admin/view-business/${businessId}/campaigns/${campaignId}/overview`);
}
