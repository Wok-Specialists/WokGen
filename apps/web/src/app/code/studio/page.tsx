import { redirect } from 'next/navigation';

// The code studio lives at /studio/code — redirect to it
export default function CodeStudioPage() {
  redirect('/studio/code');
}
