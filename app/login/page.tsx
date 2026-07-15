import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/dashboard");
}

async function signUp(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: { data: { username: String(formData.get("email")).split("@")[0] } },
  });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  // if email confirmation is ON, the user must confirm before signing in
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-8 text-4xl font-black">Вход организатора</h1>
      <form className="space-y-3">
        <input name="email" type="email" required placeholder="e-mail"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <input name="password" type="password" required placeholder="пароль"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button formAction={signIn}
            className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold hover:bg-violet-500">Войти</button>
          <button formAction={signUp}
            className="flex-1 rounded-xl bg-slate-800 py-3 font-semibold ring-1 ring-slate-700 hover:bg-slate-700">Регистрация</button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Участник? <a href="/play" className="text-violet-400">Присоединиться по коду</a>
      </p>
    </main>
  );
}
