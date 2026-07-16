'use client'
import { useState, useEffect } from 'react'
import { useRouter }    from 'next/navigation'
import Header           from '../../../components/Header'
import Navigation       from '../../../components/Navigation'
import Dashboard        from '../../../components/tabs/Dashboard'
import Placement        from '../../../components/tabs/Placement'
import Tables           from '../../../components/tabs/Tables'
import Guests           from '../../../components/tabs/Guests'
import Invitations      from '../../../components/tabs/Invitations'
import Export           from '../../../components/tabs/Export'
import Budget          from '../../../components/tabs/Budget'
import Checkin          from '../../../components/tabs/Checkin'
import LoadingSpinner   from '../../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [tab,    setTab]    = useState('dashboard')
  const [guests, setGuests] = useState([])
  const [loading,setLoading]= useState(true)
  const [error,  setError]  = useState(null)
  const router = useRouter()

  useEffect(()=>{
    fetch('/api/guests')
      .then(r=>{ if(r.status===401||r.redirected){router.push('/admin/login');return null} return r.json() })
      .then(d=>{ if(!d)return; if(d.error)throw new Error(d.error); setGuests(d) })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false))
  },[])

  async function logout(){
    await fetch('/api/auth',{method:'DELETE'})
    router.push('/admin/login')
  }

  function content(){
    if(loading) return <LoadingSpinner message="Connexion à Supabase…"/>
    if(error) return (
      <div className="p-10 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="italic text-xl text-gold-light playfair mb-2">Connexion Supabase impossible</h3>
        <p className="text-white/50 text-sm mb-6">{error}</p>
        <div className="bg-black/30 border border-gold/30 rounded-xl p-5 text-left max-w-md mx-auto text-sm text-white/70 space-y-2">
          <p className="text-gold text-xs tracking-widest uppercase mb-3">Configuration requise :</p>
          <p>1️⃣ Créez un projet sur <strong className="text-white">supabase.com</strong></p>
          <p>2️⃣ Copiez URL + clé anon depuis <strong className="text-white">Settings → API</strong></p>
          <p>3️⃣ Collez dans <strong className="text-white">.env.local</strong></p>
          <p>4️⃣ Exécutez <strong className="text-white">supabase-schema.sql</strong> dans SQL Editor</p>
          <p>5️⃣ Relancez : <strong className="text-white">npm run dev</strong></p>
        </div>
      </div>
    )
    switch(tab){
      case 'dashboard':   return <Dashboard   guests={guests}/>
      case 'budget':      return <Budget/>
      case 'placement':   return <Placement   guests={guests} onGuestsChange={setGuests}/>
      case 'tables':      return <Tables      guests={guests} onGuestsChange={setGuests}/>
      case 'guests':      return <Guests      guests={guests} onGuestsChange={setGuests}/>
      case 'invitations': return <Invitations guests={guests}/>
      case 'photos':      return <div style={{padding:'20px'}}><a href="/admin/photos" style={{display:'inline-flex',alignItems:'center',gap:'10px',padding:'14px 24px',borderRadius:'12px',background:'linear-gradient(135deg,#c9a84c,#f0d080)',color:'#1a4a2e',fontWeight:700,textDecoration:'none',fontSize:'0.85rem'}}>📸 Ouvrir le Gestionnaire Photos →</a></div>
      case 'export':      return <Export      guests={guests}/>
      case 'checkin':     return <Checkin     guests={guests} onGuestsChange={setGuests}/>
      default:            return <Dashboard   guests={guests}/>
    }
  }

  return (
    <main className="min-h-screen" style={{
      backgroundColor: '#1a4a2e',
      backgroundImage: 'var(--bg-mesh)',
      backgroundAttachment: 'fixed',
    }}>
      <Header onLogout={logout}/>
      <Navigation activeTab={tab} onTabChange={setTab}/>
      <div key={tab} className="fade-in">{content()}</div>
    </main>
  )
}
