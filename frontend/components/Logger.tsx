import React, { useState } from 'react';
import { MealType, FoodItem, MealLog, User } from '../types';
import { parseFoodText } from '../services/geminiService';
import { DBService } from '../services/dbService';

interface LoggerProps {
  user: User;
  onLogAdded: () => void;
}

export const Logger: React.FC<LoggerProps> = ({ user, onLogAdded }) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai-text'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [mealType, setMealType] = useState<MealType>(MealType.BREAKFAST);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }
  ]);
  
  // AI Text Input
  const [aiPrompt, setAiPrompt] = useState('');

  const resetForm = () => {
    setFoodItems([{ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
    setAiPrompt('');
    setSuccess(false);
    setError(null);
  };

  // Calculate totals from all food items
  const totalCalories = foodItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = foodItems.reduce((sum, item) => sum + (item.fat || 0), 0);

  const addFoodItem = () => {
    setFoodItems([...foodItems, { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: any) => {
    const updated = [...foodItems];
    updated[index] = { ...updated[index], [field]: value };
    setFoodItems(updated);
  };

  const handleTextAnalysis = async () => {
    if (!aiPrompt.trim()) {
      setError("Please enter a description of your meal.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log("Parsing food text:", aiPrompt);
      const result = await parseFoodText(aiPrompt);
      console.log("Parse result:", result);
      
      if (result) {
        // Handle both single item and array of items
        const items = Array.isArray(result) ? result : [result];
        
        if (items.length > 0) {
          const parsedItems = items.map(item => ({
            name: item.name || 'Unknown Food',
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fat: Number(item.fat) || 0
          }));
          
          console.log("Parsed items:", parsedItems);
          console.log("Total calories:", parsedItems.reduce((sum, item) => sum + item.calories, 0));
          
          setFoodItems(parsedItems);
          setActiveMode('manual');
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error("No food items detected");
        }
      } else {
        throw new Error("Invalid response from parser");
      }
    } catch (err: any) {
      console.error("Parse error:", err);
      setError(err.message || "Could not parse text. Please try again or enter manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs - check all food items
    const validItems = foodItems.filter(item => item.name.trim() && item.calories >= 0);
    
    if (validItems.length === 0) {
      setError("Please enter at least one food item with a name.");
      return;
    }
    
    // Validate all items have valid numbers
    for (const item of validItems) {
      if (isNaN(item.calories) || isNaN(item.protein) || isNaN(item.carbs) || isNaN(item.fat)) {
        setError("Please enter valid numbers for all nutritional values.");
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Use local date to avoid timezone issues
    const today = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
    
    const newLog: MealLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: today,
      timestamp: Date.now(),
      mealType,
      foodItems: validItems,
      totalCalories: validItems.reduce((sum, item) => sum + item.calories, 0)
    };

    try {
      console.log("Saving meal log:", newLog);
      const savedLog = await DBService.addLog(newLog);
      console.log("Meal log saved successfully:", savedLog);
      setSuccess(true);
      
      // Refresh logs immediately after successful save
      // Add a small delay to ensure database is updated
      setTimeout(() => {
        onLogAdded();
      }, 100);
      
      setTimeout(() => {
        resetForm();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save to database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Log Meal</h2>
        <p className="text-gray-400">Add entries to your database.</p>
      </header>

      {/* Mode Switcher */}
      <div className="flex bg-card rounded-xl p-1 border border-gray-800">
        <button
          onClick={() => setActiveMode('manual')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeMode === 'manual' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveMode('ai-text')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeMode === 'ai-text' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          AI Text
        </button>
      </div>

      {/* AI Text Mode */}
      {activeMode === 'ai-text' && (
        <div className="bg-card p-6 rounded-2xl border border-gray-800 animate-fade-in">
          <label className="block text-sm font-medium text-gray-300 mb-2">Describe your meal</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && aiPrompt.trim()) {
                  e.preventDefault();
                  handleTextAnalysis();
                }
              }}
              placeholder="e.g., 100 grams of chicken and 100 grams of rice"
              className="flex-1 bg-darker border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTextAnalysis();
              }}
              disabled={loading || !aiPrompt.trim()}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Parse'}
            </button>
          </div>
          {error && activeMode === 'ai-text' && (
            <p className="text-red-400 text-sm mt-2 bg-red-900/20 p-2 rounded-lg">{error}</p>
          )}
          {success && activeMode === 'ai-text' && (
            <div className="text-green-400 text-sm mt-2 bg-green-900/20 p-2 rounded-lg">
              <p>Food parsed successfully! Found {foodItems.filter(i => i.name).length} item(s).</p>
              {foodItems.length > 0 && (
                <p className="text-xs mt-1 text-gray-300">
                  Total: {Math.round(totalCalories)} cal, {Math.round(totalProtein)}g protein, {Math.round(totalCarbs)}g carbs, {Math.round(totalFat)}g fat
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      {activeMode === 'manual' && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(MealType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`py-2 text-xs rounded-lg border ${mealType === type ? 'bg-primary border-primary text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Food Items List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-400">Food Items</label>
              <button
                type="button"
                onClick={addFoodItem}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <span>+</span> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {foodItems.map((item, index) => (
                <div key={index} className="bg-darker p-4 rounded-lg border border-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Item {index + 1}</span>
                    {foodItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Food Name</label>
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={e => updateFoodItem(index, 'name', e.target.value)}
                      placeholder="e.g., Chicken Breast"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Calories</label>
                      <input 
                        type="number" 
                        value={item.calories || ''} 
                        onChange={e => updateFoodItem(index, 'calories', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                      <input 
                        type="number" 
                        value={item.protein || ''} 
                        onChange={e => updateFoodItem(index, 'protein', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                      <input 
                        type="number" 
                        value={item.carbs || ''} 
                        onChange={e => updateFoodItem(index, 'carbs', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                      <input 
                        type="number" 
                        value={item.fat || ''} 
                        onChange={e => updateFoodItem(index, 'fat', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals Display */}
            {foodItems.length > 0 && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">Total Nutrition</span>
                  <span className="text-xs text-gray-500">{foodItems.filter(i => i.name).length} item(s)</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Calories:</span>
                    <span className="ml-2 font-bold text-white">{Math.round(totalCalories)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Protein:</span>
                    <span className="ml-2 font-bold text-blue-400">{Math.round(totalProtein)}g</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Carbs:</span>
                    <span className="ml-2 font-bold text-green-400">{Math.round(totalCarbs)}g</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fat:</span>
                    <span className="ml-2 font-bold text-yellow-400">{Math.round(totalFat)}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</p>}
          {success && <p className="text-green-400 text-sm bg-green-900/20 p-3 rounded-lg">Meal logged successfully!</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Save to Database'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Logger;