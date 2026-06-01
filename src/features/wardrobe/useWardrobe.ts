import { useCallback, useRef, useState } from 'react'
import { clothPath } from '@/assets/clothes'
import type { ClothEffects, GachaResult, Grade, WardrobeState } from './types'
import { CLOTHES, CLOTHES_BY_GRADE, STORY_CLOTH_IDS } from './clothes'
import {
  coinsStorage,
  pityStorage,
  playStatsStorage,
  wardrobeStorage,
} from './storage'

// 가챠 상수
const COIN_PER_SCORE = 50 // 솔로 점수 50점당 코인 1개
export const GACHA_COST = 15 // 가챠 1회 비용 (코인 적립 50점당 1개 → 3~4판당 1회)
const GACHA_PITY = 10 // 천장: B 10연속 → 다음은 A 이상 보장
const MAX_COINS = 999 // 지갑 상한 — 초과 적립분은 버려지고 게임오버에서 "지갑이 다 찼어" 안내

// 합 1.0. B는 else 분기라 임계값 미사용(문서값) — S/A/S+만 cascade 임계에 쓰임.
const GACHA_RATES = { B: 0.601, A: 0.2, S: 0.099, 'S+': 0.1 }

// 중복(이미 보유) 추첨 시 등급별 코인 환불. S+(wedding)는 환불 미정의 → 중복 시 0 (희소 보상이라 의도).
const REFUND_BY_GRADE: Partial<Record<Grade, number>> = { B: 1, A: 3, S: 5 }
// S+는 proposeEndingCleared === true 일 때만 풀에 진입 (clear 전엔 sPlusRate=0)

