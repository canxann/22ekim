"use client"

import { useEffect, useState } from "react"

function getNextBirthday() {
  const now = new Date()
  const year = now.getFullYear()
  // 22 October
  let target = new Date(year, 9, 22, 0, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target = new Date(year + 1, 9, 22, 0, 0, 0)
  }
  return target
}

function diff(target: Date) {
  const total = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((total / (1000 * 60)) % 60)
  const seconds = Math.floor((total / 1000) % 60)
  return { days, hours, minutes, seconds }
}

const pad = (n: number) => String(n).padStart(2, "0")

export function Countdown({ size = "sm" }: { size?: "sm" | "lg" }) {
  const [target] = useState(getNextBirthday)
  const [time, setTime] = useState(() => diff(target))

  useEffect(() => {
    const id = setInterval(() => setTime(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const items = [
    { label: "Gün", value: time.days },
    { label: "Saat", value: time.hours },
    { label: "Dakika", value: time.minutes },
    { label: "Saniye", value: time.seconds },
  ]

  const large = size === "lg"

  return (
    <div className="flex flex-col items-center">
      {large && (
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.35em] text-emerald-300/80">
          22 Ekim
        </p>
      )}
      <div className={large ? "flex gap-3 sm:gap-5" : "flex gap-2"}>
        {items.map((it) => (
          <div
            key={it.label}
            className="flex flex-col items-center rounded-2xl border border-emerald-400/20 bg-emerald-950/30 backdrop-blur-sm"
            style={{
              padding: large ? "14px 10px" : "6px 8px",
              minWidth: large ? 68 : 46,
              boxShadow: large
                ? "0 0 30px rgba(16,185,129,0.25), inset 0 0 20px rgba(16,185,129,0.08)"
                : "0 0 14px rgba(16,185,129,0.15)",
            }}
          >
            <span
              className="font-semibold tabular-nums text-emerald-100"
              style={{
                fontSize: large ? "clamp(28px, 9vw, 52px)" : "18px",
                lineHeight: 1,
                textShadow: "0 0 12px rgba(52,211,153,0.7)",
              }}
            >
              {pad(it.value)}
            </span>
            <span
              className="mt-1 uppercase tracking-widest text-emerald-300/70"
              style={{ fontSize: large ? "11px" : "8px" }}
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
