// Type definitions for i18n translations
export interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    continue: string;
    yes: string;
    no: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    signInWith: string;
    noAccount: string;
    haveAccount: string;
    enterEmail: string;
    loggingIn: string;
    name: string;
    fullName: string;
  };
  navigation: {
    dashboard: string;
    workouts: string;
    nutrition: string;
    progress: string;
    profile: string;
  };
  setup: {
    title: string;
    welcome: string;
    letsStart: string;
    age: string;
    selectAge: string;
    years: string;
    gender: string;
    selectGender: string;
    male: string;
    female: string;
    other: string;
    height: string;
    selectHeight: string;
    cm: string;
    weight: string;
    selectWeight: string;
    kg: string;
    goal: string;
    selectGoal: string;
    loseWeight: string;
    gainMuscle: string;
    stayFit: string;
    completeSetup: string;
  };
  workouts: {
    title: string;
    myWorkouts: string;
    generateWorkout: string;
    startWorkout: string;
    finishWorkout: string;
    pauseWorkout: string;
    resumeWorkout: string;
    exercise: string;
    exercises: string;
    sets: string;
    reps: string;
    weight: string;
    rest: string;
    duration: string;
    completed: string;
    inProgress: string;
    notStarted: string;
  };
  nutrition: {
    title: string;
    myMeals: string;
    addMeal: string;
    searchFood: string;
    scanFood: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    generateDiet: string;
    myDiet: string;
  };
  profile: {
    title: string;
    personalInfo: string;
    settings: string;
    editProfile: string;
    changePassword: string;
    language: string;
    theme: string;
    notifications: string;
    privacy: string;
    terms: string;
    about: string;
    version: string;
  };
  progress: {
    title: string;
    weight: string;
    bodyFat: string;
    muscle: string;
    measurements: string;
    photos: string;
    stats: string;
    weeklyProgress: string;
    monthlyProgress: string;
  };
}

export type Language = 'es' | 'en' | 'fr' | 'pt';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}
