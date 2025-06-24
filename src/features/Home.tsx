/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Heart, X, Settings, Users, Sparkles, Calendar, MapPin, Clock, Plus, List, Zap, Archive, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CouplePlansTinder = () => {
  const [currentUser, setCurrentUser] = useState('person1');
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [person1Likes, setPerson1Likes] = useState(new Set());
  const [person2Likes, setPerson2Likes] = useState(new Set());
  const [matches, setMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showMatch, setShowMatch] = useState(null);
  const [person1Name, setPerson1Name] = useState('Persona 1');
  const [person2Name, setPerson2Name] = useState('Persona 2');
  const [currentMode, setCurrentMode] = useState('today'); // 'today' o 'explore'
  const [showPlanHistory, setShowPlanHistory] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  
  const [plans, setPlans] = useState([
    { 
      id: 1, 
      title: "Cena romántica en casa", 
      description: "Cocinar juntos una cena especial con velas y música suave", 
      category: "Romántico", 
      time: "2-3 horas", 
      cost: "💰",
      image: "🕯️",
      bgColor: "from-red-400 to-pink-500",
      goodForToday: true
    },
    { 
      id: 2, 
      title: "Caminata en el parque", 
      description: "Pasear por el parque, hacer picnic y disfrutar la naturaleza", 
      category: "Al aire libre", 
      time: "1-2 horas", 
      cost: "Gratis",
      image: "🌳",
      bgColor: "from-green-400 to-emerald-500",
      goodForToday: true
    },
    { 
      id: 3, 
      title: "Noche de juegos", 
      description: "Jugar videojuegos, juegos de mesa o cartas hasta tarde", 
      category: "En casa", 
      time: "2-4 horas", 
      cost: "Gratis",
      image: "🎮",
      bgColor: "from-blue-400 to-indigo-500",
      goodForToday: true
    },
    { 
      id: 4, 
      title: "Ir al cine", 
      description: "Ver una película nueva en el cine con palomitas", 
      category: "Salida", 
      time: "3 horas", 
      cost: "💰💰",
      image: "🎬",
      bgColor: "from-purple-400 to-violet-500",
      goodForToday: false
    },
    { 
      id: 5, 
      title: "Clase de baile", 
      description: "Aprender salsa, bachata o cualquier ritmo que les guste", 
      category: "Actividad", 
      time: "1-2 horas", 
      cost: "💰💰",
      image: "💃",
      bgColor: "from-yellow-400 to-orange-500",
      goodForToday: false
    },
    { 
      id: 6, 
      title: "Maratón de series", 
      description: "Ver una temporada completa con snacks y bebidas", 
      category: "En casa", 
      time: "4+ horas", 
      cost: "Gratis",
      image: "📺",
      bgColor: "from-gray-400 to-slate-500",
      goodForToday: true
    },
    { 
      id: 7, 
      title: "Mercado local", 
      description: "Explorar el mercado, probar comidas y comprar ingredientes", 
      category: "Aventura", 
      time: "2-3 horas", 
      cost: "💰",
      image: "🛒",
      bgColor: "from-teal-400 to-cyan-500",
      goodForToday: false
    },
    { 
      id: 8, 
      title: "Sesión de fotos", 
      description: "Tomar fotos divertidas y creativas en lugares bonitos", 
      category: "Creativo", 
      time: "1-2 horas", 
      cost: "Gratis",
      image: "📸",
      bgColor: "from-pink-400 to-rose-500",
      goodForToday: true
    },
    { 
      id: 9, 
      title: "Spa en casa", 
      description: "Masajes, mascarillas y relajación total en casa", 
      category: "Romántico", 
      time: "2-3 horas", 
      cost: "💰",
      image: "🛁",
      bgColor: "from-purple-300 to-pink-400",
      goodForToday: true
    },
    { 
      id: 10, 
      title: "Karaoke", 
      description: "Cantar sus canciones favoritas y reírse juntos", 
      category: "Diversión", 
      time: "2-3 horas", 
      cost: "💰💰",
      image: "🎤",
      bgColor: "from-red-400 to-orange-500",
      goodForToday: false
    }
  ]);
  
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    category: 'Romántico',
    time: '1-2 horas',
    cost: 'Gratis',
    image: '💕',
    bgColor: 'from-pink-400 to-purple-500',
    goodForToday: true
  });

  const categories = ["Romántico", "Al aire libre", "En casa", "Salida", "Actividad", "Aventura", "Creativo", "Diversión"];
  const timeOptions = ["30 min", "1-2 horas", "2-3 horas", "3-4 horas", "4+ horas"];
  const costOptions = ["Gratis", "💰", "💰💰", "💰💰💰"];
  const emojiOptions = ["💕", "🌳", "🏠", "🎬", "🎯", "🗺️", "🎨", "🎉", "🕯️", "🎮", "📺", "🛒", "📸", "🛁", "🎤", "🍕", "☕", "🎪", "🏖️", "🎭"];
  const colorOptions = [
    "from-pink-400 to-purple-500",
    "from-red-400 to-pink-500", 
    "from-green-400 to-emerald-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-violet-500",
    "from-yellow-400 to-orange-500",
    "from-teal-400 to-cyan-500",
    "from-gray-400 to-slate-500"
  ];

  const getAvailablePlans = () => {
    let filteredPlans = currentMode === 'today' 
      ? plans.filter(plan => plan.goodForToday)
      : plans;
    
    const currentUserSeen = new Set();
    const currentUserLikes = currentUser === 'person1' ? person1Likes : person2Likes;
    
    currentUserLikes.forEach(index => currentUserSeen.add(index));
    
    return filteredPlans.filter((plan, originalIndex) => {
      const planIndexInOriginalArray = plans.findIndex(p => p.id === plan.id);
      return !currentUserSeen.has(planIndexInOriginalArray);
    });
  };

  const getCurrentPlan = () => {
    const availablePlans = getAvailablePlans();
    if (availablePlans.length === 0) return null;
    
    const currentIndex = currentPlanIndex % availablePlans.length;
    return availablePlans[currentIndex];
  };

  const handleSwipe = (liked) => {
    const plan = getCurrentPlan();
    if (!plan) return;
    
    const planIndex = plans.findIndex(p => p.id === plan.id);
    
    if (currentUser === 'person1') {
      if (liked) {
        const newLikes = new Set([...person1Likes, planIndex]);
        setPerson1Likes(newLikes);
        
        if (person2Likes.has(planIndex)) {
          const newMatch = { ...plan, matchedAt: new Date(), mode: currentMode };
          if (currentMode === 'today') {
            setTodayMatches(prev => [...prev, newMatch]);
          } else {
            setMatches(prev => [...prev, newMatch]);
          }
          setShowMatch(newMatch);
          setTimeout(() => setShowMatch(null), 3000);
        }
      }
    } else {
      if (liked) {
        const newLikes = new Set([...person2Likes, planIndex]);
        setPerson2Likes(newLikes);
        
        if (person1Likes.has(planIndex)) {
          const newMatch = { ...plan, matchedAt: new Date(), mode: currentMode };
          if (currentMode === 'today') {
            setTodayMatches(prev => [...prev, newMatch]);
          } else {
            setMatches(prev => [...prev, newMatch]);
          }
          setShowMatch(newMatch);
          setTimeout(() => setShowMatch(null), 3000);
        }
      }
    }
    
    setCurrentPlanIndex(prev => prev + 1);
  };

  const addNewPlan = () => {
    if (newPlan.title.trim() && newPlan.description.trim()) {
      const plan = {
        ...newPlan,
        id: Math.max(...plans.map(p => p.id), 0) + 1
      };
      setPlans(prev => [...prev, plan]);
      setNewPlan({
        title: '',
        description: '',
        category: 'Romántico',
        time: '1-2 horas',
        cost: 'Gratis',
        image: '💕',
        bgColor: 'from-pink-400 to-purple-500',
        goodForToday: true
      });
    }
  };

  const savePlanIdea = () => {
    if (newPlan.title.trim() && newPlan.description.trim()) {
      const savedPlan = {
        ...newPlan,
        id: Date.now(),
        savedAt: new Date()
      };
      setSavedPlans(prev => [...prev, savedPlan]);
      setNewPlan({
        title: '',
        description: '',
        category: 'Romántico',
        time: '1-2 horas',
        cost: 'Gratis',
        image: '💕',
        bgColor: 'from-pink-400 to-purple-500',
        goodForToday: true
      });
    }
  };

  const promoteSavedPlan = (savedPlan) => {
    const plan = {
      ...savedPlan,
      id: Math.max(...plans.map(p => p.id), 0) + 1
    };
    setPlans(prev => [...prev, plan]);
    setSavedPlans(prev => prev.filter(p => p.id !== savedPlan.id));
  };

  const resetCurrentMode = () => {
    if (currentMode === 'today') {
      setPerson1Likes(new Set());
      setPerson2Likes(new Set());
      setTodayMatches([]);
    } else {
      setPerson1Likes(new Set());
      setPerson2Likes(new Set());
      setMatches([]);
    }
    setCurrentPlanIndex(0);
  };

  const resetApp = () => {
    setPerson1Likes(new Set());
    setPerson2Likes(new Set());
    setMatches([]);
    setTodayMatches([]);
    setCurrentPlanIndex(0);
    setShowMatch(null);
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    setCurrentPlanIndex(0);
  };

  const currentPlan = getCurrentPlan();
  const availablePlans = getAvailablePlans();  const currentMatches = currentMode === 'today' ? todayMatches : matches;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm shadow-lg border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse-gentle">
              <Heart className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Planes de Pareja
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowPlanHistory(!showPlanHistory)}
              className="rounded-full hover:scale-110 transition-all duration-200"
            >
              <List size={20} />
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full hover:scale-110 transition-all duration-200"
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Mode Selector */}
        <Card className="card-shadow border-border/20 bg-card/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-base">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                <Clock className="text-white" size={18} />
              </div>
              <span>Modo de selección</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-3">
              <Button
                onClick={() => switchMode('today')}
                variant={currentMode === 'today' ? 'default' : 'outline'}
                className={`flex-1 py-4 px-5 font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 ${
                  currentMode === 'today' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25' 
                    : ''
                }`}
              >
                <Zap size={18} />
                <span>Plan para HOY</span>
              </Button>
              <Button
                onClick={() => switchMode('explore')}
                variant={currentMode === 'explore' ? 'default' : 'outline'}
                className={`flex-1 py-4 px-5 font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 ${
                  currentMode === 'explore' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                    : ''
                }`}
              >
                <Sparkles size={18} />
                <span>Explorar</span>
              </Button>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {currentMode === 'today' 
                  ? `🔥 ${availablePlans.length} planes perfectos para hoy` 
                  : `✨ ${availablePlans.length} planes disponibles`
                }
              </Badge>
            </div>
          </CardContent>
        </Card>        {/* User Selector */}
        <Card className="card-shadow border-border/20 bg-card/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-base">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Users className="text-white" size={18} />
              </div>
              <span>¿Quién está eligiendo?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentUser('person1')}
                variant={currentUser === 'person1' ? 'default' : 'outline'}
                className={`flex-1 py-4 px-5 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  currentUser === 'person1' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25' 
                    : ''
                }`}
              >
                {person1Name}
              </Button>
              <Button
                onClick={() => setCurrentUser('person2')}
                variant={currentUser === 'person2' ? 'default' : 'outline'}
                className={`flex-1 py-4 px-5 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  currentUser === 'person2' 
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg shadow-purple-500/25' 
                    : ''
                }`}
              >
                {person2Name}
              </Button>
            </div>
          </CardContent>
        </Card>{/* Plan History Panel */}
        {showPlanHistory && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl card-shadow p-6 mb-6 border border-white/20">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full mr-3">
                <Archive className="text-white" size={18} />
              </div>
              <span className="bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                Ideas Guardadas ({savedPlans.length})
              </span>
            </h3>
            {savedPlans.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{plan.image}</span>
                        <p className="font-medium text-gray-800 text-sm">{plan.title}</p>
                      </div>
                      <p className="text-xs text-gray-600">{plan.category} • {plan.time}</p>
                    </div>
                    <button
                      onClick={() => promoteSavedPlan(plan)}
                      className="ml-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No tienes ideas guardadas aún. ¡Agrega algunas abajo!
              </p>
            )}
          </div>
        )}        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl card-shadow p-6 mb-6 border border-white/20">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3">
                <Settings className="text-white" size={18} />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Configuración
              </span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Persona 1</label>
                <input
                  type="text"
                  value={person1Name}
                  onChange={(e) => setPerson1Name(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Persona 2</label>
                <input
                  type="text"
                  value={person2Name}
                  onChange={(e) => setPerson2Name(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Agregar Nuevo Plan</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título del plan"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Descripción"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <select
                      value={newPlan.category}
                      onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={newPlan.time}
                      onChange={(e) => setNewPlan({...newPlan, time: e.target.value})}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <select
                      value={newPlan.cost}
                      onChange={(e) => setNewPlan({...newPlan, cost: e.target.value})}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {costOptions.map(cost => (
                        <option key={cost} value={cost}>{cost}</option>
                      ))}
                    </select>
                    <select
                      value={newPlan.image}
                      onChange={(e) => setNewPlan({...newPlan, image: e.target.value})}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {emojiOptions.map(emoji => (
                        <option key={emoji} value={emoji}>{emoji} {emoji}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={newPlan.bgColor}
                    onChange={(e) => setNewPlan({...newPlan, bgColor: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 mb-3"
                  >
                    {colorOptions.map((color, index) => (
                      <option key={color} value={color}>Color {index + 1}</option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="goodForToday"
                      checked={newPlan.goodForToday}
                      onChange={(e) => setNewPlan({...newPlan, goodForToday: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="goodForToday" className="text-sm text-gray-600">
                      ¿Es bueno para "Plan de HOY"?
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={addNewPlan}
                      className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Agregar Ahora
                    </button>
                    <button
                      onClick={savePlanIdea}
                      className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Star size={16} />
                      <span>Guardar Idea</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={resetCurrentMode}
                  className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Reiniciar Modo Actual
                </button>
                <button
                  onClick={resetApp}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reiniciar Todo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Match Notification */}
        {showMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">
                {currentMode === 'today' ? '⚡' : '🎉'}
              </div>
              <h2 className="text-2xl font-bold text-pink-500 mb-2">
                {currentMode === 'today' ? '¡PLAN PARA HOY!' : '¡ES UN MATCH!'}
              </h2>
              <p className="text-gray-600 mb-4">
                Ambos eligieron: <span className="font-semibold">{showMatch.title}</span>
              </p>
              <div className="flex justify-center space-x-2">
                <Heart className="text-pink-500" size={24} />
                <Sparkles className="text-yellow-500" size={24} />
                <Heart className="text-pink-500" size={24} />
              </div>
            </div>
          </div>
        )}        {/* Plan Card */}
        {currentPlan ? (
          <Card className="card-shadow border-border/30 bg-card/95 backdrop-blur-sm overflow-hidden animate-fadeIn">
            <div className={`bg-gradient-to-r ${currentPlan.bgColor || 'from-pink-400 to-purple-500'} h-48 flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="text-center relative z-10">
                <div className="text-8xl mb-3 drop-shadow-2xl animate-pulse-gentle">
                  {currentPlan.image || '💕'}
                </div>
                <Badge variant="secondary" className="bg-white/30 backdrop-blur-md text-white border-0 shadow-lg">
                  {currentPlan.category}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 bg-white/25 backdrop-blur-md rounded-full px-4 py-2">
                <span className="text-white text-sm font-semibold">
                  {plans.findIndex(p => p.id === currentPlan.id) + 1} / {availablePlans.length}
                </span>
              </div>
              {currentMode === 'today' && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg animate-pulse px-3 py-2">
                  🔥 PERFECTO PARA HOY
                </Badge>
              )}
            </div>
            
            <CardContent className="p-8">
              <CardTitle className="text-2xl mb-4 leading-tight">{currentPlan.title}</CardTitle>
              <CardDescription className="mb-6 leading-relaxed text-base text-muted-foreground">
                {currentPlan.description}
              </CardDescription>
              
              <div className="flex items-center justify-between mb-8">
                <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
                  <Calendar size={16} />
                  <span className="font-medium">{currentPlan.time}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
                  <span>💰</span>
                  <span className="font-medium">{currentPlan.cost}</span>
                </Badge>
              </div>
              
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {currentUser === 'person1' ? person1Name : person2Name} está eligiendo...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modo: {currentMode === 'today' ? '🔥 Plan para HOY' : '✨ Explorar planes'}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {currentMode === 'today' ? '⚡' : '🎊'}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {currentMode === 'today' ? '¡No quedan planes para hoy!' : '¡No hay más planes!'}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentUser === 'person1' ? person1Name : person2Name} ya vio todos los planes disponibles
            </p>
            <button 
              onClick={() => {
                setCurrentPlanIndex(0);
                if (currentUser === 'person1') {
                  setPerson1Likes(new Set());
                } else {
                  setPerson2Likes(new Set());
                }
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Reiniciar mis elecciones
            </button>
          </div>
        )}        {/* Action Buttons */}
        {currentPlan && (
          <div className="flex justify-center space-x-12 mb-8">
            <Button
              onClick={() => handleSwipe(false)}
              size="lg"
              className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <X size={28} />
            </Button>
            <Button
              onClick={() => handleSwipe(true)}
              size="lg"
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <Heart size={28} />
            </Button>
          </div>
        )}        {/* Matches */}
        {currentMatches.length > 0 && (
          <Card className="card-shadow border-border/20 bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                {currentMode === 'today' ? (
                  <>
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3">
                      <Zap className="text-white" size={18} />
                    </div>
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Planes para HOY ({currentMatches.length})
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-3">
                      <Sparkles className="text-white" size={18} />
                    </div>
                    <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Sus Matches ({currentMatches.length})
                    </span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMatches.map((match, index) => (
                <Card key={index} className={`transition-all duration-300 hover:scale-105 hover:shadow-lg border ${
                  currentMode === 'today' 
                    ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:from-orange-100 hover:to-yellow-100' 
                    : 'bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200 hover:from-pink-100 hover:to-purple-100'
                }`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{match.title}</h4>
                      <p className="text-sm text-muted-foreground">{match.category} • {match.time}</p>
                    </div>
                    <div className={`p-2 rounded-full ${currentMode === 'today' ? 'bg-orange-500' : 'bg-pink-500'}`}>
                      {currentMode === 'today' ? 
                        <Zap className="text-white" size={20} /> : 
                        <Heart className="text-white" size={20} />
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CouplePlansTinder;