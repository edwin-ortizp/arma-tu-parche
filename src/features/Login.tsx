import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/firebase'

export default function Login() {
  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={signIn}
      >
        Iniciar sesión con Google
      </button>
    </div>
  )
}
