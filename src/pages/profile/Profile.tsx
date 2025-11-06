import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import BottomNavbar from '../../components/shared/BottomNavbar';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoView from './components/PersonalInfoView';
import PhysicalStats from './components/PhysicalStats';
import FitnessGoal from './components/FitnessGoal';
import SettingsSection from './components/SettingsSection';
import LogoutButton from './components/LogoutButton';
import PersonalInfoForm from './components/PersonalInfoForm';
import ProfileSkeleton from './components/ProfileSkeleton';
import { cn } from '../../shared/utils/themeUtils';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { 
    formData, 
    loading, 
    error, 
    isSaving, 
    updateFormData, 
    saveProfile, 
    resetForm 
  } = useProfile(user?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData(field, value);
    // Clear messages when user starts typing
    if (error || successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      resetForm();
      setSuccessMessage(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    
    const success = await saveProfile();
    if (success) {
      setSuccessMessage(t('profile.profileUpdated'));
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error(t('profile.logoutError'), error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className={cn(
      "min-h-screen pb-24",
      "bg-gradient-to-br from-orange-50 via-white to-purple-50",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
    )}>
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Header */}
        <ProfileHeader />

        {/* Messages */}
        {error && (
          <div className={cn(
            "mb-4 sm:mb-6 p-4 border-l-4 rounded-lg shadow-sm animate-pulse",
            "bg-red-50 border-red-500",
            "dark:bg-red-900/20 dark:border-red-400",
            "high-contrast:bg-red-900/30 high-contrast:border-red-500 high-contrast:border-l-8"
          )}>
            <div className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                "bg-red-100 dark:bg-red-800 high-contrast:bg-red-700"
              )}>
                <svg className={cn(
                  "w-4 h-4",
                  "text-red-500 dark:text-red-300 high-contrast:text-white"
                )} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <p className={cn(
                "text-sm sm:text-base font-medium",
                "text-red-700 dark:text-red-300 high-contrast:text-white"
              )}>{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className={cn(
            "mb-4 sm:mb-6 p-4 border-l-4 rounded-lg shadow-sm animate-pulse",
            "bg-green-50 border-green-500",
            "dark:bg-green-900/20 dark:border-green-400",
            "high-contrast:bg-green-900/30 high-contrast:border-green-500 high-contrast:border-l-8"
          )}>
            <div className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                "bg-green-100 dark:bg-green-800 high-contrast:bg-green-700"
              )}>
                <svg className={cn(
                  "w-4 h-4",
                  "text-green-500 dark:text-green-300 high-contrast:text-white"
                )} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <p className={cn(
                "text-sm sm:text-base font-medium",
                "text-green-700 dark:text-green-300 high-contrast:text-white"
              )}>{successMessage}</p>
            </div>
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-6">
            {/* Personal Info View */}
            <PersonalInfoView
              name={formData.name}
              lastname1={formData.lastname1}
              lastname2={formData.lastname2}
              age={formData.age}
              gender={formData.gender}
              email={user?.email || ''}
              onEdit={handleEditToggle}
            />
            
            {/* Physical Stats */}
            <PhysicalStats
              weight={formData.current_weight_kg}
              height={formData.height_cm}
            />
            
            {/* Fitness Goal */}
            <FitnessGoal goal={formData.fitness_goal} />
            
            {/* Settings Section */}
            <SettingsSection />
            
            {/* Logout Button */}
            <LogoutButton
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          </div>
        ) : (
          <PersonalInfoForm
            formData={formData}
            isSaving={isSaving}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleEditToggle}
          />
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Profile;