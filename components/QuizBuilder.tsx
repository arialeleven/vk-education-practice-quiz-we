"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TILES, type Question } from "@/lib/game";

const blank = (): Question => ({ text: "", imageUrl: "", type: "single", options: ["", "", "", ""], correct: [], timeLimit: 20 });

export function QuizBuilder() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draft, setDraft] = useState<Question>(blank());
  const [saving, setSaving] = useState(false);

  const toggleCorrect = (i: number) =>
    setDraft((d) => ({ ...d, correct: d.correct.includes(i) ? d.correct.filter((x) => x !== i) : [...d.correct, i] }));

  const canAdd = draft.text.trim() && draft.options.filter((o) => o.trim()).length >= 2 && draft.correct.length >= 1;

  const addQuestion = () => {
    const opts = draft.options.map((o) => o.trim());
    const keep = [0, 1, 2, 3].filter((i) => opts[i]);
    setQuestions((qs) => [...qs, {
      ...draft,
      options: keep.map((i) => opts[i]),
      correct: draft.correct.map((i) => keep.indexOf(i)).filter((x) => x >= 0),
      type: draft.correct.length > 1 ? "multiple" : "single",
    }]);
    setDraft(blank());
  };

  const save = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { router.push("/login"); return; }
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({ owner: uid, title: title.trim() || "Квиз без названия", category: category.trim() || null })
      .select().single();
    if (error || !quiz) { alert("Ошибка сохранения: " + error?.message); setSaving(false); return; }
    const rows = questions.map((q, i) => ({
      quiz_id: quiz.id, position: i, text: q.text, image_url: q.imageUrl || null,
      type: q.type, options: q.options, correct: q.correct, time_limit: q.timeLimit,
    }));
    await supabase.from("questions").insert(rows);
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-black">Новый квиз</h1>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название"
          className="rounded-xl bg-slate-900 px-4 py-3 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Категория (необязательно)"
          className="rounded-xl bg-slate-900 px-4 py-3 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>

      {questions.length > 0 && (
        <ol className="mb-6 space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 ring-1 ring-slate-800">
              <span className="mt-0.5 text-sm font-bold text-violet-400">{i + 1}</span>
              <div className="flex-1">
                <div className="font-medium">{q.text}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {q.options.length} вар. · {q.type === "multiple" ? "множественный" : "одиночный"} · {q.timeLimit}с{q.imageUrl ? " · картинка" : ""}
                </div>
              </div>
              <button onClick={() => setQuestions((qs) => qs.filter((_, x) => x !== i))} className="text-slate-600 hover:text-rose-400">✕</button>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
        <div className="mb-3 text-sm font-semibold text-slate-400">Добавить вопрос</div>
        <textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          placeholder="Текст вопроса" rows={2}
          className="mb-3 w-full resize-none rounded-lg bg-slate-950 px-4 py-3 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
          placeholder="URL картинки (необязательно)"
          className="mb-3 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {draft.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => toggleCorrect(i)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${draft.correct.includes(i) ? `${TILES[i].bg} ${TILES[i].text}` : "bg-slate-800 text-slate-500"}`}>
                {draft.correct.includes(i) ? "✓" : TILES[i].shape}
              </button>
              <input value={o} onChange={(e) => { const opts = [...draft.options]; opts[i] = e.target.value; setDraft({ ...draft, options: opts }); }}
                placeholder={`Вариант ${i + 1}`}
                className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          ))}
        </div>
        <div className="mb-4 flex items-center gap-3 text-sm text-slate-400">
          <span>Время:</span>
          <input type="range" min={10} max={40} step={5} value={draft.timeLimit}
            onChange={(e) => setDraft({ ...draft, timeLimit: Number(e.target.value) })} className="flex-1 accent-violet-500" />
          <span className="w-10 text-right font-mono font-bold text-slate-200">{draft.timeLimit}с</span>
        </div>
        <button onClick={addQuestion} disabled={!canAdd}
          className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-semibold ring-1 ring-slate-700 enabled:hover:bg-slate-700 disabled:opacity-40">
          Добавить вопрос
        </button>
      </div>

      <button onClick={save} disabled={questions.length === 0 || saving}
        className="mt-6 w-full rounded-2xl bg-violet-600 py-5 text-lg font-bold hover:bg-violet-500 disabled:opacity-40">
        {saving ? "Сохранение…" : `Сохранить квиз · ${questions.length} вопр.`}
      </button>
    </div>
  );
}
