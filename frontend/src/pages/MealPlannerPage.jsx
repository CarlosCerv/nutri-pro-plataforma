/**
 * pages/MealPlannerPage.jsx
 * Página de ejemplo para integrar el DailyMealPlanner en la aplicación NutriPro
 */

import React from 'react';
import DailyMealPlanner from '../components/DailyMealPlanner';

export const MealPlannerPage = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <DailyMealPlanner />
    </main>
  );
};

export default MealPlannerPage;
