import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes } from '@/hooks/useQuotes';

function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}

export default function AllQuotes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { quotes, loading } = useQuotes();

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const matchesSearch = !searchQuery || 
        quote.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quote.status?.toLowerCase() === statusFilter.toLowerCase();
      
      let matchesDate = true;
      if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = quote.created_at ? new Date(quote.created_at) >= sevenDaysAgo : false;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = quote.created_at ? new Date(quote.created_at) >= thirtyDaysAgo : false;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [quotes, searchQuery, statusFilter, dateFilter]);

  if (loading) {
    return (
      <SafeAreaView edges={['top','bottom']} style={[{ backgroundColor: '#FFFFFF' }, styles.container]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7cd35c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={[{ backgroundColor: '#FFFFFF' }, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Quotes</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name, project..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <FilterChips
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </View>

      {/* Quote List */}
      <View style={styles.content}>
        {filteredQuotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="filter-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No quotes found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredQuotes}
            renderItem={({ item }) => <QuoteCard quote={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function FilterChips({ statusFilter, setStatusFilter, dateFilter, setDateFilter }: {
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}) {
  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'sent', label: 'Sent' },
    { value: 'approved', label: 'Approved' },
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
  ];

  return (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
      >
        {statusFilters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setStatusFilter(filter.value)}
            style={[
              styles.chip,
              statusFilter === filter.value && styles.chipActive
            ]}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === filter.value && styles.chipTextActive
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
      >
        {dateFilters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setDateFilter(filter.value)}
            style={[
              styles.chip,
              dateFilter === filter.value && styles.chipDateActive
            ]}
          >
            <Text
              style={[
                styles.chipText,
                dateFilter === filter.value && styles.chipDateTextActive
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function QuoteCard({ quote }: { quote: any }) {
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
          <Text style={styles.dateText}>{formatShortDate(quote.created_at)}</Text>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    gap: 8,
    // Ensure vertical alignment is applied to the inner content, not the ScrollView itself
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateRow: {
    marginTop: 0,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#7cd35c',
  },
  chipDateActive: {
    backgroundColor: '#1F2937',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipDateTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});