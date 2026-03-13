import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';

export const metadata: Metadata = {
  title: '의사랑 기술문서',
  description: '의사랑 프로그램의 변경내역서 및 사용방법 안내',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1 pt-14">
            <Sidebar />
            <MainContent>{children}</MainContent>
          </div>
        </div>
      </body>
    </html>
  );
}
