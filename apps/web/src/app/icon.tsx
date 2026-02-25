import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'sans-serif',
      }}
    >
      W
    </div>,
    { width: 32, height: 32 },
  );
}
