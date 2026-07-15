"use client";
import { useEffect, useState } from "react";

export function TimerRing({ questionStart, timeLimit, small }: {
  questionStart: number; timeLimit: number; small?: boolean;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);
  const remain = Math.max(0, Math.ceil((questionStart + timeLimit * 1000 - now) / 1000));
  const size = small ? 56 : 96, stroke = small ? 6 : 9;
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const frac = timeLimit > 0 ? Math.max(0, remain / timeLimit) : 0;
  const danger = remain <= 5;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-slate-800" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
          className={danger ? "stroke-rose-500" : "stroke-violet-500"}
          style={{ transition: "stroke-dashoffset .3s linear" }} />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-black ${small ? "text-lg" : "text-3xl"} ${danger ? "text-rose-400" : ""}`}>
        {remain}
      </div>
    </div>
  );
}
