export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/format';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Users — Admin | WokGen' };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true, email: true },
  });
  const isAdmin =
    currentUser?.isAdmin ||
    (process.env.ADMIN_EMAIL && currentUser?.email === process.env.ADMIN_EMAIL);
  if (!isAdmin) redirect('/');

  const { q: rawQ, page: rawPage } = await searchParams;
  const page = parseInt(rawPage || '1');
  const q = rawQ || '';
  const perPage = 25;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        isAdmin: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="adm-page">
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Users</h1>
          <p className="adm-subtitle">
            {total} total users
          </p>
        </div>
        <form className="adm-actions">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email..."
            className="adm-search"
          />
          <button
            type="submit"
            className="btn btn-secondary adm-btn"
          >
            Search
          </button>
        </form>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr className="adm-row adm-row--head">
              {['User', 'Email', 'Joined', 'Role'].map((h) => (
                <th key={h} className="adm-th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="adm-row">
                <td className="adm-td">
                  <div className="adm-user-cell">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || 'User avatar'}
                        className="adm-avatar"
                      />
                    ) : (
                      <div className="adm-avatar-fallback">
                        {(user.name || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span>{user.name || 'No name'}</span>
                  </div>
                </td>
                <td className="adm-td adm-td--secondary">
                  {user.email || '-'}
                </td>
                <td className="adm-td adm-td--muted">
                  {formatDate(user.createdAt)}
                </td>
                <td className="adm-td">
                  {user.isAdmin ? (
                    <span className="adm-badge">Admin</span>
                  ) : (
                    <span className="adm-badge--user">User</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total === 0 && (
          <div className="adm-empty">No users found.</div>
        )}
      </div>

      {total > perPage && (
        <div className="adm-pagination">
          {page > 1 && (
            <a
              href={`?q=${q}&page=${page - 1}`}
              className="btn btn-secondary adm-btn"
            >
              Previous
            </a>
          )}
          <span className="adm-pagination__info">
            Page {page} of {Math.ceil(total / perPage)}
          </span>
          {page < Math.ceil(total / perPage) && (
            <a
              href={`?q=${q}&page=${page + 1}`}
              className="btn btn-secondary adm-btn"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
