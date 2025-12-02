import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { MealLog, User } from '../types';
import { authService } from '../services/authService';
import { getTodayDate } from '../utils/dateUtils';

interface DashboardProps {
  logs: MealLog[];
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, user, onUserUpdate }) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetValue, setTargetValue] = useState(user.dailyCalorieTarget.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<string>(getTodayDate());
  
  // Update today's date periodically to handle day changes
  useEffect(() => {
    const updateToday = () => {
      const newToday = getTodayDate();
      if (newToday !== today) {
        console.log('Dashboard - Date changed from', today, 'to', newToday);
        setToday(newToday);
      }
    };
    
    // Update immediately
    updateToday();
    
    // Update every minute to catch day changes
    const interval = setInterval(updateToday, 60000);
    
    return () => clearInterval(interval);
  }, [today]);
  
  // Force recalculation when logs change
  useEffect(() => {
    console.log('Dashboard - Logs updated, recalculating stats');
  }, [logs]);
  
  // Debug: Log today's date and logs
  console.log('Dashboard - Today:', today);
  console.log('Dashboard - All logs:', logs);
  console.log('Dashboard - Today logs:', logs.filter(l => {
    const logDate = l.date?.split('T')[0] || l.date; // Handle both YYYY-MM-DD and ISO format
    return logDate === today;
  }));

  const handleTargetUpdate = async () => {
    const newTarget = parseInt(targetValue);
    if (isNaN(newTarget) || newTarget < 1000 || newTarget > 5000) {
      setError('Please enter a value between 1000 and 5000');
      return;
    }

    if (newTarget === user.dailyCalorieTarget) {
      setIsEditingTarget(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await authService.updateProfile({ dailyCalorieTarget: newTarget });
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setIsEditingTarget(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update calorie target');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTargetValue(user.dailyCalorieTarget.toString());
    setIsEditingTarget(false);
    setError(null);
  };
  
  const dailyStats = useMemo(() => {
    // Normalize date format for comparison (handle both YYYY-MM-DD and ISO format)
    const todayLogs = logs.filter(l => {
      const logDate = l.date?.split('T')[0] || l.date; // Extract YYYY-MM-DD from ISO string if needed
      return logDate === today;
    });
    
    console.log('Dashboard - Filtered today logs:', todayLogs);
    
    const totalCals = todayLogs.reduce((acc, curr) => acc + curr.totalCalories, 0);
    const protein = todayLogs.reduce((acc, curr) => acc + curr.foodItems.reduce((s, f) => s + f.protein, 0), 0);
    const carbs = todayLogs.reduce((acc, curr) => acc + curr.foodItems.reduce((s, f) => s + f.carbs, 0), 0);
    const fat = todayLogs.reduce((acc, curr) => acc + curr.foodItems.reduce((s, f) => s + f.fat, 0), 0);
    return { totalCals, protein, carbs, fat };
  }, [logs, today]);

  const weeklyData = useMemo(() => {
    // Process last 7 days for the chart
    const data = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Normalize date format for comparison
      const dayLogs = logs.filter(l => {
        const logDate = l.date?.split('T')[0] || l.date;
        return logDate === dateStr;
      });
      
      const cals = dayLogs.reduce((acc, curr) => acc + curr.totalCalories, 0);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: cals,
        target: user.dailyCalorieTarget
      });
    }
    return data;
  }, [logs, user.dailyCalorieTarget]);

  const progress = Math.min((dailyStats.totalCals / user.dailyCalorieTarget) * 100, 100);
  const progressColor = progress > 100 ? 'bg-red-500' : 'bg-primary';

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400">Welcome back, {user.username}. Here is your nutritional overview.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-400 text-sm">Calories Today</p>
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-white">{Math.round(dailyStats.totalCals)}</span>
            <span className="text-gray-500 mb-1">/</span>
            {isEditingTarget ? (
              <div className="flex items-center space-x-2 mb-1">
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTargetUpdate();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  min="1000"
                  max="5000"
                  step="50"
                  className="w-20 px-2 py-1 bg-darker border border-primary rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleTargetUpdate}
                  disabled={loading}
                  className="text-green-400 hover:text-green-300 disabled:opacity-50"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-300 disabled:opacity-50"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-gray-500">{user.dailyCalorieTarget}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(true)}
                  className="text-gray-500 hover:text-primary transition-colors"
                  title="Edit calorie target"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
            <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Protein</p>
          <span className="text-3xl font-bold text-blue-400">{Math.round(dailyStats.protein)}g</span>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Carbs</p>
          <span className="text-3xl font-bold text-green-400">{Math.round(dailyStats.carbs)}g</span>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Fat</p>
          <span className="text-3xl font-bold text-yellow-400">{Math.round(dailyStats.fat)}g</span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Calorie Trends (7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCals)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
           <h3 className="text-xl font-semibold text-white mb-6">Macro Distribution</h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[dailyStats]} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                 <XAxis type="number" hide />
                 <YAxis type="category" dataKey="name" hide />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151' }} />
                 <Legend />
                 <Bar dataKey="protein" name="Protein" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40} />
                 <Bar dataKey="carbs" name="Carbs" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={40} />
                 <Bar dataKey="fat" name="Fat" stackId="a" fill="#fbbf24" radius={[4, 0, 0, 4]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> Protein</span>
                <span className="text-white">{Math.round(dailyStats.protein)}g</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Carbs</span>
                <span className="text-white">{Math.round(dailyStats.carbs)}g</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div> Fat</span>
                <span className="text-white">{Math.round(dailyStats.fat)}g</span>
              </div>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;