import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface SettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(user.dailyCalorieTarget.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updates: any = {};
      
      if (username !== user.username) {
        updates.username = username;
      }
      if (email !== user.email) {
        updates.email = email;
      }
      if (parseInt(dailyCalorieTarget) !== user.dailyCalorieTarget) {
        updates.dailyCalorieTarget = parseInt(dailyCalorieTarget);
      }

      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      const updatedUser = await authService.updateProfile(updates);
      onUpdate(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-gray-400">Manage your profile and preferences</p>
      </header>

      <div className="bg-card rounded-2xl border border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Daily Calorie Target */}
          <div>
            <label htmlFor="calorieTarget" className="block text-sm font-medium text-gray-300 mb-2">
              Daily Calorie Target
            </label>
            <input
              type="number"
              id="calorieTarget"
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(e.target.value)}
              min="1000"
              max="5000"
              step="50"
              className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Recommended: 2000-2500 calories per day for adults
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
              Profile updated successfully!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* User Info Card */}
      <div className="bg-card rounded-2xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">User ID:</span>
            <span className="text-gray-300 font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Role:</span>
            <span className="text-gray-300">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

