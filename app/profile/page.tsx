import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    redirect('/login');
  }

  const database = getDatabase();
  try {
    const user = database
      .prepare('SELECT id, username, email, role, createdAt FROM User WHERE id = ? LIMIT 1')
      .get(session.userId) as
      | { id: number; username: string; email: string; role: string; createdAt: string }
      | undefined;

    if (!user) {
      redirect('/login');
    }

    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-sm space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-2xl font-semibold text-center">Profile</p>
          <p><span className="font-medium">Username:</span> {user.username}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Role:</span> {user.role}</p>
        </div>
      </section>
    );
  } finally {
    database.close();
  }
}
