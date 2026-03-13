import { redirect } from 'next/navigation';

export default function RootPage() {
  // 첫 번째 문서로 리다이렉트 (Sprint 3에서 DB 기반으로 교체)
  redirect('/docs/sample');
}
