import type { PublicPlayer } from "@/lib/game";

export function Leaderboard({ players, highlightId }: {
  players: PublicPlayer[]; highlightId?: string;
}) {
  if (!players.length) return <div className="text-center text-slate-500">Пока нет очков</div>;
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <ol className="mx-auto max-w-md space-y-2">
      {players.map((p, i) => (
        <li key={p.id}
          className={`flex items-center gap-4 rounded-xl px-5 py-3 ${
            p.id === highlightId ? "bg-violet-600"
              : i < 3 ? "bg-slate-800 ring-1 ring-slate-700" : "bg-slate-900 ring-1 ring-slate-800"}`}>
          <span className="w-8 text-center text-xl font-black">{medals[i] ?? i + 1}</span>
          <span className="flex-1 text-left text-lg font-bold">{p.name}</span>
          <span className="font-mono text-lg font-bold text-violet-300">{p.score}</span>
        </li>
      ))}
    </ol>
  );
}
