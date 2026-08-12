import { BookOpen, Moon, Settings } from "lucide-react";

import type { ScreenName } from "@/hooks/use-dokkaebi-app";

interface BottomNavProps {
  screen: ScreenName;
  goHome: () => void;
  goLog: () => void;
  goSettings: () => void;
}

/**
 * 디자인.md §12. Three of the document's four recommended tabs — this prototype
 * keeps 성장 inside 기록 (the 변화 이력 tab and the growth card on 오늘) rather
 * than inventing a fourth screen for it.
 *
 * The active tab is a cream icon and label, never a large coloured capsule (§12).
 * Colour alone doesn't carry the state (§16.2): the label also thickens, and
 * `aria-current="page"` announces it.
 */
const TABS = [
  { key: "home", label: "오늘", Icon: Moon },
  { key: "log", label: "기록", Icon: BookOpen },
  { key: "settings", label: "설정", Icon: Settings },
] as const;

export function BottomNav({ screen, goHome, goLog, goSettings }: BottomNavProps) {
  const go = { home: goHome, log: goLog, settings: goSettings } as const;

  return (
    <nav aria-label="주요 화면" className="night-nav">
      {TABS.map(({ key, label, Icon }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            type="button"
            onClick={go[key]}
            aria-current={active ? "page" : undefined}
            className="night-nav__item"
          >
            <Icon
              size={22}
              // §10.3 — icon stroke 1.7–2px, the heavier weight reserved for the
              // selected tab.
              strokeWidth={active ? 2 : 1.7}
              aria-hidden
            />
            <span style={{ fontWeight: active ? 650 : 550 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
