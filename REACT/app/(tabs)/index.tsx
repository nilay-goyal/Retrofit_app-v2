import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useQuotes } from '@/hooks/useQuotes';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { quotes, loading } = useQuotes();

  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent').length;
  const approvedRevenue = quotes
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + (q.amount || 0), 0);

  // Get user profile info
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const companyName = 'Retrofit Insulation'; // TODO: Get from profile

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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1, backgroundColor: '#7cd35c' }}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}
            </Text>
            <Text style={styles.companyText}>
              {companyName}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            icon="document-text"
            value={totalQuotes}
            label="Total Quotes"
            color="#7cd35c"
          />
          <StatsCard
            icon="time"
            value={pendingQuotes}
            label="Pending"
            color="#FF8C42"
          />
          <StatsCard
            icon="cash"
            value={`$${(approvedRevenue / 1000).toFixed(1)}k`}
            label="Revenue"
            color="#7cd35c"
          />
        </View>

        {/* Recent Quotes */}
        <View style={styles.quotesSection}>
          <View style={styles.quotesSectionHeader}>
            <Text style={styles.sectionTitle}>Recent Quotes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/quotes')}>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#7cd35c" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.quotesListContainer}>
            {quotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No quotes yet</Text>
                <TouchableOpacity
                  style={styles.createFirstButton}
                  onPress={() => router.push('/(tabs)/new-quote')}
                >
                  <Text style={styles.createFirstButtonText}>Create Your First Quote</Text>
                </TouchableOpacity>
              </View>
            ) : (
              quotes.slice(0, 3).map(quote => (
                <QuoteCard key={quote.id} quote={quote} />
              ))
            )}
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

function StatsCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <View style={styles.statsCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

function QuoteCard({ quote }: { quote: any }) {
  const router = useRouter();

  const statusColors = {
    draft: { bg: '#F3F4F6', text: '#6B7280', label: 'Draft' },
    sent: { bg: '#DBEAFE', text: '#2563EB', label: 'Sent' },
    approved: { bg: '#D1FAE5', text: '#059669', label: 'Approved' },
  };

  const status = statusColors[quote.status?.toLowerCase() as keyof typeof statusColors] || statusColors.draft;

  return (
    <TouchableOpacity
      style={styles.quoteCard}
      onPress={() => {
        // Navigate to quote details when implemented
        console.log('Navigate to quote details:', quote.id);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.projectName} numberOfLines={1}>
            {quote.project_name || quote.client_name}
          </Text>
          <View style={styles.clientRow}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.clientText} numberOfLines={1}>
              {quote.client_name}
            </Text>
          </View>
          {quote.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.addressText} numberOfLines={1}>
                {quote.address}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            {quote.created_at ? new Date(quote.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'Unknown'}
          </Text>
        </View>
        <Text style={styles.totalAmount}>
          ${quote.amount?.toLocaleString() || '0'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7cd35c',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 0,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7cd35c',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyText: {
    fontSize: 14,
    color: '#A7F3D0',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
    gap: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  quotesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quotesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7cd35c',
    marginRight: 4,
  },
  quotesListContainer: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 16,
  },
  createFirstButton: {
    backgroundColor: '#7cd35c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7cd35c',
  },
  missionCard: {
    // removed
  },
  missionText: {
    // removed
  },
  missionBold: {
    // removed
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});