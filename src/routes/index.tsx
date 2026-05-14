import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MAIN_HERO, TITLE_LOGO, ICON_ASSETS } from '@/assets'
import { GameFrame } from '@/ui/GameFrame'
import { NavButton } from '@/ui/NavButton'
import { IconNavButton } from '@/ui/IconNavButton'
import { CenterModal } from '@/ui/CenterModal'
import { MultiplayerSelectModal } from './-components/MultiplayerSelectModal'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const [multiOpen, setMultiOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [rankingOpen, setRankingOpen] = useState(false)

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--gap-lg)',
        padding: 'var(--gap-lg)',
        backgroundImage: `url(${MAIN_HERO})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <img
        src={TITLE_LOGO}
        alt="츄와와 뽀뽀 돌격"
        style={{
          width: '100%',
          maxWidth: '360px',
          height: 'auto',
          objectFit: 'contain',
        }}
      />

      <GameFrame
        cornerActions={
          <>
            <IconNavButton
              icon={ICON_ASSETS.ranking}
              alt="랭킹"
              onClick={() => setRankingOpen(true)}
            />
            <IconNavButton
              icon={ICON_ASSETS.help}
              alt="게임 방법"
              onClick={() => setGuideOpen(true)}
            />
          </>
        }
        sideMenu={
          <>
            <NavButton
              label="혼자서"
              onClick={() => navigate({ to: '/solo' })}
            />
            <NavButton label="둘이서" onClick={() => setMultiOpen(true)} />
            <NavButton
              label="옷장"
              onClick={() => navigate({ to: '/wardrobe' })}
            />
          </>
        }
      >
        <div aria-hidden style={{ width: '100%', height: '100%' }} />
      </GameFrame>

      <MultiplayerSelectModal
        open={multiOpen}
        onClose={() => setMultiOpen(false)}
      />
      <CenterModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="게임 방법"
      >
        준비 중
      </CenterModal>
      <CenterModal
        open={rankingOpen}
        onClose={() => setRankingOpen(false)}
        title="랭킹"
      >
        준비 중
      </CenterModal>
    </main>
  )
}
