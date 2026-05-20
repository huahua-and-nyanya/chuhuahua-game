import type { JSX } from 'react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import '@/game/keyframes.css'

import { Chihuahua } from '@/game/characters/Chihuahua'
import { Cat } from '@/game/characters/Cat'
import { Pigeon } from '@/game/characters/Pigeon'
import { ShieldBubble } from '@/game/characters/ShieldBubble'
import { Kibble } from '@/game/items/Kibble'
import { Fish } from '@/game/items/Fish'
import { Cucumber } from '@/game/items/Cucumber'
import { SweetPotato } from '@/game/items/SweetPotato'

import { PreviewSection, PreviewRow } from './-components/PreviewLayout'

export const Route = createFileRoute('/dev/game-preview')({
  component: GamePreview,
})

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ label, checked, onChange }: ToggleProps): JSX.Element {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 text-sm select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

function StageBox({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center rounded-md border border-dashed border-[var(--color-text-muted)]">
      {children}
    </div>
  )
}

function GamePreview(): JSX.Element {
  // Chihuahua state
  const [chiKissing, setChiKissing] = useState(false)
  const [chiBoosted, setChiBoosted] = useState(false)
  const [chiMega, setChiMega] = useState(false)
  const [chiSlowed, setChiSlowed] = useState(false)
  const [chiSad, setChiSad] = useState(false)
  const [chiShielded, setChiShielded] = useState(false)

  // Cat state
  const [catKissing, setCatKissing] = useState(false)
  const [catShielded, setCatShielded] = useState(false)
  const [catScared, setCatScared] = useState(false)
  const [catAngry, setCatAngry] = useState(false)
  const [catBoosted, setCatBoosted] = useState(false)
  const [catSlowed, setCatSlowed] = useState(false)

  // Pigeon
  const [pigeonFleeing, setPigeonFleeing] = useState(false)

  return (
    <main
      style={{
        padding: 'var(--gap-xl)',
        minHeight: '100dvh',
        background: 'var(--color-bg-frame)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-xl)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          margin: 0,
        }}
      >
        Game Preview (Cycle B)
      </h1>

      <PreviewSection title="Chihuahua">
        <PreviewRow label="state toggles">
          <StageBox>
            <Chihuahua
              kissing={chiKissing}
              boosted={chiBoosted}
              mega={chiMega}
              slowed={chiSlowed}
              sad={chiSad}
            />
            {chiShielded && <ShieldBubble owner="chi" />}
          </StageBox>
          <div className="flex flex-col gap-2">
            <Toggle
              label="kissing (67)"
              checked={chiKissing}
              onChange={setChiKissing}
            />
            <Toggle
              label="boosted"
              checked={chiBoosted}
              onChange={setChiBoosted}
            />
            <Toggle label="mega (70)" checked={chiMega} onChange={setChiMega} />
            <Toggle
              label="slowed (70)"
              checked={chiSlowed}
              onChange={setChiSlowed}
            />
            <Toggle label="sad (67)" checked={chiSad} onChange={setChiSad} />
            <Toggle
              label="shielded (CSS 거품 84, 변신 자산 없음)"
              checked={chiShielded}
              onChange={setChiShielded}
            />
          </div>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Cat + ShieldBubble">
        <PreviewRow label="state toggles">
          <StageBox>
            <Cat
              kissing={catKissing}
              shielded={catShielded}
              scared={catScared}
              angry={catAngry}
              boosted={catBoosted}
              slowed={catSlowed}
            />
            {catShielded && <ShieldBubble owner="cat" />}
          </StageBox>
          <div className="flex flex-col gap-2">
            <Toggle
              label="kissing (84)"
              checked={catKissing}
              onChange={setCatKissing}
            />
            <Toggle
              label="shielded (변신 + CSS 거품 104)"
              checked={catShielded}
              onChange={setCatShielded}
            />
            <Toggle
              label="scared"
              checked={catScared}
              onChange={setCatScared}
            />
            <Toggle
              label="angry (88)"
              checked={catAngry}
              onChange={setCatAngry}
            />
            <Toggle
              label="boosted"
              checked={catBoosted}
              onChange={setCatBoosted}
            />
            <Toggle
              label="slowed (88)"
              checked={catSlowed}
              onChange={setCatSlowed}
            />
          </div>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Pigeon">
        <PreviewRow label="fleeing toggle">
          <StageBox>
            <Pigeon fleeing={pigeonFleeing} />
          </StageBox>
          <div className="flex flex-col gap-2">
            <Toggle
              label="fleeing"
              checked={pigeonFleeing}
              onChange={setPigeonFleeing}
            />
          </div>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Items">
        <PreviewRow label="kibble / fish / cucumber / sweetPotato">
          <Kibble />
          <Fish />
          <Cucumber />
          <SweetPotato />
        </PreviewRow>
      </PreviewSection>
    </main>
  )
}
