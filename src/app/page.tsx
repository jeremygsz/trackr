import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Trackr</h1>
      {session ? (
        <div>
          <p>Bienvenue, {session.user.firstname} {session.user.lastname} !</p>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
      ) : (
        <p>Vous n'êtes pas connecté. <a href="/login">Se connecter</a></p>
      )}
    </main>
  );
}
