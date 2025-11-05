import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { signOut } = useAuth();
  const { settings, loading, saving, saveSettings } = useSettings();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'business-outline' },
    { id: 'materials', label: 'Materials', icon: 'cube-outline' },
    { id: 'preferences', label: 'Preferences', icon: 'settings-outline' },
  ];

  if (loading) {
    return (
      <SafeAreaView edges={['top','bottom']} style={[{ backgroundColor: '#7cd35c' }, styles.container]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={[{ backgroundColor: '#7cd35c' }, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.id ? '#7cd35c' : '#9CA3AF'} 
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'profile' && <ProfileSection settings={settings} saving={saving} saveSettings={saveSettings} />}
        {activeTab === 'materials' && <MaterialsLibrary />}
        {activeTab === 'preferences' && <PreferencesSection settings={settings} saving={saving} saveSettings={saveSettings} />}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Logout Button - Fixed at bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProfileSection({ settings, saving, saveSettings }: { settings: any; saving: boolean; saveSettings: (settings: any) => Promise<boolean> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: settings.profile.name,
    company: settings.profile.company,
    phone: settings.profile.phone,
    email: settings.profile.email,
  });

  const handleSave = async () => {
    const updatedSettings = {
      ...settings,
      profile: {
        ...settings.profile,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
      },
    };
    const success = await saveSettings(updatedSettings);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Company Profile</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="business" size={32} color="#9CA3AF" />
          </View>
          <TouchableOpacity style={styles.changeLogoButton}>
            <Text style={styles.changeLogoText}>Change Logo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              editable={isEditing}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function MaterialsLibrary() {
  const [materials] = useState([
    { id: '1', name: 'Fiberglass Batt', cost_per_sqft: 1.25 },
    { id: '2', name: 'Spray Foam', cost_per_sqft: 3.50 },
    { id: '3', name: 'Cellulose', cost_per_sqft: 0.85 },
  ]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Materials Library</Text>
      
      <View style={styles.materialsCard}>
        {materials.map(material => (
          <View key={material.id} style={styles.materialItem}>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{material.name}</Text>
              <Text style={styles.materialCost}>${material.cost_per_sqft}/sqft</Text>
            </View>
            <View style={styles.materialActions}>
              <TouchableOpacity style={styles.editIcon}>
                <Ionicons name="pencil" size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteIcon}>
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMaterialButton}>
          <Ionicons name="add" size={20} color="#7cd35c" />
          <Text style={styles.addMaterialText}>Add New Material</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PreferencesSection({ settings, saving, saveSettings }: { settings: any; saving: boolean; saveSettings: (settings: any) => Promise<boolean> }) {
  const [unitSystem, setUnitSystem] = useState('imperial');
  const [defaultLaborRate, setDefaultLaborRate] = useState('2.5');
  const [notifications, setNotifications] = useState(settings.preferences.notifications);

  const handleSavePreferences = async () => {
    const updatedSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        notifications: notifications,
      },
    };
    await saveSettings(updatedSettings);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      
      <View style={styles.preferencesCard}>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Notifications</Text>
          <TouchableOpacity
            style={[
              styles.toggleSwitch,
              notifications && styles.toggleSwitchActive
            ]}
            onPress={() => {
              const newValue = !notifications;
              setNotifications(newValue);
              handleSavePreferences();
            }}
          >
            <Text style={[
              styles.toggleSwitchText,
              notifications && styles.toggleSwitchTextActive
            ]}>
              {notifications ? 'Enabled' : 'Disabled'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Unit System</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                unitSystem === 'imperial' && styles.toggleOptionActive
              ]}
              onPress={() => setUnitSystem('imperial')}
            >
              <Text style={[
                styles.toggleText,
                unitSystem === 'imperial' && styles.toggleTextActive
              ]}>
                Imperial (ft)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                unitSystem === 'metric' && styles.toggleOptionActive
              ]}
              onPress={() => setUnitSystem('metric')}
            >
              <Text style={[
                styles.toggleText,
                unitSystem === 'metric' && styles.toggleTextActive
              ]}>
                Metric (m)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Default Labor Rate</Text>
          <TextInput
            style={styles.rateInput}
            value={defaultLaborRate}
            onChangeText={setDefaultLaborRate}
            keyboardType="decimal-pad"
            placeholder="2.5"
          />
          <Text style={styles.rateUnit}>per sqft</Text>
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>PDF Footer Text</Text>
          <TextInput
            style={[styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Enter terms and conditions..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7cd35c',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    marginTop: 0,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A7F3D0',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7cd35c',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#7cd35c',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7cd35c',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changeLogoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  changeLogoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#7cd35c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#7cd35c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  materialsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  materialCost: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  materialActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editIcon: {
    padding: 8,
  },
  deleteIcon: {
    padding: 8,
  },
  addMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7cd35c',
    borderRadius: 8,
    height: 48,
    gap: 8,
    marginTop: 12,
  },
  addMaterialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7cd35c',
  },
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceItem: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleOptionActive: {
    backgroundColor: '#7cd35c',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  rateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    width: 100,
  },
  rateUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 8,
    height: 56,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  toggleSwitch: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  toggleSwitchActive: {
    backgroundColor: '#7cd35c',
    borderColor: '#7cd35c',
  },
  toggleSwitchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleSwitchTextActive: {
    color: '#FFFFFF',
  },
});