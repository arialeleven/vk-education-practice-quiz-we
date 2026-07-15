import { createClient } from "@/lib/supabase/server";
import { PlayJoin } from "@/components/PlayJoin";

export default async function PlayPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  return (
    <PlayJoin
      initialName={user?.email?.split("@")[0]}
      userId={user?.id}
    />
  );
}
