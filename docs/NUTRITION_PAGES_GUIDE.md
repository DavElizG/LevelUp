# Nutrition Pages Guide

## Overview
The app has **two complementary pages** for nutrition tracking, each serving a different purpose:

---

## 1. 📊 Nutrition Page (`/nutrition`)
**Purpose:** Daily nutrition dashboard and quick overview

### Features:
- **Daily Summary Card**
  - Circular calorie progress indicator (current / goal)
  - Macro breakdown with progress bars (Protein, Carbs, Fat)
  - Real-time calculations from all meals
  
- **Quick Actions**
  - "Agregar Comida" - Direct to food search
  - "Foto con IA" - Direct to photo analyzer

- **Meals Overview (Comidas de Hoy)**
  - Shows all 4 meal types (Desayuno, Almuerzo, Merienda, Cena)
  - Displays food names and quantities for each meal
  - Shows total calories per meal type
  - Quick "+ Agregar" buttons for each meal
  - Visual icons and color coding

- **Water Intake Section**
  - 8 interactive glasses (250ml each)
  - Progress bar showing current / goal (2.5L)
  - Click to add/remove glasses
  - Persistent tracking throughout the day

### User Flow:
```
Nutrition Page → View daily summary → Click "+ Agregar" on specific meal → 
Food Search → Select food → Returns to Nutrition with updated data
```

---

## 2. 📝 MealLog Page (`/meal-log`)
**Purpose:** Detailed meal registration and history

### Features:
- **Photo Upload Button (Prominent)**
  - Full-width purple button with camera icon
  - "Tomar foto de comida (IA)"
  - Direct navigation to photo analyzer

- **Quick Add Buttons (Grid)**
  - 4 colored buttons for each meal type:
    - 🎨 Pink: Desayuno (Breakfast)
    - 🎨 Green: Almuerzo (Lunch)
    - 🎨 Blue: Merienda (Snack)
    - 🎨 Gray: Cena (Dinner)

- **Meal History Cards**
  - Grouped by meal type (Breakfast, Lunch, Snack, Dinner)
  - Shows each meal entry with:
    - Food name
    - Quantity in grams
    - Macros: Protein, Carbs, Fat
    - Total calories
    - Exact timestamp (HH:MM)
  - "Sin registros" when meal type is empty

### User Flow:
```
MealLog Page → Click "+ Agregar [Meal Type]" → Food Search → 
Select food → Returns to MealLog with detailed entry
```

---

## Key Differences

| Feature | Nutrition Page | MealLog Page |
|---------|---------------|--------------|
| **Focus** | Overview & Goals | Detailed Entry & History |
| **Calories Display** | Total daily with circular progress | Per-entry with timestamps |
| **Macros** | Total with progress bars | Per-entry breakdown |
| **Water Tracking** | ✅ Interactive glasses | ❌ Not shown |
| **Meal Grouping** | Summarized by type | Individual entries visible |
| **Primary Action** | View progress | Log new meals |
| **Photo Button** | Secondary (purple card) | Primary (full-width top) |

---

## Navigation Flow

```
Bottom Navbar "Nutrition" → Nutrition Page
                              ↓
                         [Agregar Comida]
                              ↓
                         Food Search
                              ↓
                         Select Food
                              ↓
                    Returns to Nutrition ✅

Bottom Navbar "Nutrition" → swipe/navigate → MealLog Page
                              ↓
                         [+ Agregar Desayuno]
                              ↓
                         Food Search (with mealType)
                              ↓
                         Select Food
                              ↓
                    Returns to MealLog ✅
```

---

## Why Two Pages?

### User Experience Design Rationale:

1. **Separation of Concerns**
   - **Nutrition Page**: "How am I doing today?" (goals, progress, overview)
   - **MealLog Page**: "What did I eat and when?" (details, history, logging)

2. **Different Mental Models**
   - Nutrition Page = Dashboard (glance, quick actions)
   - MealLog Page = Journal (detailed records, chronological)

3. **Reduced Cognitive Load**
   - Nutrition: Simple, visual, motivational
   - MealLog: Detailed, precise, reference

4. **Task-Oriented Design**
   - Want to check progress? → Nutrition
   - Want to log a meal? → MealLog
   - Want to review what you ate? → MealLog

---

## Recent Fixes Applied

### Problem: Duplicate Keys Warning
```
Encountered two children with the same key, `c07fa5f0-0ff1-...`
```

### Root Cause:
Queries were fetching **all users' meals** instead of just the current user's meals, causing:
- Same meal IDs appearing multiple times
- React key collisions
- Data from other users showing up

### Solution:
Added user filtering to all queries:

```typescript
// Before (WRONG - fetches all users)
const { data } = await supabase
  .from('meal_logs')
  .select('*')
  .gte('logged_at', start.toISOString());

// After (CORRECT - only current user)
const { data } = await supabase
  .from('meal_logs')
  .select('*')
  .eq('user_id', userId)  // ✅ Filter by user
  .gte('logged_at', start.toISOString());
```

Applied to:
- ✅ MealLog.tsx - `fetchTodaysMeals()`
- ✅ Nutrition.tsx - `fetchData()` (meals query)
- ✅ Nutrition.tsx - `fetchData()` (water query)

---

## Best Practices

### When Adding New Features:

1. **Always filter by user_id** in queries
   ```typescript
   .eq('user_id', userId)
   ```

2. **Use unique keys** in React lists
   ```tsx
   {meals.map(meal => (
     <div key={meal.id}>  {/* id is UUID from database */}
   ```

3. **Handle null user_id gracefully**
   ```typescript
   if (userId) {
     query = query.eq('user_id', userId);
   }
   ```

4. **Maintain data consistency** between pages
   - Both pages should show the same data
   - Use the same queries (date range, filters)
   - Refresh data after mutations

---

## Testing Checklist

- [ ] Login as User A, add meals
- [ ] Login as User B, verify User A's meals don't show
- [ ] Add meal from Nutrition page → verify appears in MealLog
- [ ] Add meal from MealLog page → verify appears in Nutrition
- [ ] Check console for duplicate key warnings (should be none)
- [ ] Verify calorie totals match between pages
- [ ] Test water tracking (only on Nutrition page)
- [ ] Test photo analyzer from both pages

---

## Future Enhancements

### Nutrition Page:
- [ ] Editable goals (calorie, macros, water)
- [ ] Historical chart (last 7 days)
- [ ] Meal recommendations based on remaining macros
- [ ] Export daily report

### MealLog Page:
- [ ] Edit individual meal entries
- [ ] Delete meal entries
- [ ] Filter by date (calendar picker)
- [ ] Search within meal history
- [ ] Duplicate previous meals
- [ ] Meal templates/favorites

---

## Conclusion

Both pages work together to provide a **complete nutrition tracking experience**:
- **Nutrition Page** = "Dashboard view" (progress, motivation, quick actions)
- **MealLog Page** = "Detail view" (history, logging, precision)

Users naturally flow between both depending on their current task, creating an intuitive and efficient workflow.
