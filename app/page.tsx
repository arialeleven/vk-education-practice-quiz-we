import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
        квиз в реальном времени
      </div>
      <p className="mb-10 max-w-md text-lg text-slate-400">
        Организатор собирает квиз и запускает комнату. Участники заходят по коду и
        отвечают синхронно — кто вернее и быстрее, тот и в топе.
      </p>
      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <Link href={user ? "/dashboard" : "/login"}
          className="rounded-2xl bg-violet-600 px-6 py-8 text-left hover:bg-violet-500">
          <div className="text-2xl font-bold">Провести квиз</div>
          <div className="mt-1 text-sm text-violet-200">Кабинет организатора</div>
        </Link>
        <Link href="/play"
          className="rounded-2xl bg-slate-800 px-6 py-8 text-left ring-1 ring-slate-700 hover:bg-slate-700">
          <div className="text-2xl font-bold">Присоединиться</div>
          <div className="mt-1 text-sm text-slate-400">Ввести код комнаты</div>
        </Link>
      </div>
      {user && (
        <p className="mt-8 text-sm text-slate-500">Вы вошли как {user.email}</p>
      )}
    </main>
  );
}
