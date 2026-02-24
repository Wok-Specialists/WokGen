import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Delete related data before removing the user.
    // Models with onDelete: Cascade will be handled automatically,
    // but we explicitly clean up models with onDelete: SetNull or no cascade.
    await prisma.eralNote.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.eralConversation.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.galleryAsset.deleteMany({ where: { job: { userId } } }).catch(() => {});
    await prisma.apiKey.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.userPreference.delete({ where: { userId } }).catch(() => {});
    await prisma.usagePeriod.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.subscription.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.account.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.session.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.user.delete({ where: { id: userId } });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://wokgen.wokspec.org';
    return Response.redirect(new URL('/login?deleted=true', baseUrl), 303);
  } catch (error) {
    console.error('Account deletion failed:', error);
    return new Response('Failed to delete account. Please contact support.', { status: 500 });
  }
}
