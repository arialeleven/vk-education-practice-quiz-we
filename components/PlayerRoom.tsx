"use client";
import { useEffect, useMemo, useState } from "react";
import { usePartyGame } from "./usePartyGame";
import { TimerRing } from "./TimerRing";
import { Leaderboard } from "./Leaderboard";
import { TILES } from "@/lib/game";

// Player screen. Can answer only while the server keeps the window open.
export function PlayerRoom({ code, name, userId }: {
  code: string; name: string; userId?: string;
}) {
  const { state, send } = usePartyGame(code);
  const [pending, setPending] = useState<number[]>([]);

  useEffect(() => {
    const t = setTimeout(() => send({ type: "join", name, userId }), 400);
    return () => clearTimeout(t);
  }, [name, userId]); // eslint-disable-line

  useEffect(() => setPending([]), [state?.qIndex]);

  const me = useMemo(
    () => state?.players.find((p) => p.name === name),
    [state, name]
  );

  if (!state) return <Center>Подключение…</Center>;
  const q = state.question;
  const isMulti = q?.type === "multiple";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span className="font-semibold text-slate-300">{name}</span>
        <span>{me?.score ?? 0} очк.</span>
      </div>

      {state.phase === "lobby" && (
        <Center><div className="text-2xl font-bold">Вы в игре ✓</div>
          <p className="mt-2 text-slate-400">Ждём, пока ведущий начнёт…</p></Center>
      )}

      {state.phase === "question" && q && (
        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <TimerRing questionStart={state.questionStart} timeLimit={q.timeLimit} small />
            {isMulti && <span className="text-xs text-amber-400">Выберите все верные</span>}
          </div>
          <h2 className="mb-4 text-2xl font-black">{q.text}</h2>
          {q.imageUrl && <img src={q.imageUrl} alt="" className="mb-4 max-h-40 rounded-xl" />}

          {state.youAnswered ? (
            <Center><div className="text-4xl">🔒</div>
              <div className="mt-3 text-lg font-semibold">Ответ принят</div>
              <p className="mt-1 text-slate-400">Ждём остальных…</p></Center>
          ) : (
            <div className="mt-auto grid gap-3">
              {q.options.map((o, i) => {
                const chosen = pending.includes(i);
                return (
                  <button key={i}
                    onClick={() => isMulti
                      ? setPending((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i])
                      : send({ type: "answer", choice: [i] })}
                    className={`flex items-center gap-4 rounded-2xl ${TILES[i].bg} ${TILES[i].text} px-5 py-6 text-left active:scale-[0.98] ${isMulti && chosen ? "ring-4 ring-white/70" : ""}`}>
                    <span className="text-3xl">{isMulti && chosen ? "✓" : TILES[i].shape}</span>
                    <span className="text-lg font-bold">{o}</span>
                  </button>
                );
              })}
              {isMulti && (
                <button onClick={() => send({ type: "answer", choice: [...pending].sort((a, b) => a - b) })}
                  disabled={!pending.length}
                  className="mt-1 rounded-xl bg-slate-800 py-3 font-semibold ring-1 ring-slate-700 disabled:opacity-40">
                  Ответить
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {state.phase === "reveal" && (
        <Center>
          <div className="text-6xl">🎯</div>
          <div className="mt-4 text-2xl font-black">Разбор вопроса</div>
          <div className="mt-2 text-slate-400">Всего: {me?.score ?? 0} очк.</div>
        </Center>
      )}

      {state.phase === "final" && (
        <div className="flex flex-1 flex-col justify-center">
          <h2 className="mb-6 text-center text-3xl font-black">Итоги</h2>
          <Leaderboard players={state.players} highlightId={me?.id} />
          <a href="/" className="mt-8 rounded-xl bg-slate-800 py-3 text-center font-semibold ring-1 ring-slate-700 hover:bg-slate-700">
            На главную
          </a>
        </div>
      )}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">{children}</div>;
}
