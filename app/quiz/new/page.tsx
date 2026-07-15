import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizBuilder } from "@/components/QuizBuilder";

export default async function NewQuizPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return <QuizBuilder />;
}
