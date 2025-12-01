import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// IMPORTANT: Vite only exposes environment variables with VITE_ prefix to client code
// This is a security feature to prevent accidentally exposing server-side secrets
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Debug: Log environment variable status (only in development)
if (import.meta.env.DEV) {
  console.log('Environment check:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
    allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Basic fallback for image analysis when API key is missing
 */
const basicImageAnalysis = (): any => {
  console.warn("API key not found. Using basic image analysis fallback.");
  return {
    name: "Food Item",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    confidence: 0,
    note: "Please enter nutritional information manually. API key not configured."
  };
};

/**
 * Analyzes a food image to estimate nutritional info.
 */
export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  // If no API key, return fallback result instead of throwing error
  if (!apiKey || !genAI) {
    console.warn("API key not configured. Using fallback for image analysis.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(basicImageAnalysis());
      }, 500); // Simulate API delay
    });
  }
  
  // Strip header if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(',')[1] || base64Image;

  // Try different model names for image analysis in order of preference
  // Start with most stable/available models first
  const modelNames = ["gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash"];
  let lastError: any = null;
  
  for (const modelName of modelNames) {
    try {
      console.log(`Trying model for image analysis: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const prompt = "Identify the food in this image. Return a JSON object with the food name, estimated calories, and macros (protein, carbs, fat) for the portion shown. If multiple items, sum them up or pick the main one. Format: {\"name\": \"food name\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number, \"confidence\": number}";

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
        { text: prompt },
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log(`Successfully used model: ${modelName}`);
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: try parsing the whole response
      return JSON.parse(text);
    } catch (error: any) {
      lastError = error;
      // Check if it's a 404 (model not found) - try next model
      if (error.message && error.message.includes('404') || error.message && error.message.includes('not found')) {
        console.warn(`Model ${modelName} not available (404), trying next model...`);
        continue;
      }
      // For other errors, log and try next model anyway
      console.warn(`Error with model ${modelName}:`, error.message || error);
      continue;
    }
  }
  
  // If all models failed, return fallback result instead of throwing
  console.error("All models failed for image analysis. Last error:", lastError);
  console.warn("Returning fallback result - user can enter data manually");
  return {
    name: "Food Item",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    confidence: 0,
    note: "Image recognition unavailable. Please enter nutritional information manually."
  };
};

/**
 * Parse multiple food items from text (e.g., "chicken and rice", "100g chicken and 100g rice")
 */
const parseMultipleFoods = (text: string): any[] => {
  const lowerText = text.toLowerCase();
  
  // Clean up common prefixes like "i had", "i ate", "i consumed"
  let cleanedText = text.replace(/^(i\s+(?:had|ate|consumed|drank)\s+)/i, '').trim();
  
  // Split by common conjunctions (order matters - check longer patterns first)
  const separators = [' and ', ' & ', ' with ', ' plus ', ', '];
  let parts: string[] = [cleanedText];
  
  for (const sep of separators) {
    if (lowerText.includes(sep)) {
      // Split and clean each part
      parts = cleanedText.split(new RegExp(sep, 'i')).map(p => p.trim()).filter(p => p.length > 0);
      break;
    }
  }
  
  // If we have multiple parts, parse each
  if (parts.length > 1) {
    const parsedItems = parts.map(part => {
      const parsed = basicFoodParser(part);
      console.log(`Parsed "${part}" ->`, parsed);
      return parsed;
    }).filter(item => item && item.name && item.name.length > 0);
    
    console.log(`Total parsed items: ${parsedItems.length}`, parsedItems);
    return parsedItems.length > 0 ? parsedItems : [basicFoodParser(cleanedText)];
  }
  
  // Single item
  return [basicFoodParser(cleanedText)];
};

/**
 * Basic fallback parser for common food items (when API key is missing)
 * All nutrition values are per 100g unless specified otherwise
 */
const basicFoodParser = (text: string): any => {
  const lowerText = text.toLowerCase();
  
  // Common food database
  // For items with servingSize: values are per serving
  // For items without servingSize: values are per 100g
  const foodDatabase: Record<string, { 
    calories: number; 
    protein: number; 
    carbs: number; 
    fat: number;
    servingSize?: number; // Optional: serving size in grams (for items like eggs, apples)
    isPerServing?: boolean; // If true, values are per serving; if false/undefined, values are per 100g
  }> = {
    'egg': { calories: 70, protein: 6, carbs: 0.6, fat: 5, servingSize: 50, isPerServing: true }, // 1 large egg
    'eggs': { calories: 70, protein: 6, carbs: 0.6, fat: 5, servingSize: 50, isPerServing: true },
    'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 }, // per 100g
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 }, // per 100g
    'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }, // per 100g cooked
    'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }, // per 100g cooked
    'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: 182, isPerServing: true }, // 1 medium apple
    'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: 118, isPerServing: true }, // 1 medium banana
    'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 }, // per 100g
    'sandwich': { calories: 250, protein: 10, carbs: 30, fat: 10, servingSize: 100, isPerServing: true }, // approximate per sandwich
  };

  // Try to find food item - sort by key length (longer = more specific) to match "chicken breast" before "chicken"
  const sortedEntries = Object.entries(foodDatabase).sort((a, b) => b[0].length - a[0].length);
  
  for (const [key, nutrition] of sortedEntries) {
    if (lowerText.includes(key)) {
      // Check for gram quantity (e.g., "10g", "100 grams", "50g of")
      const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\s*(?:of\s+)?/i);
      
      // Check for piece/unit quantity (e.g., "2 eggs", "3 apples")
      const unitMatch = text.match(/(\d+)\s*(?:x|×)?\s*(?:of\s+)?/i);
      
      let multiplier = 1;
      
      if (gramMatch) {
        // Quantity is in grams
        const grams = parseFloat(gramMatch[1]);
        if (nutrition.isPerServing && nutrition.servingSize) {
          // For items measured per serving (like eggs), calculate number of servings
          multiplier = grams / nutrition.servingSize;
        } else {
          // For items measured per 100g, calculate proportion
          multiplier = grams / 100;
        }
      } else if (unitMatch && nutrition.isPerServing && nutrition.servingSize) {
        // Quantity is in units (e.g., "2 eggs", "3 apples")
        const units = parseInt(unitMatch[1]);
        multiplier = units; // Direct multiplier since values are per serving
      } else if (unitMatch && !nutrition.isPerServing) {
        // For items without serving size, treat as multiplier of 100g portions
        const units = parseInt(unitMatch[1]);
        multiplier = units;
      }
      
      // Extract food name - preserve quantity in the name for display
      let foodName = text.trim();
      
      // Extract quantity for display
      let quantityText = '';
      const gramMatchForDisplay = text.match(/(\d+(?:\.\d+)?)\s*(?:grams?|g)/i);
      const unitMatchForDisplay = text.match(/(\d+)\s*(?:x|×)?\s*(?:of\s+)?/i);
      
      if (gramMatchForDisplay) {
        quantityText = `${gramMatchForDisplay[1]}g`;
      } else if (unitMatchForDisplay && nutrition.isPerServing) {
        quantityText = `${unitMatchForDisplay[1]}`;
      }
      
      // Remove quantity patterns to get base food name
      // Pattern 1: "100 grams of" or "100g of" or "100 grams" or "100g"
      const gramPattern = /^\d+(?:\.\d+)?\s*(?:grams?|g)\s*(?:of\s+)?/i;
      if (gramPattern.test(foodName)) {
        foodName = foodName.replace(gramPattern, '').trim();
      }
      // Pattern 2: Unit quantities like "2 eggs" or "2 of eggs" (for per-serving items)
      else if (unitMatch && nutrition.isPerServing) {
        foodName = foodName.replace(/^\d+\s*(?:of\s+)?/i, '').trim();
      }
      // Pattern 3: Generic number at start
      else {
        foodName = foodName.replace(/^\d+(?:\.\d+)?\s*/i, '').trim();
      }
      
      // If empty or too short after removing quantity, use the database key
      if (!foodName || foodName.length < 2) {
        foodName = key.charAt(0).toUpperCase() + key.slice(1);
        // If key is plural (like "eggs"), use singular for display
        if (key.endsWith('s') && key !== 'eggs' && key.length > 3) {
          foodName = foodName.slice(0, -1);
        }
      }
      
      // Clean up any remaining "of" at the start
      foodName = foodName.replace(/^of\s+/i, '').trim();
      
      // Add quantity to name for display (e.g., "Chicken 100g" or "2 Eggs")
      if (quantityText) {
        if (nutrition.isPerServing && (key.includes('egg') || key.includes('apple') || key.includes('banana'))) {
          foodName = `${quantityText} ${foodName}${quantityText !== '1' && !foodName.toLowerCase().endsWith('s') ? 's' : ''}`;
        } else {
          foodName = `${foodName} ${quantityText}`;
        }
      }
      
      return {
        name: foodName,
        calories: Math.round(nutrition.calories * multiplier * 10) / 10,
        protein: Math.round(nutrition.protein * multiplier * 10) / 10,
        carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
        fat: Math.round(nutrition.fat * multiplier * 10) / 10
      };
    }
  }

  // Default fallback - try to extract any number and use generic values
  const anyNumberMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)/i);
  if (anyNumberMatch) {
    const grams = parseFloat(anyNumberMatch[1]);
    // Generic estimate: ~2 calories per gram for mixed foods
    return {
      name: text.trim(),
      calories: Math.round(grams * 2),
      protein: Math.round(grams * 0.2),
      carbs: Math.round(grams * 0.3),
      fat: Math.round(grams * 0.05)
    };
  }

  // Default fallback
  return {
    name: text.trim(),
    calories: 200,
    protein: 10,
    carbs: 20,
    fat: 8
  };
};

/**
 * Parses natural language text into a structured food entry.
 */
export const parseFoodText = async (text: string): Promise<any> => {
  // If no API key, use basic parser
  if (!apiKey || !genAI) {
    console.warn("API key not found. Using basic food parser.");
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if text contains multiple items
        const items = parseMultipleFoods(text);
        resolve(items.length === 1 ? items[0] : items);
      }, 500); // Simulate API delay
    });
  }

  try {
    // Try different model names in order of preference (updated to use available models)
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision", "gemini-pro"];
    let model;
    let lastError;
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });
        console.log(`Using model for text parsing: ${modelName}`);
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
          console.warn(`Model ${modelName} not available (404), trying next...`);
        } else {
          console.warn(`Model ${modelName} error:`, error.message || error);
        }
        continue;
      }
    }
    
    if (!model) {
      console.warn("All Gemini models failed, falling back to basic parser");
      throw lastError || new Error("No compatible model found");
    }

    const prompt = `Extract nutritional information from this text: "${text}". If multiple food items are mentioned (e.g., "chicken and rice", "100g chicken and 100g rice"), return a JSON array with each food item. For each item, include: name, calories, protein, carbs, fat. If only one item, return a single object. Format for multiple: [{"name": "food1", "calories": number, "protein": number, "carbs": number, "fat": number}, {"name": "food2", ...}]. Format for single: {"name": "food name", "calories": number, "protein": number, "carbs": number, "fat": number}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to extract JSON from the response (could be array or object)
    const jsonMatch = responseText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // If it's an array, return it; if single object, wrap in array for consistency
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    
    // Fallback: try parsing the whole response
    try {
      const parsed = JSON.parse(responseText);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // If all else fails, try basic parser with multiple food support
      const items = parseMultipleFoods(text);
      return items.length === 1 ? items[0] : items;
    }
  } catch (error) {
    console.error("Gemini Text Error:", error);
    // Fallback to basic parser on error - check for multiple items
    console.warn("Falling back to basic food parser due to error.");
    const items = parseMultipleFoods(text);
    return items.length === 1 ? items[0] : items;
  }
};

/**
 * Provides basic insights based on logs (fallback when API key is missing)
 */
const generateBasicInsights = (recentLogs: any[]): string => {
  if (recentLogs.length === 0) {
    return "Add some meal logs to get personalized insights!";
  }

  const totalCalories = recentLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0);
  const avgCalories = Math.round(totalCalories / recentLogs.length);
  const totalProtein = recentLogs.reduce((sum, log) => {
    return sum + (log.foodItems?.reduce((s: number, f: any) => s + (f.protein || 0), 0) || 0);
  }, 0);
  const avgProtein = Math.round(totalProtein / recentLogs.length);

  if (avgCalories > 2500) {
    return `You're averaging ${avgCalories} calories per meal. Consider balancing your portions and including more vegetables for better nutrition.`;
  } else if (avgProtein < 20) {
    return `Your average protein intake is ${avgProtein}g per meal. Try adding lean proteins like chicken, fish, or legumes to support muscle health.`;
  } else {
    return `Great job tracking your meals! You're averaging ${avgCalories} calories with ${avgProtein}g of protein per meal. Keep up the consistency!`;
  }
};

/**
 * Provides diet advice based on logs.
 */
export const getDietaryInsights = async (recentLogs: any[]): Promise<string> => {
  // If no API key, use basic insights generator
  if (!apiKey || !genAI) {
    console.warn("API key not found. Using basic insights generator.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateBasicInsights(recentLogs));
      }, 500); // Simulate API delay
    });
  }
  
  const context = JSON.stringify(recentLogs.slice(0, 5)); // Limit context size

  try {
    // Try different model names in order of preference
    const modelNames = ["gemini-pro", "gemini-1.5-pro", "models/gemini-pro"];
    let model;
    let lastError;
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });
        console.log(`Using model for insights: ${modelName}`);
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }
    
    if (!model) {
      throw lastError || new Error("No compatible model found");
    }

    const prompt = `Here are my recent food logs: ${context}. Give me a 2-sentence health tip based on this data. Address the user directly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || generateBasicInsights(recentLogs);
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    // Fallback to basic insights on error
    console.warn("Falling back to basic insights generator due to error.");
    return generateBasicInsights(recentLogs);
  }
};
