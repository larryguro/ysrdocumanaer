// 로그인 페이지는 관리자 레이아웃(헤더/사이드바) 없이 풀스크린으로 표시
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
