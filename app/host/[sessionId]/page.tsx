import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HostRoom } from "@/components/HostRoom";
import type { Quiz } from "@/lib/game";

export default async function HostPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("game_sessions").select("id, code, host, quiz_id").eq("id", sessionId).single();
  if (!session || session.host !== user.id) redirect("/dashboard");

  const { data: quizRow } = await supabase.from("quizzes").select("title").eq("id", session.quiz_id).single();
  const { data: questions } = await supabase
    .from("questions").select("*").eq("quiz_id", session.quiz_id).order("position");

  const quiz: Quiz = {
    title: quizRow?.title ?? "Квиз",
    questions: (questions ?? []).map((q: any) => ({
      text: q.text, imageUrl: q.image_url ?? undefined, type: q.type,
      options: q.options, correct: q.correct, timeLimit: q.time_limit,
    })),
  };

  return <HostRoom code={session.code} hostId={user.id} quiz={quiz} quizId={session.quiz_id} />;
}
