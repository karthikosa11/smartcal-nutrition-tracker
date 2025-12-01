import React, { useState, useEffect } from 'react';
import { MealLog } from '../types';
import { getDietaryInsights } from '../services/geminiService';

interface InsightsProps {
  logs: MealLog[];
}

export const Insights: React.FC<InsightsProps> = ({ logs }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (logs.length > 0) {
      setLoading(true);
      getDietaryInsights(logs)
        .then((insight) => {
          setInsight(insight);
        })
        .catch((error) => {
          console.error("Error getting insights:", error);
          setInsight("Keep tracking your meals to get better insights!");
        })
        .finally(() => setLoading(false));
    } else {
      setInsight(null);
    }
  }, [logs]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl shadow-2xl border border-indigo-700 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-600 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-600 blur-3xl opacity-20"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-3xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">AI Nutritionist Analysis</h2>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
            </div>
          ) : (
            <p className="text-lg text-indigo-100 leading-relaxed italic">
              "{insight || "Add some meal logs to get personalized AI insights!"}"
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center space-x-8 text-sm text-indigo-200">
            <div>
              <span className="block font-bold text-white text-lg">{logs.length}</span>
              Data Points Analyzed
            </div>
            <div>
              <span className="block font-bold text-white text-lg">Gemini 2.5</span>
              Model Version
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;