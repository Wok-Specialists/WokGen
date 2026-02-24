import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Subscriptions are no longer available. All features are free.' },
    { status: 410 },
  );
}
