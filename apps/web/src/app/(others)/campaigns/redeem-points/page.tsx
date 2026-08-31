import { redirect } from 'next/navigation';

export default async function RedeemPointsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string | string[] }>;
}) {
  const params = await searchParams;
  const campaignId = Array.isArray(params.campaignId) ? params.campaignId[0] : params.campaignId;

  if (campaignId) {
    redirect(`/campaigns/${campaignId}/redeem-points`);
  }

  redirect('/campaigns');
}