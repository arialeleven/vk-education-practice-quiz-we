"use client";
import { useEffect } from "react";
import { usePartyGame } from "./usePartyGame";
import { TimerRing } from "./TimerRing";
import { Leaderboard } from "./Leaderboard";
import { TILES, type Quiz } from "@/lib/game";

// Host ("ведущий") screen. Sends control messages; the server owns the timing.
export function HostRoom({ code, hostId, quiz, quizId }: {
  code: string; hostId: string; quiz: Quiz; quizId?: string;
}) {
  const { state, send } = usePartyGame(code);

  // load the quiz into the room once connected
  useEffect(() => {
    const t = setTimeout(() => send({ type: "host_init", hostId, quiz, quizId }), 400);
    return () => clearTimeout(t);
  }, [hostId, quiz, quizId]); // eslint-disable-line

  if (!state) return <Center>Подключение к комнате…</Center>;
  const q = state.question;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 text-center text-sm text-slate-500">
        {state.quizTitle} · вопрос {Math.max(0, state.qIndex + 1)}/{state.total}
      </div>

      {state.phase === "lobby" && (
        <div className="text-center">
          <div className="mb-2 text-sm uppercase tracking-[0.3em] text-slate-500">код комнаты</div>
          <div className="mb-8 font-mono text-8xl font-black tracking-widest text-violet-400">{code}</div>
          <div className="mb-8 flex min-h-16 flex-wrap justify-center gap-2">
            {state.players.length === 0 && <span className="text-slate-600">пока никого…</span>}
            {state.players.map((p) => (
              <span key={p.id} className="rounded-full bg-slate-800 px-4 py-2 ring-1 ring-slate-700">{p.name}</span>
            ))}
          </div>
          <button onClick={() => send({ type: "start", hostId })}
            disabled={state.players.length === 0}
            className="rounded-2xl bg-violet-600 px-12 py-5 text-lg font-bold hover:bg-violet-500 disabled:opacity-40">
            Начать · {state.players.length} игр.
          </button>
        </div>
      )}

      {state.phase === "question" && q && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <TimerRing questionStart={state.questionStart} timeLimit={q.timeLimit} />
            <div className="text-right">
              <div className="text-5xl font-black">{state.answeredCount}</div>
              <div className="text-sm text-slate-500">ответили из {state.players.length}</div>
            </div>
          </div>
          <h2 className="mb-6 text-center text-4xl font-black">{q.text}</h2>
          {q.imageUrl && <img src={q.imageUrl} alt="" className="mx-auto mb-6 max-h-56 rounded-xl" />}
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => (
              <div key={i} className={`flex items-center gap-4 rounded-2xl ${TILES[i].bg} ${TILES[i].text} px-5 py-6`}>
                <span className="text-3xl">{TILES[i].shape}</span>
                <span className="text-xl font-bold">{o}</span>
              </div>
            ))}
          </div>
          <button onClick={() => send({ type: "reveal", hostId })}
            className="mt-6 w-full rounded-xl bg-slate-800 py-3 text-sm text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700">
            Показать ответ сейчас
          </button>
        </div>
      )}

      {state.phase === "reveal" && q && (
        <div>
          <h2 className="mb-6 text-center text-3xl font-black">{q.text}</h2>
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const right = state.correct?.includes(i);
              return (
                <div key={i} className={`flex items-center gap-4 rounded-2xl px-5 py-5 ${
                  right ? `${TILES[i].bg} ${TILES[i].text}` : "bg-slate-800 text-slate-500"}`}>
                  <span className="text-2xl">{right ? "✓" : TILES[i].shape}</span>
                  <span className="text-lg font-bold">{o}</span>
                </div>
              );
            })}
          </div>
          <Leaderboard players={state.players.slice(0, 5)} />
          <button onClick={() => send({ type: "next", hostId })}
            className="mt-6 w-full rounded-2xl bg-violet-600 py-5 text-lg font-bold hover:bg-violet-500">
            {state.qIndex + 1 < state.total ? "Следующий вопрос →" : "Итоги игры →"}
          </button>
        </div>
      )}

      {state.phase === "final" && (
        <div className="text-center">
          <div className="mb-2 text-sm uppercase tracking-[0.3em] text-violet-400">игра окончена</div>
          <h2 className="mb-8 text-5xl font-black">Лидерборд</h2>
          <Leaderboard players={state.players} />
          <a href="/dashboard" className="mt-10 inline-block rounded-xl bg-slate-800 px-8 py-3 font-semibold ring-1 ring-slate-700 hover:bg-slate-700">
            В кабинет
          </a>
        </div>
      )}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[60vh] items-center justify-center text-slate-400">{children}</div>;
}
