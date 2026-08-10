import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-[100svh] flex-col items-center justify-center gap-6 bg-[#0b0908] text-stone-200">
      <p className="text-sm text-stone-400">반려 도깨비불</p>
      <Link
        href="/awaken"
        className="rounded-full border border-stone-600 px-6 py-2.5 text-sm text-stone-200 transition-colors hover:border-amber-400/60 hover:text-amber-200"
      >
        비 오는 첫 번째 밤으로 가기
      </Link>
    </div>
  );
}
