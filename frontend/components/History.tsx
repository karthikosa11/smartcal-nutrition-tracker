import React, { useState } from 'react';
import { MealLog } from '../types';
import { DBService } from '../services/dbService';
import EditMeal from './EditMeal';

interface HistoryProps {
  logs: MealLog[];
  onUpdate: () => void;
}

export const History: React.FC<HistoryProps> = ({ logs, onUpdate }) => {
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await DBService.deleteLog(id);
        onUpdate();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete record. Please try again.");
      }
    }
  };

  const handleEdit = (meal: MealLog) => {
    setEditingMeal(meal);
  };

  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-3xl font-bold text-white">History Logs</h2>
        <p className="text-gray-400">View and manage your database records.</p>
      </header>

      <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-darker text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Meal</th>
                <th className="px-6 py-4">Food Item</th>
                <th className="px-6 py-4 text-right">Calories</th>
                <th className="px-6 py-4 text-right">Macros (P/C/F)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No logs found in database.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.date}
                    <div className="text-xs text-gray-600">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${log.mealType === 'Breakfast' ? 'bg-yellow-900/30 text-yellow-400' : 
                        log.mealType === 'Lunch' ? 'bg-blue-900/30 text-blue-400' : 
                        log.mealType === 'Dinner' ? 'bg-purple-900/30 text-purple-400' : 'bg-gray-700 text-gray-300'}`}>
                      {log.mealType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.imageUrl && (
                        <img src={log.imageUrl} alt="food" className="w-8 h-8 rounded object-cover border border-gray-700 flex-shrink-0" />
                      )}
                      <div className="flex flex-col gap-1">
                        {log.foodItems.map((item, idx) => {
                          // Try to estimate quantity from calories (approximate)
                          // Common foods: chicken ~165 cal/100g, rice ~130 cal/100g
                          let quantityText = '';
                          const itemNameLower = item.name.toLowerCase();
                          if (itemNameLower.includes('chicken')) {
                            const estimatedGrams = Math.round((item.calories / 165) * 100);
                            quantityText = `~${estimatedGrams}g`;
                          } else if (itemNameLower.includes('rice')) {
                            const estimatedGrams = Math.round((item.calories / 130) * 100);
                            quantityText = `~${estimatedGrams}g`;
                          } else if (itemNameLower.includes('egg')) {
                            const estimatedCount = Math.round(item.calories / 70);
                            quantityText = estimatedCount > 1 ? `${estimatedCount} eggs` : '1 egg';
                          }
                          
                          return (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{item.name}</span>
                              {quantityText && (
                                <span className="text-xs text-gray-400 ml-2">{quantityText}</span>
                              )}
                              <span className="text-xs text-gray-500 ml-2">
                                ({Math.round(item.calories)} cal)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white">
                    {log.totalCalories}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-blue-400">
                      {Math.round(log.foodItems.reduce((sum, item) => sum + (item.protein || 0), 0))}p
                    </span> / 
                    <span className="text-green-400">
                      {' '}{Math.round(log.foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0))}c
                    </span> / 
                    <span className="text-yellow-400">
                      {' '}{Math.round(log.foodItems.reduce((sum, item) => sum + (item.fat || 0), 0))}f
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleEdit(log)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                        title="Edit meal"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        title="Delete meal"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Meal Modal */}
      {editingMeal && (
        <EditMeal
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default History;