import { redirect } from 'next/navigation';

export default async function ConsumerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Redirect to wallet subpage by default
  redirect(`/admin/users/consumer/${id}/wallet`);
}
