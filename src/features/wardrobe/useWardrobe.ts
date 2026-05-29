import { useCallback, useRef, useState } from 'react'
import type { ClothEffects, Grade, WardrobeState } from './types'
import { CLOTHES, CLOTHES_BY_GRADE } from './clothes'
import { coinsStorage, pityStorage, wardrobeStorage } from './storage'

// 가챠 상수
const COIN_PER_SCORE = 50 // 솔로 점수 50점당 코인 1개
const GACHA_COST = 100 // 가챠 1회 비용
const GACHA_PITY = 10 // 천장: B 10연속 → 다음은 A 이상 보장

const GACHA_RATES = { B: 0.7, A: 0.2, S: 0.099, 'S+': 0.001 }
// S+는 proposeEndingCleared === true 일 때만 풀에 진입

export function useWardrobe() {
  const wardrobeRef = useRef<WardrobeState>(wardrobeStorage.load())
  const coinsRef = useRef<number>(coinsStorage.load())
  const pityRef = useRef<number>(pityStorage.load())
  const [coins, setCoins] = useState(() => coinsStorage.load())
  // 렌더에서 ref를 직접 읽지 않도록 보유/장착 스냅샷은 state로 노출.
  const [wardrobe, setWardrobe] = useState(() => wardrobeStorage.load())

  const persistAll = useCallback(() => {
    wardrobeStorage.save(wardrobeRef.current)
    coinsStorage.save(coinsRef.current)
    pityStorage.save(pityRef.current)
    setCoins(coinsRef.current)
    setWardrobe(wardrobeRef.current)
  }, [])

  // 옷 장착 토글
  const toggleEquip = useCallback(
    (id: string) => {
      if (!wardrobeRef.current.owned.includes(id)) return
      wardrobeRef.current = {
        ...wardrobeRef.current,
        equipped: wardrobeRef.current.equipped === id ? null : id,
      }
      persistAll()
    },
    [persistAll],
  )

  // 현재 장착 옷의 효과 반환 (없으면 빈 객체)
  const getEquippedEffects = useCallback((): ClothEffects => {
    const eq = wardrobeRef.current.equipped
    if (!eq) return {}
    return CLOTHES[eq]?.effects ?? {}
  }, [])

  // 점수로 코인 적립
  const earnCoins = useCallback((score: number) => {
    const earned = Math.floor(score / COIN_PER_SCORE)
    if (earned <= 0) return 0
    coinsRef.current += earned
    coinsStorage.save(coinsRef.current)
    setCoins(coinsRef.current)
    return earned
  }, [])

  // 가챠 추첨 — 결과 반환 (UI에서 모달 표시용)
  const pullGacha = useCallback(
    (proposeEndingCleared: boolean) => {
      if (coinsRef.current < GACHA_COST) {
        return {
          error: true,
          message: `코인이 부족해요\n쓰임: ${GACHA_COST} / 보유: ${coinsRef.current}`,
        } as const
      }
      coinsRef.current -= GACHA_COST

      // 등급 결정
      let grade: Grade
      if (pityRef.current >= GACHA_PITY) {
        grade =
          Math.random() < GACHA_RATES.S / (GACHA_RATES.S + GACHA_RATES.A)
            ? 'S'
            : 'A'
      } else {
        const r = Math.random()
        const sPlusRate = proposeEndingCleared ? GACHA_RATES['S+'] : 0
        if (r < sPlusRate) grade = 'S+'
        else if (r < sPlusRate + GACHA_RATES.S) grade = 'S'
        else if (r < sPlusRate + GACHA_RATES.S + GACHA_RATES.A) grade = 'A'
        else grade = 'B'
      }

      // 풀에서 추첨 — 비어있으면 B로 강등 (S+ 미등록 등)
      let pool = CLOTHES_BY_GRADE[grade] ?? []
      if (pool.length === 0) {
        grade = 'B'
        pool = CLOTHES_BY_GRADE.B
      }
      const clothId = pool[Math.floor(Math.random() * pool.length)]
      const cloth = CLOTHES[clothId]

      // 천장 갱신
      if (grade === 'B') pityRef.current += 1
      else pityRef.current = 0

      // 보유 처리
      const alreadyOwned = wardrobeRef.current.owned.includes(clothId)
      if (!alreadyOwned) {
        wardrobeRef.current = {
          ...wardrobeRef.current,
          owned: [...wardrobeRef.current.owned, clothId],
        }
      }

      persistAll()
      return { error: false, cloth, alreadyOwned } as const
    },
    [persistAll],
  )

  return {
    wardrobeRef,
    coinsRef,
    coins,
    owned: wardrobe.owned,
    equipped: wardrobe.equipped,
    toggleEquip,
    getEquippedEffects,
    earnCoins,
    pullGacha,
  }
}
