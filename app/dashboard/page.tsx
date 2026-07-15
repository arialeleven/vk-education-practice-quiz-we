import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { genRoomCode } from "@/lib/game";

async function startSession(formData: FormData) {
  "use server";
  const quizId = String(formData.get("quizId"));
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) redirect("/login");
  const { data: session, error } = await supabase
    .from("game_sessions")
    .insert({ quiz_id: quizId, host: uid, code: genRoomCode(), status: "lobby" })
    .select().single();
  if (error || !session) redirect("/dashboard?error=session");
  redirect(`/host/${session.id}`);
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: quizzes } = await supabase
    .from("quizzes").select("id, title, category, created_at")
    .order("created_at", { ascending: false });

  // history: sessions I hosted + games I played
  const { data: hosted } = await supabase
    .from("game_sessions").select("id, code, status, started_at, quizzes(title)")
    .eq("host", user.id).order("started_at", { ascending: false }).limit(10);
  const { data: played } = await supabase
    .from("session_players").select("name, score, game_sessions(code, started_at)")
    .eq("user_id", user.id).order("id", { ascending: false }).limit(10);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black">Кабинет</h1>
        <Link href="/quiz/new" className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500">
          + Новый квиз
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Мои квизы</h2>
        {!quizzes?.length && <p className="text-slate-500">Пока нет квизов. Создайте первый.</p>}
        <div className="space-y-2">
          {quizzes?.map((q) => (
            <div key={q.id} className="flex items-center gap-4 rounded-xl bg-slate-900 px-5 py-4 ring-1 ring-slate-800">
              <div className="flex-1">
                <div className="font-bold">{q.title}</div>
                {q.category && <div className="text-xs text-slate-500">{q.category}</div>}
              </div>
              <form action={startSession}>
                <input type="hidden" name="quizId" value={q.id} />
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500">
                  Запустить →
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Проведённые</h2>
          {!hosted?.length && <p className="text-slate-600 text-sm">—</p>}
          <ul className="space-y-1 text-sm">
            {hosted?.map((s: any) => (
              <li key={s.id} className="flex justify-between rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-slate-800">
                <span>{s.quizzes?.title ?? "Квиз"} · {s.code}</span>
                <span className="text-slate-500">{new Date(s.started_at).toLocaleDateString("ru")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Участие</h2>
          {!played?.length && <p className="text-slate-600 text-sm">—</p>}
          <ul className="space-y-1 text-sm">
            {played?.map((p: any, i: number) => (
              <li key={i} className="flex justify-between rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-slate-800">
                <span>{p.game_sessions?.code ?? "—"}</span>
                <span className="font-mono text-violet-300">{p.score} очк.</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
