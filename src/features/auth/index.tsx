import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50">
      <Card className="w-full max-w-md md:max-w-lg mx-auto shadow-xl">
        <CardContent className="p-8 space-y-6 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Bienvenido a CitApp</h1>
            <p className="text-gray-600 text-base leading-relaxed">
              Descubre planes increíbles y conecta con tus amigos para crear momentos especiales juntos.
            </p>
          </div>
          <Button 
            onClick={signIn} 
            className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
          >
            Iniciar sesión con Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}