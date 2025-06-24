import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from '@/firebase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const initialState = {
  title: '',
  description: '',
  category: '',
  duration: '',
  cost: '',
  image: '',
  active: true,
  bgGradient: '',
  goodForToday: false,
}

export default function Config() {
  const [form, setForm] = useState(initialState)

  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(console.error)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'dates'), {
        ...form,
        userId: auth.currentUser?.uid,
      })
      setForm(initialState)
      alert('Plan creado')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold text-center">Nuevo Plan</h2>
      <Input name="title" placeholder="Título" value={form.title} onChange={handleChange} />
      <Textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
      <Input name="category" placeholder="Categoría" value={form.category} onChange={handleChange} />
      <Input name="duration" placeholder="Duración" value={form.duration} onChange={handleChange} />
      <Input name="cost" placeholder="Costo" value={form.cost} onChange={handleChange} />
      <Input name="image" placeholder="Emoji o URL" value={form.image} onChange={handleChange} />
      <Input name="bgGradient" placeholder="Gradiente" value={form.bgGradient} onChange={handleChange} />
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
        <span>Activo</span>
      </label>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="goodForToday" checked={form.goodForToday} onChange={handleChange} />
        <span>Bueno para hoy</span>
      </label>
      <button className="w-full py-2 bg-indigo-500 text-white rounded" type="submit">Guardar</button>
    </form>
  )
}
