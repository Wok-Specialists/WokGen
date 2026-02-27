import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { API_ERRORS, apiSuccess } from '@/lib/api-response';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return API_ERRORS.UNAUTHORIZED();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, bio: true, image: true, email: true },
    });
    if (!user) return API_ERRORS.NOT_FOUND('User');
    return apiSuccess(user);
  } catch (err) {
    log.error({ err }, 'GET /api/user/profile failed');
    return API_ERRORS.INTERNAL();
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return API_ERRORS.UNAUTHORIZED();

  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : undefined;
    const bio  = typeof body.bio  === 'string' ? body.bio.trim().slice(0, 300) : undefined;

    const update: { name?: string; bio?: string } = {};
    if (name !== undefined) update.name = name || undefined;
    if (bio  !== undefined) update.bio  = bio;

    const user = await prisma.user.update({
      where:  { id: session.user.id },
      data:   update,
      select: { name: true, bio: true },
    });

    return apiSuccess(user);
  } catch (err) {
    log.error({ err }, 'PATCH /api/user/profile failed');
    return API_ERRORS.INTERNAL();
  }
}
