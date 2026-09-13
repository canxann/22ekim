"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Countdown } from "./countdown"

type Stage =
  | "password"
  | "growing"
  | "extinguish"
  | "filling"
  | "bigheart"
  | "hunt"
  | "letter"
  | "reassemble"
  | "final"

const HEART_PATH =
  "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"

const PASSWORD = "55"

// positions as % of the tree scene box, placed among the canopy branches
const LIGHTS = [
  { x: 23, y: 40 },
  { x: 35, y: 30 },
  { x: 50, y: 24 },
  { x: 65, y: 30 },
  { x: 77, y: 40 },
  { x: 31, y: 52 },
  { x: 69, y: 52 },
]

const HEARTS = [
  { x: 33, y: 32, s: 26 },
  { x: 50, y: 26, s: 30 },
  { x: 67, y: 32, s: 26 },
  { x: 24, y: 42, s: 24 },
  { x: 41, y: 38, s: 22 },
  { x: 59, y: 38, s: 22 },
  { x: 76, y: 42, s: 24 },
  { x: 30, y: 53, s: 22 },
  { x: 46, y: 48, s: 20 },
  { x: 55, y: 49, s: 20 },
  { x: 70, y: 54, s: 22 },
  { x: 50, y: 58, s: 24 },
]

type Particle = { id: number; tx: number; ty: number; color: string; size: number }

function makeBurst(count: number, spread: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.6
    const d = spread * (0.5 + Math.random() * 0.5)
    return {
      id: i + Math.random(),
      tx: Math.cos(a) * d,
      ty: Math.sin(a) * d,
      color: Math.random() > 0.5 ? "#34d399" : Math.random() > 0.5 ? "#a7f3d0" : "#fde68a",
      size: 4 + Math.random() * 5,
    }
  })
}

function Burst({ particles, duration = 900 }: { particles: Particle[]; duration?: number }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-0 top-0 rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 10px ${p.color}`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animation: `bd-particle ${duration}ms ease-out forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

// realistic warm flame sitting on a branch tip
function Flame({ scale = 1 }: { scale?: number }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden style={{ transform: `scale(${scale})` }}>
      {/* outer glow */}
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 26,
          height: 26,
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, rgba(255,180,70,0.55), transparent 70%)",
          filter: "blur(2px)",
          animation: "bd-flame-core 1.3s ease-in-out infinite",
        }}
      />
      {/* flame body */}
      <span
        className="absolute left-1/2 top-1/2"
        style={{
          width: 13,
          height: 20,
          background: "radial-gradient(ellipse at 50% 75%, #fff6cc 0%, #ffcf4d 35%, #ff8a1e 70%, #ff5a1e 100%)",
          borderRadius: "50% 50% 50% 50% / 62% 62% 40% 40%",
          boxShadow: "0 0 16px 5px rgba(255,150,50,0.7)",
          animation: "bd-flame 0.9s ease-in-out infinite",
        }}
      />
      {/* bright core */}
      <span
        className="absolute left-1/2 top-1/2"
        style={{
          width: 5,
          height: 10,
          background: "radial-gradient(ellipse at 50% 70%, #ffffff, #fff2b0 60%, transparent 100%)",
          borderRadius: "50%",
          transform: "translate(-50%,-45%)",
          animation: "bd-flame-core 0.9s ease-in-out infinite",
        }}
      />
      {/* rising embers */}
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={
          {
            width: 3,
            height: 3,
            background: "#ffd27a",
            boxShadow: "0 0 6px #ffb04a",
            "--ex": "5px",
            animation: "bd-ember 1.6s ease-out infinite",
          } as React.CSSProperties
        }
      />
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={
          {
            width: 2,
            height: 2,
            background: "#ffe0a0",
            boxShadow: "0 0 5px #ffb04a",
            "--ex": "-7px",
            animation: "bd-ember 2.1s ease-out 0.5s infinite",
          } as React.CSSProperties
        }
      />
    </span>
  )
}

