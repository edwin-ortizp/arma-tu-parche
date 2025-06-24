import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Upload, Trash2, Edit, Settings, Save, X } from 'lucide-react'

interface DatePlan {
  id: string
  title: string
  description: string
  category: string
  duration: string
  cost: string
  image: string
  active: boolean
  bgGradient: string
  goodForToday: boolean
  city?: string
}

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
}

export default function Config() {
  const [form, setForm] = useState(initialState)
  const [allowed, setAllowed] = useState(false)
  const [view, setView] = useState<'list' | 'create' | 'import'>('list')
  const [plans, setPlans] = useState<DatePlan[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [jsonInput, setJsonInput] = useState('')

  useEffect(() => {
    const check = async () => {
      const uid = auth.currentUser?.uid
      if (!uid) return
      const snap = await getDoc(doc(db, 'users', uid))
      const isAdmin = snap.data()?.role === 'admin'
      setAllowed(isAdmin)
      
      if (isAdmin) {
        loadPlans()
      }
    }
    check()
  }, [])

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
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateDoc(doc(db, 'dates', editingId), form)
        alert('Plan actualizado')
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'dates'), {
          ...form,
          userId: auth.currentUser?.uid,
        })
        alert('Plan creado')
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
      duration: plan.duration,
      cost: plan.cost,
      image: plan.image,
      active: plan.active,
      bgGradient: plan.bgGradient,
      goodForToday: plan.goodForToday,
    })
    setEditingId(plan.id)
    setView('create')
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        await deleteDoc(doc(db, 'dates', id))
        alert('Plan eliminado')
        loadPlans()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar el plan')
      }
    }
  }

  const handleImportJson = async () => {
    try {
      const plansData = JSON.parse(jsonInput)
      if (!Array.isArray(plansData)) {
        alert('El JSON debe ser un array de planes')
        return
      }

      for (const plan of plansData) {
        await addDoc(collection(db, 'dates'), {
          ...plan,
          userId: auth.currentUser?.uid,
        })
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
      <div className="px-6 py-4 w-full max-w-sm mx-auto">
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
    <div className="px-6 py-4 space-y-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6 shadow-lg">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Administración</h1>
        <p className="text-gray-600 text-lg">Gestiona los planes de la aplicación</p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2">
        <Button
          onClick={() => setView('list')}
          variant={view === 'list' ? 'default' : 'outline'}
          className="flex-1"
        >
          Lista
        </Button>
        <Button
          onClick={() => {setView('create'); setForm(initialState); setEditingId(null)}}
          variant={view === 'create' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-1" />
          Crear
        </Button>
        <Button
          onClick={() => setView('import')}
          variant={view === 'import' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-1" />
          Importar
        </Button>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Planes Existentes</h2>
            <Badge className="bg-indigo-100 text-indigo-700">
              {plans.length} planes
            </Badge>
          </div>
          
          {plans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No hay planes creados aún</p>
              </CardContent>
            </Card>
          ) : (
            plans.map(plan => (
              <Card key={plan.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{plan.image}</div>
                      <div>
                        <h3 className="font-bold text-lg">{plan.title}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEdit(plan)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(plan.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{plan.category}</Badge>
                    <Badge variant="outline">{plan.duration}</Badge>
                    <Badge variant="outline">{plan.cost}</Badge>
                    {plan.active && <Badge className="bg-green-100 text-green-700">Activo</Badge>}
                    {plan.goodForToday && <Badge className="bg-blue-100 text-blue-700">Hoy</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit View */}
      {view === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Plan' : 'Nuevo Plan'}
            </h2>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(initialState)
                  setEditingId(null)
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
          
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
          <Input 
            name="category" 
            placeholder="Categoría" 
            value={form.category} 
            onChange={handleChange} 
            className="h-12" 
            required 
          />
          <Input 
            name="duration" 
            placeholder="Duración (ej: 2 horas)" 
            value={form.duration} 
            onChange={handleChange} 
            className="h-12" 
            required 
          />
          <Input 
            name="cost" 
            placeholder="Costo (ej: $20)" 
            value={form.cost} 
            onChange={handleChange} 
            className="h-12" 
            required 
          />
          <Input 
            name="image" 
            placeholder="Emoji o URL de imagen" 
            value={form.image} 
            onChange={handleChange} 
            className="h-12" 
            required 
          />
          <Input 
            name="city" 
            placeholder="Ciudad (opcional)" 
            value={form.city} 
            onChange={handleChange} 
            className="h-12" 
          />
          <Input 
            name="bgGradient" 
            placeholder="Gradiente CSS (ej: from-blue-500 to-purple-500)" 
            value={form.bgGradient} 
            onChange={handleChange} 
            className="h-12" 
          />
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-base">
              <input 
                type="checkbox" 
                name="active" 
                checked={form.active} 
                onChange={handleChange} 
                className="w-4 h-4" 
              />
              <span>Plan activo</span>
            </label>
            <label className="flex items-center space-x-3 text-base">
              <input 
                type="checkbox" 
                name="goodForToday" 
                checked={form.goodForToday} 
                onChange={handleChange} 
                className="w-4 h-4" 
              />
              <span>Recomendado para hoy</span>
            </label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-4 text-lg font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            {editingId ? 'Actualizar Plan' : 'Crear Plan'}
          </Button>
        </form>
      )}

      {/* Import View */}
      {view === 'import' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Importar desde JSON</h2>
          <p className="text-sm text-gray-600">
            Pega un JSON con un array de planes. Ejemplo:
          </p>
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <pre className="text-xs text-gray-700 overflow-x-auto">
{`[
  {
    "title": "Cine",
    "description": "Ver una película",
    "category": "entretenimiento",
    "duration": "2 horas",
    "cost": "$15",
    "image": "🎬",
    "active": true,
    "bgGradient": "from-blue-500 to-purple-500",
    "goodForToday": false,
    "city": "Madrid"
  }
]`}
              </pre>
            </CardContent>
          </Card>
          
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Pega aquí el JSON con los planes..."
            className="min-h-32 font-mono text-sm"
          />
          
          <Button
            onClick={handleImportJson}
            disabled={!jsonInput.trim()}
            className="w-full py-4 text-lg font-semibold"
          >
            <Upload className="w-5 h-5 mr-2" />
            Importar Planes
          </Button>
        </div>
      )}
    </div>
  )
}
