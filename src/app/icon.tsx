import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
          borderRadius: 96,
        }}
      >
        <svg width="280" height="280" viewBox="0 0 512 512" fill="white">
          <path d="M256,120 Q256,256 120,256 Q256,256 256,392 Q256,256 392,256 Q256,256 256,120 Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