// glowing heart with depth + glossy highlight
function GlowHeart({
  size,
  fill = "url(#heartGrad)",
  glow = "rgba(52,211,153,0.85)",
  style,
}: {
  size: number
  fill?: string
  glow?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size * 0.925}
      viewBox="0 0 32 29.6"
      style={{ filter: `drop-shadow(0 0 ${size * 0.16}px ${glow})`, ...style }}
      aria-hidden
    >
      <path d={HEART_PATH} fill={fill} />
      <ellipse cx="10.5" cy="8" rx="4.2" ry="3" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="21" cy="6.5" rx="1.6" ry="1.1" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

export function Experience() {
  const [stage, setStage] = useState<Stage>("password")
  const [pw, setPw] = useState("")
  const [pwError, setPwError] = useState(false)

  const [litLights, setLitLights] = useState<boolean[]>(() => LIGHTS.map(() => true))
  const [lightBursts, setLightBursts] = useState<Record<number, Particle[]>>({})

  const [heartTaps, setHeartTaps] = useState(0)
  const [bigHeartBurst, setBigHeartBurst] = useState<Particle[] | null>(null)

  const [poppedHearts, setPoppedHearts] = useState<boolean[]>(() => HEARTS.map(() => false))
  const [heartBursts, setHeartBursts] = useState<Record<number, Particle[]>>({})

  const [letterOpen, setLetterOpen] = useState(false)
  const [finalBurst, setFinalBurst] = useState<Particle[] | null>(null)
  const [fadingOut, setFadingOut] = useState(false)

  // random atmosphere only renders after mount to avoid SSR hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const converge = useMemo(() => makeBurst(30, 160), [])
  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 60,
        size: 1 + Math.random() * 1.8,
        delay: Math.random() * 4,
        dur: 2.5 + Math.random() * 3,
      })),
    [],
  )

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.trim() === PASSWORD) {
      setPwError(false)
      setStage("growing")
      after(2400, () => setStage("extinguish"))
    } else {
      setPwError(true)
    }
  }

  const extinguish = (i: number) => {
    if (!litLights[i]) return
    setLitLights((prev) => {
      const next = [...prev]
      next[i] = false
      return next
    })
    setLightBursts((prev) => ({ ...prev, [i]: makeBurst(10, 40) }))
    after(900, () =>
      setLightBursts((prev) => {
        const n = { ...prev }
        delete n[i]
        return n
      }),
    )
    const remaining = litLights.filter((v, idx) => v && idx !== i).length
    if (remaining === 0) {
      after(700, () => {
        setStage("filling")
        after(2200, () => setStage("bigheart"))
      })
    }
  }

  const tapBigHeart = () => {
    const next = heartTaps + 1
    setHeartTaps(next)
    if (next >= 5) {
      setBigHeartBurst(makeBurst(46, 200))
      after(150, () => setStage("hunt"))
    }
  }

  const popHeart = (i: number) => {
    if (poppedHearts[i]) return
    setPoppedHearts((prev) => {
      const next = [...prev]
      next[i] = true
      return next
    })
    setHeartBursts((prev) => ({ ...prev, [i]: makeBurst(12, 55) }))
    after(900, () =>
      setHeartBursts((prev) => {
        const n = { ...prev }
        delete n[i]
        return n
      }),
    )
    const remaining = poppedHearts.filter((v, idx) => !v && idx !== i).length
    if (remaining === 0) {
      after(700, () => setStage("letter"))
    }
  }

  const openLetter = () => {
    if (letterOpen) return
    setLetterOpen(true)
  }

  const startFinal = () => {
    setStage("reassemble")
    after(2200, () => {
      setFinalBurst(makeBurst(80, 340))
      after(400, () => setFadingOut(true))
      after(1600, () => {
        setStage("final")
        setFadingOut(false)
        setFinalBurst(null)
      })
    })
  }

  const showTree = true
  const showHearts = stage === "filling" || stage === "bigheart" || stage === "hunt"
  const showBigHeart = stage === "bigheart"
  const showAtmosphere = stage !== "final"

  return (
    <main
      className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-black text-white"
      style={{ touchAction: "manipulation" }}
    >
      {/* persistent gradient defs (available on every stage) */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <radialGradient id="heartGrad" cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
          <radialGradient id="heartGradLight" cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="55%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </radialGradient>
          <radialGradient id="bigHeartGrad" cx="35%" cy="25%" r="85%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>
        </defs>
      </svg>

      {/* ===== Atmosphere: dark teal gradient + stars fill the space around the scene ===== */}
      {showAtmosphere && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 8%, #0c2c33 0%, #071c22 45%, #030b0e 100%)",
            }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {mounted &&
              stars.map((s) => (
                <span
                  key={s.id}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${s.left}%`,
                    top: `${s.top}%`,
                    width: s.size,
                    height: s.size,
                    boxShadow: "0 0 6px rgba(255,255,255,0.8)",
                    animation: `bd-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
                  }}
                />
              ))}
          </div>
        </>
      )}

      {/* Top compact countdown during the story */}
      {stage !== "password" && stage !== "final" && (
        <div
          className="relative z-20 w-full pt-[max(14px,env(safe-area-inset-top))]"
          style={{ animation: fadingOut ? "bd-fade-out 1s ease forwards" : undefined }}
        >
          <div className="flex justify-center px-4">
            <Countdown size="sm" />
          </div>
        </div>
      )}

      {/* ===== PASSWORD ===== */}
      {stage === "password" && (
        <div className="relative z-20 flex min-h-[100dvh] w-full items-center justify-center px-6">
          <form
            onSubmit={submitPassword}
            className="flex w-full max-w-xs flex-col items-center gap-5 rounded-[28px] border border-emerald-400/25 bg-black/40 p-8 backdrop-blur-xl"
            style={{ animation: "bd-fade-in 0.8s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(16,185,129,0.16)" }}
          >
            <div style={{ animation: "bd-heartbeat 1.5s ease-in-out infinite" }}>
              <GlowHeart size={56} glow="rgba(16,185,129,0.9)" />
            </div>
            <p
              className="text-center text-2xl text-emerald-100"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Sana özel bir sürpriz
            </p>
            <p className="text-center text-[11px] uppercase tracking-[0.35em] text-emerald-300/70">
              Devam etmek için şifreyi gir
            </p>
            <input
              value={pw}
              onChange={(e) => {
                setPw(e.target.value)
                setPwError(false)
              }}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              placeholder="••"
              aria-label="Şifre"
              className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-950/40 px-4 py-4 text-center text-4xl tracking-[0.4em] text-emerald-50 outline-none transition focus:border-emerald-400/70"
              style={{
                fontFamily: "var(--font-playfair)",
                boxShadow: "inset 0 2px 12px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.15)",
              }}
            />
            {pwError && <p className="text-sm text-rose-300">Yanlış şifre, tekrar dene.</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-b from-emerald-300 to-emerald-600 py-3.5 text-base font-semibold text-emerald-950 transition active:scale-95"
              style={{ boxShadow: "0 8px 24px rgba(16,185,129,0.4)" }}
            >
              Aç
            </button>
          </form>
        </div>
      )}

      {/* ===== STORY STAGES ===== */}
      {stage !== "password" && stage !== "final" && (
        <div
          className="relative z-10 flex w-full flex-1 flex-col items-center"
          style={{ animation: fadingOut ? "bd-fade-out 1.4s ease forwards" : undefined }}
        >
          {/* instruction text */}
          <div className="relative z-20 min-h-[52px] px-6 pt-3 text-center">
            {stage === "extinguish" && (
              <p
                className="text-xl text-emerald-100"
                style={{ fontFamily: "var(--font-cormorant)", textShadow: "0 0 14px rgba(52,211,153,0.5)", animation: "bd-rise 0.6s ease" }}
              >
                Betül, yanan dalları tek tek söndür
              </p>
            )}
            {stage === "filling" && (
              <p className="text-xl text-emerald-100" style={{ fontFamily: "var(--font-cormorant)", animation: "bd-rise 0.6s ease" }}>
                Ağaç yeniden canlanıyor...
              </p>
            )}
            {stage === "bigheart" && (
              <p className="text-xl text-emerald-100" style={{ fontFamily: "var(--font-cormorant)", animation: "bd-rise 0.6s ease" }}>
                Ortadaki kalbe dokun ve kır ({heartTaps}/5)
              </p>
            )}
            {stage === "hunt" && (
              <p className="text-xl text-emerald-100" style={{ fontFamily: "var(--font-cormorant)", animation: "bd-rise 0.6s ease" }}>
                Tüm kalpleri patlat ({poppedHearts.filter(Boolean).length}/{HEARTS.length})
              </p>
            )}
          </div>

          {/* Tree scene box — square, centered, overlays anchored to it */}
          <div className="relative flex w-full flex-1 items-end justify-center">
            <div
              className="relative aspect-square w-full"
              style={{ maxWidth: "min(100vw, 74vh)" }}
            >
              {/* tree image */}
              {showTree && (
                <img
                  src="/images/tree-scene.png"
                  alt="Yıldızlı gökyüzü altında ay ışığında duran büyük ağaç"
                  className="absolute inset-0 h-full w-full select-none object-contain"
                  style={{
                    transformOrigin: "50% 90%",
                    animation: "bd-tree-grow 2.2s cubic-bezier(0.22,1,0.36,1) forwards, bd-sway 8s ease-in-out 2.2s infinite",
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
                  }}
                  draggable={false}
                />
              )}

              {/* Lights (burning branch tips) */}
              {(stage === "growing" || stage === "extinguish" || stage === "filling") &&
                LIGHTS.map((l, i) => {
                  if (!litLights[i]) {
                    return lightBursts[i] ? (
                      <div key={i} className="absolute" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
                        <Burst particles={lightBursts[i]} />
                      </div>
                    ) : null
                  }
                  const tappable = stage === "extinguish"
                  return (
                    <div key={i} className="absolute" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
                      {tappable ? (
                        <button
                          type="button"
                          onClick={() => extinguish(i)}
                          aria-label={`Dalı söndür ${i + 1}`}
                          className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full active:scale-90"
                          style={{ width: 56, height: 56, background: "transparent", border: "none" }}
                        >
                          <Flame />
                        </button>
                      ) : (
                        <Flame />
                      )}
                    </div>
                  )
                })}

              {/* Small hearts on branches */}
              {showHearts &&
                HEARTS.map((h, i) => {
                  const canPop = stage === "hunt"
                  const gone = poppedHearts[i]
                  return (
                    <div key={i} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                      {!gone && (
                        <button
                          type="button"
                          disabled={!canPop}
                          onClick={() => canPop && popHeart(i)}
                          aria-label={`Kalbi patlat ${i + 1}`}
                          className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                          style={{
                            width: 52,
                            height: 52,
                            background: "transparent",
                            border: "none",
                            cursor: canPop ? "pointer" : "default",
                            animation: "bd-float-in 0.5s ease both",
                            animationDelay: `${i * 0.07}s`,
                          }}
                        >
                          <div
                            style={{
                              animation: `bd-heartbeat ${1.6 + (i % 4) * 0.25}s ease-in-out infinite`,
                              animationDelay: `${i * 0.12}s`,
                            }}
                          >
                            <GlowHeart size={h.s} fill={i % 3 === 0 ? "url(#heartGradLight)" : "url(#heartGrad)"} />
                          </div>
                        </button>
                      )}
                      {heartBursts[i] && (
                        <div className="absolute left-1/2 top-1/2">
                          <Burst particles={heartBursts[i]} />
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* Big heart */}
              {showBigHeart && (
                <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={tapBigHeart}
                    aria-label="Büyük kalbe dokun"
                    className="relative grid place-items-center active:scale-95"
                    style={{
                      width: 150,
                      height: 150,
                      background: "transparent",
                      border: "none",
                      animation: heartTaps > 0 ? "bd-shake 0.4s ease" : "bd-heartbeat 1.4s ease-in-out infinite",
                    }}
                    key={heartTaps}
                  >
                    <svg
                      width="132"
                      height="122"
                      viewBox="0 0 32 29.6"
                      style={{ filter: "drop-shadow(0 0 28px rgba(16,185,129,0.85))" }}
                    >
                      <path d={HEART_PATH} fill="url(#bigHeartGrad)" />
                      <ellipse cx="10.5" cy="7.5" rx="5" ry="3.4" fill="rgba(255,255,255,0.45)" />
                      {heartTaps >= 1 && <path d="M16,5 L14,12 L17,15 L15,22" stroke="#022c22" strokeWidth="0.9" fill="none" />}
                      {heartTaps >= 2 && <path d="M16,5 L20,11 L18,16 L21,21" stroke="#022c22" strokeWidth="0.9" fill="none" />}
                      {heartTaps >= 3 && <path d="M9,9 L13,14 L11,19" stroke="#022c22" strokeWidth="0.9" fill="none" />}
                      {heartTaps >= 4 && <path d="M23,9 L19,15 L22,20" stroke="#022c22" strokeWidth="0.9" fill="none" />}
                    </svg>
                  </button>
                  {bigHeartBurst && <Burst particles={bigHeartBurst} duration={1100} />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== LETTER ===== */}
      {stage === "letter" && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm">
          {!letterOpen ? (
            <button
              type="button"
              onClick={openLetter}
              className="flex flex-col items-center gap-5 active:scale-95"
              style={{ animation: "bd-rise 0.7s ease" }}
            >
              <div
                className="relative overflow-hidden rounded-md"
                style={{
                  width: 232,
                  height: 156,
                  background: "linear-gradient(135deg,#f6ecd6,#e7d7b4)",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
                }}
              >
                {/* envelope body seams */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(35deg, transparent 49.5%, rgba(0,0,0,0.12) 50%, transparent 50.5%), linear-gradient(-35deg, transparent 49.5%, rgba(0,0,0,0.12) 50%, transparent 50.5%)",
                  }}
                />
                {/* flap */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0"
                  style={{
                    height: 0,
                    borderLeft: "116px solid transparent",
                    borderRight: "116px solid transparent",
                    borderTop: "80px solid #ecdcbb",
                  }}
                />
                {/* wax seal */}
                <div
                  className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                  style={{
                    width: 52,
                    height: 52,
                    background: "radial-gradient(circle at 35% 30%, #34d399, #065f46)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.45), inset 0 2px 6px rgba(255,255,255,0.3)",
                    animation: "bd-heartbeat 1.6s ease-in-out infinite",
                  }}
                >
                  <GlowHeart size={26} glow="rgba(0,0,0,0)" fill="rgba(255,255,255,0.9)" />
                </div>
              </div>
              <p className="text-lg text-emerald-100" style={{ fontFamily: "var(--font-cormorant)" }}>
                Mektuba dokun
              </p>
            </button>
          ) : (
            <div
              className="relative w-full max-w-md overflow-hidden rounded-[14px] p-8"
              style={{
                background: "linear-gradient(180deg,#fbf4e2 0%,#f4e8cd 100%)",
                boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
                transformOrigin: "top center",
                animation: "bd-letter-open 0.9s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {/* subtle paper edges */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[14px]"
                style={{ boxShadow: "inset 0 0 0 1px rgba(120,90,40,0.25), inset 0 0 40px rgba(150,110,50,0.12)" }}
              />
              <div className="relative">
                <p
                  className="text-center text-3xl text-emerald-800"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Sevgili Betül
                </p>
                <div className="mx-auto my-4 flex items-center justify-center gap-3">
                  <span className="h-px w-12 bg-emerald-800/30" />
                  <GlowHeart size={18} glow="rgba(0,0,0,0)" />
                  <span className="h-px w-12 bg-emerald-800/30" />
                </div>
                <p
                  className="text-pretty text-center text-[17px] leading-relaxed text-stone-700"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Belki birden fazla kişiyle konuşuyorsun, belki gelip geçiciyiz ama unutma doğum günün kutlu olsun.
                  Doğum günü zamanında hala konuşuyor olursak sana bol bol süprizim olur merak etme dostum.
                </p>
                <button
                  type="button"
                  onClick={startFinal}
                  className="mt-7 w-full rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 py-3 font-semibold text-white transition active:scale-95"
                  style={{ boxShadow: "0 10px 24px rgba(6,95,70,0.4)" }}
                >
                  Devam et
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== REASSEMBLE + final explosion ===== */}
      {stage === "reassemble" && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-black"
          style={{ animation: fadingOut ? "bd-fade-out 1.4s ease forwards" : "bd-fade-in 0.6s ease" }}
        >
          <div className="relative grid place-items-center">
            {!finalBurst && (
              <>
                <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
                  {converge.map((p) => (
                    <span
                      key={p.id}
                      className="absolute left-0 top-0 rounded-full"
                      style={
                        {
                          width: p.size,
                          height: p.size,
                          background: p.color,
                          boxShadow: `0 0 8px ${p.color}`,
                          "--tx": `${p.tx}px`,
                          "--ty": `${p.ty}px`,
                          animation: "bd-converge 1.6s ease-in forwards",
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
                <div
                  style={{
                    animation: "bd-fade-in 1.7s ease forwards, bd-heartbeat 1.4s ease-in-out 1.7s infinite",
                    opacity: 0,
                  }}
                >
                  <GlowHeart size={150} fill="url(#bigHeartGrad)" glow="rgba(16,185,129,0.9)" />
                </div>
              </>
            )}
            {finalBurst && <Burst particles={finalBurst} duration={1500} />}
          </div>
        </div>
      )}

      {/* ===== FINAL: only countdown ===== */}
      {stage === "final" && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black px-6" style={{ animation: "bd-fade-in 1.4s ease" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.16), transparent 60%)" }}
          />
          <div className="relative">
            <Countdown size="lg" />
          </div>
        </div>
      )}
    </main>
  )
}
