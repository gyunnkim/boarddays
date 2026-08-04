import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * 게스트(익명) 세션 사용자가 매치 입력 흐름에 들어왔을 때 보여주는 안내
 * 화면이다. 게스트는 매치를 저장할 수 없으므로, 실패하는 폼 대신 회원가입
 * 안내로 이어준다.
 */
export function GuestGate({ dict }: { dict: Dictionary }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6">
      <h2 className="text-lg font-medium text-stone-50">
        {dict.guestGate.title}
      </h2>
      <p className="mt-2 text-sm text-stone-400">{dict.guestGate.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-200"
        >
          {dict.guestGate.cta}
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-stone-400 hover:text-stone-200"
        >
          {dict.guestGate.back}
        </Link>
      </div>
    </div>
  );
}
