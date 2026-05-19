import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { MAIN_HERO, TITLE_LOGO, ICON_ASSETS } from '@/assets'
import { GameFrame } from '@/ui/GameFrame'
import { NavButton } from '@/ui/NavButton'
import { IconNavButton } from '@/ui/IconNavButton'
import { CenterModal } from '@/ui/CenterModal'
import { MultiplayerSelectModal } from './-components/MultiplayerSelectModal'
import styles from './-styles/HomePage.module.css'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const [multiOpen, setMultiOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [rankingOpen, setRankingOpen] = useState(false)

  const cornerActions = (
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
  )

  const sideMenu = (
    <>
      <NavButton label="혼자서" onClick={() => navigate({ to: '/solo' })} />
      <NavButton label="둘이서" onClick={() => setMultiOpen(true)} />
      <NavButton label="옷장" onClick={() => navigate({ to: '/wardrobe' })} />
    </>
  )

  return (
    <main className={styles.page}>
      <div className={styles.frameStack}>
        <motion.img
          src={TITLE_LOGO}
          alt="츄와와 뽀뽀 돌격"
          className={styles.title}
          style={{ x: '-50%' }}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        />
        <div className={styles.mobileCornerActions}>{cornerActions}</div>

        <GameFrame
          background={`url(${MAIN_HERO}) center / cover no-repeat`}
          cornerActions={cornerActions}
          sideMenu={sideMenu}
        >
          <div aria-hidden className="h-full w-full" />
        </GameFrame>

        <div className={styles.mobileNav}>{sideMenu}</div>
      </div>

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
