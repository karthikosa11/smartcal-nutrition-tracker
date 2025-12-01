import React, { useState, useEffect } from 'react';
import { MealLog, FoodItem } from '../types';
import { DBService } from '../services/dbService';

interface EditMealProps {
  meal: MealLog;
  onClose: () => void;
  onUpdate: () => void;
}

// Extended FoodItem with quantity for editing
interface FoodItemWithQuantity extends FoodItem {
  quantity?: number | string; // Quantity in grams (or count) - can be string while typing
  originalQuantity?: number; // Original quantity to calculate per-100g values
  per100g?: { calories: number; protein: number; carbs: number; fat: number }; // Store per-100g values
  isCountBased?: boolean; // True for items like eggs that should show count
}

export const EditMeal: React.FC<EditMealProps> = ({ meal, onClose, onUpdate }) => {
  const [date, setDate] = useState(meal.date);
  const [mealType, setMealType] = useState(meal.mealType);
  // Store quantity input values separately to prevent recalculation from modifying them
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});
  const [foodItems, setFoodItems] = useState<FoodItemWithQuantity[]>(() => {
    // Initialize with estimated quantities based on common foods
    return meal.foodItems.map(item => {
      const itemNameLower = item.name.toLowerCase();
      let estimatedQuantity = 100; // Default 100g
      let isCountBased = false;
      
      // Estimate quantity from calories for common foods
      if (itemNameLower.includes('chicken')) {
        estimatedQuantity = Math.round((item.calories / 165) * 100);
      } else if (itemNameLower.includes('rice')) {
        estimatedQuantity = Math.round((item.calories / 130) * 100);
      } else if (itemNameLower.includes('egg')) {
        // Eggs: calculate count (each egg is ~70 cal, ~50g)
        const eggCount = Math.round(item.calories / 70);
        estimatedQuantity = eggCount;
        isCountBased = true;
      }
      
      // Calculate per-100g values from current values and estimated quantity
      const per100g = {
        calories: (item.calories / estimatedQuantity) * (isCountBased ? 1 : 100), // For eggs, per egg; for others, per 100g
        protein: (item.protein / estimatedQuantity) * (isCountBased ? 1 : 100),
        carbs: (item.carbs / estimatedQuantity) * (isCountBased ? 1 : 100),
        fat: (item.fat / estimatedQuantity) * (isCountBased ? 1 : 100)
      };
      
      return {
        ...item,
        quantity: estimatedQuantity,
        originalQuantity: estimatedQuantity,
        per100g: per100g,
        isCountBased: isCountBased
      };
    });
  });
  
  // Initialize quantity inputs
  useEffect(() => {
    const initialInputs: Record<number, string> = {};
    foodItems.forEach((item, index) => {
      initialInputs[index] = String(item.quantity || 100);
    });
    setQuantityInputs(initialInputs);
  }, []); // Only on mount
  const [notes, setNotes] = useState(meal.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate total calories
  const totalCalories = foodItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = foodItems.reduce((sum, item) => sum + (item.fat || 0), 0);


  // Recalculate nutrition based on new quantity
  // IMPORTANT: This function should NEVER modify the quantity - it's only used as input
  const recalculateNutrition = (item: FoodItemWithQuantity, newQuantity: number) => {
    if (newQuantity <= 0 || isNaN(newQuantity)) {
      // Return item unchanged - preserve quantity
      return { ...item };
    }
    
    // Use stored per-100g values (or per-item for count-based items)
    // If per100g doesn't exist, calculate it from current values
    let per100g = item.per100g;
    if (!per100g) {
      // Convert quantity to number if it's a string
      const baseQuantityNum = typeof item.originalQuantity === 'number' 
        ? item.originalQuantity 
        : typeof item.quantity === 'number' 
          ? item.quantity 
          : typeof item.quantity === 'string' 
            ? parseFloat(item.quantity) || 100
            : 100;
      
      if (baseQuantityNum <= 0) {
        // Can't calculate, return item unchanged
        return { ...item };
      }
      const multiplier = item.isCountBased ? 1 : 100;
      per100g = {
        calories: (item.calories / baseQuantityNum) * multiplier,
        protein: (item.protein / baseQuantityNum) * multiplier,
        carbs: (item.carbs / baseQuantityNum) * multiplier,
        fat: (item.fat / baseQuantityNum) * multiplier
      };
    }
    
    // Calculate new nutrition values - DO NOT modify quantity
    const newNutrition = item.isCountBased
      ? {
          // For count-based items (like eggs), multiply per-item values
          calories: Math.round(per100g.calories * newQuantity),
          protein: Math.round(per100g.protein * newQuantity * 10) / 10,
          carbs: Math.round(per100g.carbs * newQuantity * 10) / 10,
          fat: Math.round(per100g.fat * newQuantity * 10) / 10
        }
      : {
          // For weight-based items, calculate per 100g
          calories: Math.round((per100g.calories * newQuantity) / 100),
          protein: Math.round((per100g.protein * newQuantity) / 100 * 10) / 10,
          carbs: Math.round((per100g.carbs * newQuantity) / 100 * 10) / 10,
          fat: Math.round((per100g.fat * newQuantity) / 100 * 10) / 10
        };
    
    // Return ONLY nutrition values - quantity is preserved from input item
    return {
      ...item,
      calories: newNutrition.calories,
      protein: newNutrition.protein,
      carbs: newNutrition.carbs,
      fat: newNutrition.fat
      // Explicitly do NOT set quantity here - it comes from the input item
    };
  };

  const handleQuantityChange = (index: number, value: string) => {
    // Update only the quantity input state - completely isolated from foodItems
    setQuantityInputs(prev => ({
      ...prev,
      [index]: value
    }));
    // Do NOT update foodItems - quantity stays in separate state until blur
  };

  const handleQuantityBlur = (index: number, value: string) => {
    // Only recalculate when user finishes editing (on blur)
    const updated = [...foodItems];
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      // Invalid - restore original quantity
      const originalQty = updated[index].originalQuantity || 100;
      setQuantityInputs(prev => ({ ...prev, [index]: String(originalQty) }));
      updated[index] = { ...updated[index], quantity: originalQty };
    } else {
      // Valid number - convert to integer
      const exactQuantity = Math.floor(numValue);
      
      // Update quantity input state with final value
      setQuantityInputs(prev => ({ ...prev, [index]: String(exactQuantity) }));
      
      // Create item with exact quantity
      const currentItem = { 
        ...updated[index],
        quantity: exactQuantity
      };
      
      // Recalculate nutrition - this should NOT modify quantity
      const recalculated = recalculateNutrition(currentItem, exactQuantity);
      
      // CRITICAL: Set quantity to exact value - override anything from recalculation
      updated[index] = {
        ...recalculated,
        quantity: exactQuantity  // Force exact quantity - never let it change
      };
    }
    
    setFoodItems(updated);
  };

  const handleFoodItemChange = (index: number, field: keyof FoodItemWithQuantity, value: any) => {
    const updated = [...foodItems];
    
    if (field === 'quantity') {
      // This should not be called for quantity - use handleQuantityChange instead
      handleQuantityChange(index, value);
      return;
    } else {
      // For other fields, update directly
      updated[index] = { ...updated[index], [field]: value };
      // If nutrition values changed manually, recalculate per-100g values
      if (field === 'calories' || field === 'protein' || field === 'carbs' || field === 'fat') {
        // Convert quantity to number if it's a string
        const currentQuantity = typeof updated[index].quantity === 'number'
          ? updated[index].quantity
          : typeof updated[index].quantity === 'string'
            ? parseFloat(updated[index].quantity) || updated[index].originalQuantity || 100
            : updated[index].originalQuantity || 100;
        const quantityNum = currentQuantity > 0 ? currentQuantity : 100;
        const multiplier = updated[index].isCountBased ? 1 : 100;
        updated[index].per100g = {
          calories: (updated[index].calories / quantityNum) * multiplier,
          protein: (updated[index].protein / quantityNum) * multiplier,
          carbs: (updated[index].carbs / quantityNum) * multiplier,
          fat: (updated[index].fat / quantityNum) * multiplier
        };
        updated[index].originalQuantity = quantityNum;
      }
    }
    
    setFoodItems(updated);
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, { 
      name: '', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0,
      quantity: 100,
      originalQuantity: 100,
      per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      isCountBased: false
    }]);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (foodItems.length === 0 || foodItems.some(item => !item.name)) {
      setError('Please fill in all food items');
      setLoading(false);
      return;
    }

    try {
      // Remove quantity fields before saving (they're only for UI)
      const itemsToSave = foodItems.map(({ quantity, originalQuantity, per100g, isCountBased, ...item }) => item);
      
      await DBService.updateLog(meal.id, {
        date,
        mealType,
        foodItems: itemsToSave,
        totalCalories,
        notes: notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-card">
          <h2 className="text-2xl font-bold text-white">Edit Meal</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meal Type
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          {/* Food Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Food Items
              </label>
              <button
                type="button"
                onClick={addFoodItem}
                className="text-sm text-primary hover:text-primary/80"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-3">
              {foodItems.map((item, index) => (
                <div key={index} className="bg-darker p-4 rounded-lg border border-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Item {index + 1}</span>
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
                  <input
                    type="text"
                    placeholder="Food name"
                    value={item.name}
                    onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {item.isCountBased ? 'Quantity (count)' : 'Quantity (grams)'}
                    </label>
                    <input
                      type="number"
                      placeholder={item.isCountBased ? "e.g., 2" : "e.g., 100"}
                      value={quantityInputs[index] ?? String(item.quantity ?? '')}
                      onChange={(e) => {
                        // Update only quantity input state - completely isolated
                        handleQuantityChange(index, e.target.value);
                      }}
                      onBlur={(e) => {
                        // Recalculate only when user finishes editing
                        handleQuantityBlur(index, e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      step="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {item.isCountBased 
                        ? 'Change count to auto-update nutrition values (e.g., 2 eggs)' 
                        : 'Change quantity to auto-update nutrition values (e.g., 150g)'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <input
                      type="number"
                      placeholder="Calories"
                      value={item.calories || ''}
                      onChange={(e) => handleFoodItemChange(index, 'calories', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={item.protein || ''}
                      onChange={(e) => handleFoodItemChange(index, 'protein', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={item.carbs || ''}
                      onChange={(e) => handleFoodItemChange(index, 'carbs', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={item.fat || ''}
                      onChange={(e) => handleFoodItemChange(index, 'fat', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Total Nutrition</span>
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
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Add any notes about this meal..."
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Meal updated successfully!
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMeal;

