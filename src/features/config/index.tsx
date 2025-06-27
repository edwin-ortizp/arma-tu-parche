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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Upload, Trash2, Edit, Settings, Save, X } from 'lucide-react'
import {
  categories as planCategories,
  relationTypes,
  experienceTypes,
} from '@/constants'
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
  relationType: [] as string[],
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')
  const [filterToday, setFilterToday] = useState<string>('all')

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

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMultiSelectChange = (name: string, value: string) => {
    setForm(prev => {
      const currentValues = prev[name as keyof typeof prev] as string[]
      const newValues = currentValues.includes(value) 
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      return {
        ...prev,
        [name]: newValues
      }
    })
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
      relationType: Array.isArray(plan.relationType) ? plan.relationType : (plan.relationType ? [plan.relationType] : []),
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

  // Función para filtrar planes
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || plan.category === filterCategory
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && plan.active) ||
                         (filterActive === 'inactive' && !plan.active)
    const matchesToday = filterToday === 'all' ||
                        (filterToday === 'today' && plan.goodForToday) ||
                        (filterToday === 'not-today' && !plan.goodForToday)
    
    return matchesSearch && matchesCategory && matchesActive && matchesToday
  })

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
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Gestiona los planes y configuraciones de la aplicación"
        icon={<Settings className="w-5 h-5 text-white" />}
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
        <div className="space-y-6">
          {/* Filtros y búsqueda */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <Input
                      placeholder="🔍 Buscar por título, descripción o categoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {planCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterActive} onValueChange={setFilterActive}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterToday} onValueChange={setFilterToday}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Para hoy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="today">Buenos para hoy</SelectItem>
                      <SelectItem value="not-today">No para hoy</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || filterCategory !== 'all' || filterActive !== 'all' || filterToday !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('')
                        setFilterCategory('all')
                        setFilterActive('all')
                        setFilterToday('all')
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  Mostrando {filteredPlans.length} de {plans.length} planes
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de planes filtrada */}
          <div className="grid gap-3">
            {filteredPlans.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron planes</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterCategory !== 'all' || filterActive !== 'all' || filterToday !== 'all'
                      ? 'Intenta ajustar los filtros o crear un nuevo plan'
                      : 'Crea tu primer plan para comenzar'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPlans.map(plan => (
                <Card key={plan.id} className={`transition-all hover:shadow-md ${!plan.active ? 'opacity-75' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl flex-shrink-0">{plan.image}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate">{plan.title}</h3>
                            {plan.goodForToday && (
                              <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                🔥 HOY
                              </span>
                            )}
                            {!plan.active && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                Inactivo
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{plan.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {plan.category}
                      </Badge>
                      {plan.relationType && (
                        Array.isArray(plan.relationType) 
                          ? plan.relationType.map(type => (
                              <Badge key={type} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                {type}
                              </Badge>
                            ))
                          : <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{plan.relationType}</Badge>
                      )}
                      {plan.experienceType && (
                        <Badge variant="outline" className="text-xs">
                          {plan.experienceType}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        ⏱️ {plan.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        💰 {plan.cost}
                      </Badge>
                      {plan.city && (
                        <Badge variant="outline" className="text-xs">
                          📍 {plan.city}
                        </Badge>
                      )}
                      {plan.expiresAt && (
                        <Badge variant="outline" className="text-xs">
                          ⏰ {plan.expiresAt}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'create' && (
        <Card>
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {editingId ? 'Editar Plan' : 'Crear Nuevo Plan'}
              </h2>
              <p className="text-gray-600">
                {editingId ? 'Modifica los detalles del plan existente' : 'Completa la información para crear un nuevo plan'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    📝 Información Básica
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-gray-700">Título</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input 
                          name="title" 
                          placeholder="Ej: Noche de karaoke" 
                          value={form.title} 
                          onChange={handleChange} 
                          className={`h-12 ${!form.title ? 'border-red-200 focus:border-red-500' : ''}`}
                          required 
                        />
                        {!form.title && (
                          <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-gray-700">Emoji</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input 
                          name="image" 
                          placeholder="🎤" 
                          value={form.image} 
                          onChange={handleChange} 
                          className={`h-12 text-center text-2xl ${!form.image ? 'border-red-200 focus:border-red-500' : ''}`}
                          required 
                        />
                        {!form.image && (
                          <p className="text-xs text-red-500 mt-1">Selecciona un emoji</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <span className="text-gray-700">Descripción</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Textarea 
                        name="description" 
                        placeholder="Describe qué incluye este plan, qué se va a hacer, dónde..." 
                        value={form.description} 
                        onChange={handleChange} 
                        className={`min-h-24 ${!form.description ? 'border-red-200 focus:border-red-500' : ''}`}
                        required 
                      />
                      {!form.description && (
                        <p className="text-xs text-red-500 mt-1">Describe el plan detalladamente</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categorización */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    🏷️ Categorización
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-gray-700">Categoría</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Select 
                          value={form.category} 
                          onValueChange={(value) => handleSelectChange('category', value)}
                        >
                          <SelectTrigger className={`h-12 ${!form.category ? 'border-red-200' : ''}`}>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {planCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!form.category && (
                          <p className="text-xs text-red-500 mt-1">Selecciona una categoría</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-gray-700">Tipo de experiencia</span>
                          <span className="text-gray-400 ml-1">(opcional)</span>
                        </label>
                        <Select 
                          value={form.experienceType} 
                          onValueChange={(value) => handleSelectChange('experienceType', value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Tipo de experiencia" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">
                        <span className="text-gray-700">¿Para qué tipo de relaciones es este plan?</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {relationTypes.map(type => (
                          <label 
                            key={type} 
                            className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                              form.relationType.includes(type)
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={form.relationType.includes(type)}
                              onChange={() => handleMultiSelectChange('relationType', type)}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                      {form.relationType.length === 0 && (
                        <p className="text-xs text-red-500 mt-2">⚠️ Selecciona al menos un tipo de relación</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalles Prácticos */}
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    💰 Detalles Prácticos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <span className="text-gray-700">Duración</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input 
                        name="duration" 
                        placeholder="2 horas" 
                        value={form.duration} 
                        onChange={handleChange} 
                        className={`h-12 ${!form.duration ? 'border-red-200 focus:border-red-500' : ''}`}
                        required 
                      />
                      {!form.duration && (
                        <p className="text-xs text-red-500 mt-1">Indica la duración</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <span className="text-gray-700">Costo</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input 
                        name="cost" 
                        placeholder="$50,000 o Gratis" 
                        value={form.cost} 
                        onChange={handleChange} 
                        className={`h-12 ${!form.cost ? 'border-red-200 focus:border-red-500' : ''}`}
                        required 
                      />
                      {!form.cost && (
                        <p className="text-xs text-red-500 mt-1">Indica el costo</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <span className="text-gray-700">Ciudad</span>
                        <span className="text-gray-400 ml-1">(opcional)</span>
                      </label>
                      <Input 
                        name="city" 
                        placeholder="Bogotá" 
                        value={form.city} 
                        onChange={handleChange} 
                        className="h-12" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración Avanzada */}
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    ⚙️ Configuración Avanzada
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-gray-700">Gradiente CSS</span>
                          <span className="text-gray-400 ml-1">(opcional)</span>
                        </label>
                        <Input 
                          name="bgGradient" 
                          placeholder="from-blue-500 to-purple-600" 
                          value={form.bgGradient} 
                          onChange={handleChange} 
                          className="h-12 font-mono text-sm" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Para personalizar el fondo de la tarjeta</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-gray-700">Fecha de expiración</span>
                          <span className="text-gray-400 ml-1">(opcional)</span>
                        </label>
                        <Input 
                          name="expiresAt" 
                          type="date"
                          value={form.expiresAt} 
                          onChange={handleChange} 
                          className="h-12" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Cuándo deja de estar disponible</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 pt-4">
                      <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input 
                          type="checkbox" 
                          name="active" 
                          checked={form.active} 
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Plan activo</span>
                          <p className="text-xs text-gray-500">Se muestra a los usuarios</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input 
                          type="checkbox" 
                          name="goodForToday" 
                          checked={form.goodForToday} 
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Bueno para hoy</span>
                          <p className="text-xs text-gray-500">Se puede hacer hoy mismo</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base"
                  disabled={!form.title || !form.description || !form.image || !form.category || !form.duration || !form.cost || form.relationType.length === 0}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {editingId ? 'Actualizar Plan' : 'Crear Plan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 px-8"
                  onClick={() => {
                    setView('list')
                    setForm(initialState)
                    setEditingId(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
              
              {(!form.title || !form.description || !form.image || !form.category || !form.duration || !form.cost || form.relationType.length === 0) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Completa todos los campos obligatorios</strong> para crear el plan
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {view === 'import' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📥 Importar Planes desde JSON
                </h2>
                <p className="text-gray-600">
                  Importa múltiples planes de una vez pegando un array JSON con la estructura correcta.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pega tu JSON aquí:
                  </label>
                  <Textarea
                    placeholder='Pega aquí tu array JSON con los planes...'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="min-h-64 font-mono text-sm"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleImport} 
                    className="flex-1 h-12 text-base"
                    disabled={!jsonInput.trim()}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Importar Planes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 px-8"
                    onClick={() => {
                      setView('list')
                      setJsonInput('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ejemplo JSON */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📋 Ejemplo de JSON para copiar
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Copia este ejemplo y modifícalo con tus planes:
              </p>
              
              <div className="relative">
                <pre className="bg-gray-50 border rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`[
  {
    "title": "Noche de karaoke",
    "description": "Una noche divertida cantando tus canciones favoritas con amigos",
    "category": "eventos",
    "relationType": ["amigos", "pareja"],
    "experienceType": "cultural",
    "duration": "3 horas",
    "cost": "$30,000",
    "city": "Bogotá",
    "image": "🎤",
    "active": true,
    "bgGradient": "from-pink-500 to-purple-600",
    "goodForToday": true,
    "expiresAt": ""
  },
  {
    "title": "Caminata en el parque",
    "description": "Una caminata relajante por los senderos del parque nacional",
    "category": "actividades al aire libre",
    "relationType": ["solo", "pareja", "amigos", "familia"],
    "experienceType": "aventura",
    "duration": "2 horas",
    "cost": "Gratis",
    "city": "Medellín",
    "image": "🚶‍♀️",
    "active": true,
    "bgGradient": "from-green-500 to-blue-500",
    "goodForToday": false,
    "expiresAt": ""
  },
  {
    "title": "Cena romántica",
    "description": "Una cena íntima en un restaurante con vista a la ciudad",
    "category": "eventos",
    "relationType": ["pareja"],
    "experienceType": "romántico",
    "duration": "2.5 horas",
    "cost": "$120,000",
    "city": "Cartagena",
    "image": "🍽️",
    "active": true,
    "bgGradient": "from-red-500 to-pink-500",
    "goodForToday": true,
    "expiresAt": "2024-12-31"
  }
]`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`[
  {
    "title": "Noche de karaoke",
    "description": "Una noche divertida cantando tus canciones favoritas con amigos",
    "category": "eventos",
    "relationType": ["amigos", "pareja"],
    "experienceType": "cultural",
    "duration": "3 horas",
    "cost": "$30,000",
    "city": "Bogotá",
    "image": "🎤",
    "active": true,
    "bgGradient": "from-pink-500 to-purple-600",
    "goodForToday": true,
    "expiresAt": ""
  },
  {
    "title": "Caminata en el parque",
    "description": "Una caminata relajante por los senderos del parque nacional",
    "category": "actividades al aire libre",
    "relationType": ["solo", "pareja", "amigos", "familia"],
    "experienceType": "aventura",
    "duration": "2 horas",
    "cost": "Gratis",
    "city": "Medellín",
    "image": "🚶‍♀️",
    "active": true,
    "bgGradient": "from-green-500 to-blue-500",
    "goodForToday": false,
    "expiresAt": ""
  },
  {
    "title": "Cena romántica",
    "description": "Una cena íntima en un restaurante con vista a la ciudad",
    "category": "eventos",
    "relationType": ["pareja"],
    "experienceType": "romántico",
    "duration": "2.5 horas",
    "cost": "$120,000",
    "city": "Cartagena",
    "image": "🍽️",
    "active": true,
    "bgGradient": "from-red-500 to-pink-500",
    "goodForToday": true,
    "expiresAt": "2024-12-31"
  }
]`)
                    alert('¡Ejemplo copiado al portapapeles!')
                  }}
                >
                  📋 Copiar
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📝 Notas importantes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>relationType</strong> debe ser un array de strings (ej: ["solo", "pareja"])</li>
                  <li>• <strong>category</strong> debe ser uno de: eventos, museos, actividades al aire libre</li>
                  <li>• <strong>experienceType</strong> debe ser uno de: romántico, cultural, aventura, gastronómico</li>
                  <li>• Los campos <strong>title, description, category, duration, cost, image</strong> son obligatorios</li>
                  <li>• <strong>active</strong> y <strong>goodForToday</strong> son booleanos (true/false)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}