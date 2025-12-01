import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { Logger } from '../components/Logger';
import { History } from '../components/History';
import { Insights } from '../components/Insights';
import Settings from '../components/Settings';
import Login from '../components/Login';
import Signup from '../components/Signup';
import { User, MealLog } from '../types';
import { DBService } from '../services/dbService';
import { authService } from '../services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.verifyToken();
        if (currentUser) {
          setUser(currentUser);
          await loadUserData(currentUser.id);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for userId:', userId);
      const fetchedLogs = await DBService.getLogsByUser(userId);
      console.log('Fetched logs:', fetchedLogs);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLoginSuccess = async () => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      await loadUserData(currentUser.id);
    }
  };

  const handleSignupSuccess = async () => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setShowSignup(false);
      await loadUserData(currentUser.id);
    }
  };

  const refreshLogs = async () => {
    if (user) {
      console.log('Refreshing logs for user:', user.id);
      await loadUserData(user.id);
    } else {
      console.warn('Cannot refresh logs: user is null');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setLogs([]);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!user) {
    return showSignup ? (
      <Signup 
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    ) : (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-darker text-gray-100 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
      />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-gray-800 p-4 z-50 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">SmartCal</h1>
        <button 
          type="button"
          onClick={handleLogout} 
          className="text-sm text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 md:mt-0 relative">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && user && <Dashboard logs={logs} user={user} onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            // Refresh user data
            loadUserData(updatedUser.id);
          }} />}
          {activeTab === 'logger' && <Logger user={user} onLogAdded={refreshLogs} />}
          {activeTab === 'history' && <History logs={logs} onUpdate={refreshLogs} />}
          {activeTab === 'insights' && <Insights logs={logs} />}
          {activeTab === 'settings' && user && <Settings user={user} onUpdate={(updatedUser) => {
            setUser(updatedUser);
            // Refresh user data
            loadUserData(updatedUser.id);
          }} />}
        </div>
        
        {/* Mobile Nav Bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-gray-800 p-2 flex justify-around z-50">
           <button 
             type="button"
             onClick={() => setActiveTab('dashboard')} 
             className={`p-2 ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-500'}`}
           >
             📊
           </button>
           <button 
             type="button"
             onClick={() => setActiveTab('logger')} 
             className={`p-2 ${activeTab === 'logger' ? 'text-primary' : 'text-gray-500'}`}
           >
             ➕
           </button>
           <button 
             type="button"
             onClick={() => setActiveTab('history')} 
             className={`p-2 ${activeTab === 'history' ? 'text-primary' : 'text-gray-500'}`}
           >
             📅
           </button>
           <button 
             type="button"
             onClick={() => setActiveTab('insights')} 
             className={`p-2 ${activeTab === 'insights' ? 'text-primary' : 'text-gray-500'}`}
           >
             🤖
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;
