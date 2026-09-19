import {useEffect, useState} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';

import {auth, googleProvider} from './firebase/firebase';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const login = async () => {
    setError('');
    setSigningIn(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Signed in:', result.user.email);
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      setError(`${err.code ?? 'Unknown error'}: ${err.message ?? err}`);
    } finally {
      setSigningIn(false);
    }
  };

  if (!user) {
    return (
      <main style={{padding: 40}}>
        <h1>Curio Admin</h1>

        <button onClick={login} disabled={signingIn}>
          {signingIn ? 'Signing in...' : 'Sign in with Google'}
        </button>

        {error && (
          <pre
            style={{
              marginTop: 20,
              padding: 16,
              background: '#eee',
              whiteSpace: 'pre-wrap',
            }}>
            {error}
          </pre>
        )}
      </main>
    );
  }

  return (
    <main style={{padding: 40}}>
      <h1>Curio Admin</h1>

      <p>Signed in as {user.email}</p>

      <p>
        Your UID: <strong>{user.uid}</strong>
      </p>

      <button onClick={() => signOut(auth)}>Sign out</button>
    </main>
  );
}

export default App;
