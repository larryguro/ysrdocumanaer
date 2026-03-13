import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '의사랑 기술문서',
  description: '의사랑 프로그램의 변경내역서 및 사용방법 안내',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
