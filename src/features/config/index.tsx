import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  categories as planCategories,
  relationTypes,
  experienceTypes,
} from '@/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Upload, Trash2, Edit, Settings, Save, X } from 'lucide-react'
import LoginPage from '@/features/auth'
import { PageHeader } from '@/components/PageHeader'
import type { DatePlan } from '@/types'

const initialState = {
  title: '',
  description: '',
  city: '',
  category: '',
  duration: '',
  cost: '',
  image: '',
  active: true,
  bgGradient: '',
  goodForToday: false,
  relationType: '',
  experienceType: '',
  expiresAt: '',
}

export default function ConfigPage() {
  const user = auth.currentUser
  const [form, setForm] = useState(initialState)
  const [allowed, setAllowed] = useState(false)
  const [view, setView] = useState<'list' | 'create' | 'import'>('list')
  const [plans, setPlans] = useState<DatePlan[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [jsonInput, setJsonInput] = useState('')

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser
      if (!user) return
      
      const snap = await getDoc(doc(db, 'users', user.uid))
      const isAdmin = snap.data()?.role === 'admin'
      setAllowed(isAdmin)
      
      if (isAdmin) {
        loadPlans()
      }
    }
    check()
  }, [])

  if (!user) return <LoginPage />

  const loadPlans = async () => {
    try {
      const snap = await getDocs(collection(db, 'dates'))
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<DatePlan, 'id'>) }))
      setPlans(items)
    } catch (err) {
      console.error('Error al cargar planes:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateDoc(doc(db, 'dates', editingId), form)
        alert('Plan actualizado exitosamente')
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'dates'), form)
        alert('Plan creado exitosamente')
      }
      setForm(initialState)
      setView('list')
      loadPlans()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el plan')
    }
  }

  const handleEdit = (plan: DatePlan) => {
    setForm({
      title: plan.title,
      description: plan.description,
      city: plan.city || '',
      category: plan.category,
      relationType: plan.relationType || '',
      experienceType: plan.experienceType || '',
      duration: plan.duration,
      cost: plan.cost,
      image: plan.image,
      active: plan.active,
      bgGradient: plan.bgGradient,
      goodForToday: plan.goodForToday,
      expiresAt: plan.expiresAt || '',
    })
    setEditingId(plan.id)
    setView('create')
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        await deleteDoc(doc(db, 'dates', id))
        alert('Plan eliminado exitosamente')
        loadPlans()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar el plan')
      }
    }
  }

  const handleImport = async () => {
    try {
      const plansData = JSON.parse(jsonInput)
      if (!Array.isArray(plansData)) {
        alert('El JSON debe ser un array de planes')
        return
      }
      
      for (const plan of plansData) {
        await addDoc(collection(db, 'dates'), plan)
      }
      
      alert(`${plansData.length} planes importados exitosamente`)
      setJsonInput('')
      setView('list')
      loadPlans()
    } catch (err) {
      console.error(err)
      alert('Error al importar JSON. Verifica el formato.')
    }
  }

  if (!allowed) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="text-center py-10">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
            <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Gestiona los planes y configuraciones de la aplicación"
        icon={<Settings className="w-8 h-8 md:w-10 md:h-10 text-white" />}
        badge={{
          text: `${plans.length} planes`,
          className: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
        }}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setView('create')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </Button>
            <Button onClick={() => setView('import')} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        }
      />

      {view === 'list' && (
        <div className="grid gap-4">
          {plans.map(plan => (
            <Card key={plan.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{plan.image}</div>
                    <div>
                      <h3 className="font-bold text-xl">{plan.title}</h3>
                      <p className="text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{plan.category}</Badge>
                  {plan.relationType && <Badge variant="outline">{plan.relationType}</Badge>}
                  {plan.experienceType && <Badge variant="outline">{plan.experienceType}</Badge>}
                  <Badge variant="outline">{plan.duration}</Badge>
                  <Badge variant="outline">{plan.cost}</Badge>
                  {plan.active && <Badge className="bg-green-100 text-green-700">Activo</Badge>}
                  {plan.goodForToday && <Badge className="bg-blue-100 text-blue-700">Hoy</Badge>}
                  {plan.expiresAt && <Badge variant="outline">Hasta {plan.expiresAt}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === 'create' && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                name="title" 
                placeholder="Título" 
                value={form.title} 
                onChange={handleChange} 
                className="h-12" 
                required 
              />
              <Textarea 
                name="description" 
                placeholder="Descripción" 
                value={form.description} 
                onChange={handleChange} 
                className="min-h-24" 
                required 
              />
              {/* ... more form fields ... */}
              
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Actualizar' : 'Crear'} Plan
                </Button>
                <Button type="button" variant="outline" onClick={() => setView('list')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}