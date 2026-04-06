import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import DashboardSummary from './components/DashboardSummary';
import AddTransaction from './components/AddTransaction';
import UserProfile from './components/UserProfile';
import DebtManager from './components/DebtManager';
import Reports from './components/Reports'; 
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard'; 

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  // CONFIGURATION ADMIN
  const ADMIN_EMAIL = "admin@silver.com"; 

  // Charger le profil au démarrage ou après changement de token
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // LOGIQUE DE REDIRECTION AUTOMATIQUE
  // Dès que 'user' est chargé, on vérifie son rôle pour choisir l'onglet de départ
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.email === ADMIN_EMAIL) {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  };

  const handleSetToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setShowLanding(true);
    setActiveTab('dashboard');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // AFFICHAGE SI NON CONNECTÉ
  if (!token) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return isRegistering 
      ? <Register setToken={handleSetToken} setUser={setUser} togglePage={() => setIsRegistering(false)} />
      : <Login setToken={handleSetToken} setUser={setUser} togglePage={() => setIsRegistering(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 print:bg-white print:pb-0 font-sans text-slate-900">
      
      {/* NAVIGATION PREMIUM */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-50 print:hidden transition-all">
        <div className="container mx-auto max-w-5xl flex flex-wrap justify-between items-center gap-4">
          
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic group-hover:rotate-6 transition-transform">S</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              SILVER <span className="text-blue-600">FIN</span>
            </h1>
          </div>

          <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'reports', label: 'Analyses' },
              { id: 'debts', label: 'Dettes' },
              { id: 'profile', label: 'Compte' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[10px] font-black uppercase px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id || (tab.id === 'dashboard' && activeTab === 'add')
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* BOUTON ADMIN VISIBLE SI ROLE ADMIN OU EMAIL ADMIN */}
            {(user?.role === 'admin' || user?.email === ADMIN_EMAIL) && (
              <>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`text-[10px] font-black uppercase px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    activeTab === 'admin' 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                >
                  Admin
                </button>
              </>
            )}

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button 
              onClick={logout} 
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Déconnexion"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <main className="container mx-auto py-10 px-4 max-w-5xl print:max-w-none print:p-0">
        <div className="animate-reveal">
          {activeTab === 'dashboard' && <DashboardSummary key={refreshKey} onGoToAdd={() => setActiveTab('add')} />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'debts' && <DebtManager key={refreshKey} />}
          {activeTab === 'profile' && <UserProfile />}
          
          {/* ACCÈS SÉCURISÉ À LA VUE ADMIN */}
          {activeTab === 'admin' && (user?.role === 'admin' || user?.email === ADMIN_EMAIL) && <AdminDashboard />}

          {activeTab === 'add' && (
            <AddTransaction 
              onTransactionAdded={() => { handleRefresh(); setActiveTab('dashboard'); }} 
              onCancel={() => setActiveTab('dashboard')}
            />
          )}
        </div>
      </main>

      <footer className="text-center py-16 text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] print:hidden">
        &mdash; développé par silver's design &mdash;
      </footer>

    </div>
  );
}

export default App;