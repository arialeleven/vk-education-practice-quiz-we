"use client";
import { useState } from "react";
import { PlayerRoom } from "./PlayerRoom";

export function PlayJoin({ initialName, userId }: { initialName?: string; userId?: string }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(initialName ?? "");
  const [joined, setJoined] = useState(false);

  if (joined) return <PlayerRoom code={code} name={name.trim() || "Игрок"} userId={userId} />;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-8 text-4xl font-black">Вход в комнату</h1>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        placeholder="КОД" maxLength={4}
        className="mb-4 w-full rounded-xl bg-slate-900 px-5 py-4 text-center font-mono text-4xl font-black tracking-widest ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
      <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="Ваше имя"
        className="mb-4 w-full rounded-xl bg-slate-900 px-5 py-4 text-lg ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
      <button onClick={() => setJoined(true)} disabled={code.length < 4 || !name.trim()}
        className="rounded-xl bg-violet-600 py-4 text-lg font-bold hover:bg-violet-500 disabled:opacity-40">
        Войти
      </button>
    </main>
  );
}
