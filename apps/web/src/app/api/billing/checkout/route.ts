import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Billing is not yet available. WokGen is currently free for all users.',
      code: 'BILLING_NOT_AVAILABLE',
    },
    { status: 410 },
  );
}
