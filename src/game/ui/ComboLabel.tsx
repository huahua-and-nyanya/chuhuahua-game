import clsx from 'clsx'

// 콤보 라벨 — 게임 화면 카드 하단 중앙에 단계별 분기로 표시.
// 콤보 2부터 표시. key={combo}로 갱신마다 재마운트 → combo-bounce 키프레임 재실행.
//
// 위치: 좌표계 640×480 안 bottom-4 + left-1/2 + translate-x-1/2 (Tailwind 클래스)
// → keyframes 안 transform은 translateX(-50%) 직접 지정 (Tailwind와 충돌 회피).
//
// 단계 (reference 일치, 이모지 제거):
//   2-3   "콤보 x{n}"      흰 배경 + ink 텍스트
//   4-6   "뜨거운 콤보!"   pink-700 배경 + 흰 텍스트
//   7-9   "엄청난 콤보!"   pink-700 배경 + 흰 텍스트
//   10+   "전설의 뽀뽀!!"  gold 배경 + ink 텍스트

type ComboTier = 'low' | 'mid' | 'high' | 'legend'

type ComboLabelData = {
  text: string
  tier: ComboTier
}

function getComboLabel(combo: number): ComboLabelData | null {
  if (combo >= 10) return { text: '전설의 뽀뽀!!', tier: 'legend' }
  if (combo >= 7) return { text: '엄청난 콤보!', tier: 'high' }
  if (combo >= 4) return { text: '뜨거운 콤보!', tier: 'mid' }
  if (combo >= 2) return { text: `콤보 x${combo}`, tier: 'low' }
  return null
}

const TIER_CLASSES: Record<ComboTier, string> = {
  low: 'bg-bg-card text-text-primary',
  mid: 'bg-pink-700 text-text-on-pink',
  high: 'bg-pink-700 text-text-on-pink',
  legend: 'bg-game-accent-gold text-text-primary',
}

export type ComboLabelProps = {
  combo: number
  visible: boolean
}

export function ComboLabel({ combo, visible }: ComboLabelProps) {
  if (!visible) return null
  const data = getComboLabel(combo)
  if (!data) return null

  return (
    <div
      key={combo}
      className={clsx(
        'pointer-events-none absolute bottom-4 left-1/2 z-30',
        'border-ink-base rounded-pill shadow-card border-[3px]',
        'px-lg py-sm',
        'font-body text-lg font-medium whitespace-nowrap',
        'animate-combo-bounce',
        TIER_CLASSES[data.tier],
      )}
    >
      {data.text}
    </div>
  )
}
