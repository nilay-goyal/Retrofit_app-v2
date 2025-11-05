import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/lib/supabase/types';

type Profile = Tables<'profiles'>;

export interface SettingsData {
  profile: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  preferences: {
    notifications: boolean;
    emailNotifications: boolean;
  };
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    preferences: {
      notifications: true,
      emailNotifications: true,
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile data
  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If no profile exists, create one
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: '',
              email: user.email || '',
              phone: '',
              company: '',
              notifications_enabled: true,
              email_notifications: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) throw insertError;
          
          setSettings({
            profile: {
              name: newProfile.full_name || '',
              email: newProfile.email || '',
              phone: newProfile.phone || '',
              company: newProfile.company || '',
            },
            preferences: {
              notifications: newProfile.notifications_enabled ?? true,
              emailNotifications: newProfile.email_notifications ?? true,
            },
          });
        } else {
          throw profileError;
        }
      } else {
        setSettings({
          profile: {
            name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            company: profile.company || '',
          },
          preferences: {
            notifications: profile.notifications_enabled ?? true,
            emailNotifications: profile.email_notifications ?? true,
          },
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Save settings to database
  const saveSettings = async (updatedSettings: SettingsData) => {
    if (!user) return false;
    
    try {
      setSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedSettings.profile.name,
          email: updatedSettings.profile.email,
          phone: updatedSettings.profile.phone,
          company: updatedSettings.profile.company,
          notifications_enabled: updatedSettings.preferences.notifications,
          email_notifications: updatedSettings.preferences.emailNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  return {
    settings,
    loading,
    saving,
    error,
    loadSettings,
    saveSettings,
  };
}