export function useWardrobe() {
  const wardrobeRef = useRef<WardrobeState>(wardrobeStorage.load())
  const coinsRef = useRef<number>(coinsStorage.load())
  const pityRef = useRef<number>(pityStorage.load())
  const [coins, setCoins] = useState(() => coinsStorage.load())
  // 렌더에서 ref를 직접 읽지 않도록 보유/장착/천장 스냅샷은 state로 노출.
  const [wardrobe, setWardrobe] = useState(() => wardrobeStorage.load())
  const [pity, setPity] = useState(() => pityStorage.load())

  const persistAll = useCallback(() => {
    wardrobeStorage.save(wardrobeRef.current)
    coinsStorage.save(coinsRef.current)
    pityStorage.save(pityRef.current)
    setCoins(coinsRef.current)
    setWardrobe(wardrobeRef.current)
    setPity(pityRef.current)
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

  // 현재 장착 옷의 효과 반환 (없으면 빈 객체).
  // S+ 옷은 1회 시청 완료(usedClothes 포함) 후 효과 전부 무효 → {} 반환.
  // (이로써 pigeonDisabled/itemPoolOverride 자동 해제 = 비둘기 복귀 + 일반 아이템풀.)
  const getEquippedEffects = useCallback((): ClothEffects => {
    const { equipped: eq, usedClothes } = wardrobeRef.current
    if (!eq) return {}
    const cloth = CLOTHES[eq]
    if (!cloth) return {}
    if (cloth.grade === 'S+' && usedClothes.includes(eq)) return {}
    return cloth.effects ?? {}
  }, [])

  // 현재 장착 옷의 게임 내 스킨(츄 풀바디) 경로. 미장착이면 undefined → 기본 츄.
  // 적용 범위는 idle 스프라이트만 (Chihuahua 우선순위: kissing/sad/slowed > equippedSrc).
  const getEquippedSkin = useCallback((): string | undefined => {
    const eq = wardrobeRef.current.equipped
    return eq ? clothPath('chi', eq, 'full') : undefined
  }, [])

  // 페어(pair) 옷일 때만 냐냐도 같이 입는 스킨(냐냐 풀바디) 경로. 단독 옷은 냐냐 자산 없음 → undefined.
  const getEquippedCatSkin = useCallback((): string | undefined => {
    const eq = wardrobeRef.current.equipped
    if (!eq) return undefined
    return CLOTHES[eq]?.pair ? clothPath('cat', eq, 'full') : undefined
  }, [])

  // propose 코스튬 스토리 armed 판정 — 데이트룩 + LV10 컷신 노출 조건.
  // equipped === 'propose' && rose·vacation·propose 3벌 모두 보유 && 미클리어.
  // isSolo 조건은 호출처(solo.tsx)가 담당. 게임 시작 시 1회 스냅샷용이라 storage를 직접 읽음.
  const getProposeArmed = useCallback((): boolean => {
    const { equipped, owned } = wardrobeRef.current
    if (equipped !== 'propose') return false
    if (!STORY_CLOTH_IDS.every((id) => owned.includes(id))) return false
    return !playStatsStorage.load().proposeEndingCleared
  }, [])

  // wedding 게임변형 armed 판정 — wedding 착용 + 미사용(usedClothes 미포함)이면 true.
  // getProposeArmed 패턴 미러. isSolo 조건은 호출처(solo.tsx) 담당.
  const getWeddingArmed = useCallback((): boolean => {
    const { equipped, usedClothes } = wardrobeRef.current
    if (equipped !== 'wedding') return false
    return !usedClothes.includes('wedding')
  }, [])

  // propose 엔딩 클리어 마킹 — STORY_MODAL 도달 시 1회 호출(컷신 완료 = 해금 확정).
  // 멱등: 이미 true면 no-op. 이후 pullGacha가 storage를 직접 읽어 S+(wedding) 풀에 포함.
  // 게이팅은 storage 기반이라 별도 state 불요 — 다음 가챠/재플레이 스냅샷부터 반영.
  const markProposeEndingCleared = useCallback(() => {
    const cur = playStatsStorage.load()
    if (cur.proposeEndingCleared) return
    playStatsStorage.save({ ...cur, proposeEndingCleared: true })
  }, [])

  // 점수로 코인 적립 — MAX_COINS(999) 상한. 상한 초과분은 버려지고 walletFull로 알림.
  const earnCoins = useCallback(
    (score: number): { earned: number; walletFull: boolean } => {
      const wouldEarn = Math.floor(score / COIN_PER_SCORE)
      if (wouldEarn <= 0) return { earned: 0, walletFull: false }
      const before = coinsRef.current
      const after = Math.min(MAX_COINS, before + wouldEarn)
      coinsRef.current = after
      coinsStorage.save(coinsRef.current)
      setCoins(coinsRef.current)
      // 적립 시도가 있었는데 상한에 닿았으면 지갑이 가득 찬 상태로 본다.
      return { earned: after - before, walletFull: after >= MAX_COINS }
    },
    [],
  )

  // 가챠 추첨 — 결과 반환 (UI에서 모달 표시용)
  const pullGacha = useCallback((): GachaResult => {
    const { proposeEndingCleared } = playStatsStorage.load()
    if (coinsRef.current < GACHA_COST) {
      return { error: true, cost: GACHA_COST, have: coinsRef.current }
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

    // 보유 처리 — 신규면 보유 추가, 중복이면 등급별 코인 환불(상한 내).
    const alreadyOwned = wardrobeRef.current.owned.includes(clothId)
    let refund = 0
    if (!alreadyOwned) {
      wardrobeRef.current = {
        ...wardrobeRef.current,
        owned: [...wardrobeRef.current.owned, clothId],
      }
    } else {
      refund = REFUND_BY_GRADE[cloth.grade] ?? 0
      if (refund > 0) {
        coinsRef.current = Math.min(MAX_COINS, coinsRef.current + refund)
      }
    }

    persistAll()
    return { error: false, cloth, alreadyOwned, refund } as const
  }, [persistAll])

  return {
    wardrobeRef,
    coinsRef,
    coins,
    pity,
    owned: wardrobe.owned,
    equipped: wardrobe.equipped,
    usedClothes: wardrobe.usedClothes,
    toggleEquip,
    getEquippedEffects,
    getEquippedSkin,
    getEquippedCatSkin,
    getProposeArmed,
    getWeddingArmed,
    markProposeEndingCleared,
    earnCoins,
    pullGacha,
  }
}
