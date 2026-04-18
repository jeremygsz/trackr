import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Trackr</h1>
      <p>Vous n'êtes pas connecté. <a href="/login">Se connecter</a></p>
    </main>
  );
}
