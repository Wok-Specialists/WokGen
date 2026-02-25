import { getAllCircuitStatuses } from '@/lib/circuit-breaker';
import { requireAdmin, isAdminResponse } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adminResult = await requireAdmin();
  if (isAdminResponse(adminResult)) return adminResult;

  const statuses = getAllCircuitStatuses();
  return Response.json({ circuits: statuses });
}
