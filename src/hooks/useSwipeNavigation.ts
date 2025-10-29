import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Define the order of sections for swipe navigation (like Instagram stories)
const SECTIONS = [
  { path: '/', name: 'Home' },
  { path: '/workouts', name: 'Workouts' },
  { path: '/nutrition', name: 'Nutrition' },
  { path: '/progress', name: 'Progress' },
  { path: '/profile', name: 'Profile' }
];

export const useSwipeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentIndex = useCallback(() => {
    // Find current section index, handle both exact paths and nested paths
    const currentPath = location.pathname;
    
    const currentIndex = SECTIONS.findIndex(section => 
      currentPath === section.path || 
      (section.path !== '/' && currentPath.startsWith(section.path))
    );
    
    // If not found in SECTIONS (nested route), don't navigate
    if (currentIndex === -1) {
      return null;
    }
    
    return currentIndex;
  }, [location.pathname]);

  const navigateToNext = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex === null) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < SECTIONS.length) {
      navigate(SECTIONS[nextIndex].path);
    }
  }, [getCurrentIndex, navigate]);

  const navigateToPrevious = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex === null) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      navigate(SECTIONS[prevIndex].path);
    }
  }, [getCurrentIndex, navigate]);

  return {
    navigateToNext,
    navigateToPrevious,
    currentSection: SECTIONS[getCurrentIndex() ?? 0],
    canSwipeNext: (getCurrentIndex() ?? 0) < SECTIONS.length - 1,
    canSwipePrevious: (getCurrentIndex() ?? 0) > 0,
  };
};
