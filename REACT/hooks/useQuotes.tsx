import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/lib/supabase/types';

type Quote = Tables<'quotes'>;

export interface QuoteDisplay {
  id: string;
  client_name: string;
  client_email: string;
  project_name: string;
  amount: number;
  status: string;
  created_at: string;
  address: string;
  square_footage: number;
  material_cost: number;
  labor_cost: number;
  rebate_amount: number;
  notes: string | null;
  client_phone: string | null;
}

export function useQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all user quotes
  const loadQuotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;
      
      const formattedQuotes: QuoteDisplay[] = (quotesData || []).map(quote => ({
        id: quote.id,
        client_name: quote.client_name,
        client_email: quote.client_email || '',
        project_name: quote.project_name,
        amount: quote.amount || 0,
        status: quote.status,
        created_at: quote.created_at || '',
        address: quote.address || '',
        square_footage: quote.square_footage || 0,
        material_cost: quote.material_cost || 0,
        labor_cost: quote.labor_cost || 0,
        rebate_amount: quote.rebate_amount || 0,
        notes: quote.notes,
        client_phone: quote.client_phone || null,
      }));
      
      setQuotes(formattedQuotes);
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  // Create a new quote
  const createQuote = async (quoteData: {
    client_name: string;
    client_email?: string;
    client_phone?: string;
    project_name: string;
    address?: string;
    square_footage?: number;
    material_cost?: number;
    labor_cost?: number;
    rebate_amount?: number;
    amount?: number;
    status?: string;
    notes?: string;
  }) => {
    if (!user) return null;
    
    try {
      const newQuote = {
        ...quoteData,
        user_id: user.id,
        status: quoteData.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert(newQuote)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const formattedQuote: QuoteDisplay = {
          id: data.id,
          client_name: data.client_name,
          client_email: data.client_email || '',
          project_name: data.project_name,
          amount: data.amount || 0,
          status: data.status,
          created_at: data.created_at || '',
          address: data.address || '',
          square_footage: data.square_footage || 0,
          material_cost: data.material_cost || 0,
          labor_cost: data.labor_cost || 0,
          rebate_amount: data.rebate_amount || 0,
          notes: data.notes,
          client_phone: data.client_phone || null,
        };
        
        setQuotes(prev => [formattedQuote, ...prev]);
        return formattedQuote;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quote');
      return null;
    }
  };

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      ));
      
      return true;
    } catch (err) {
      console.error('Error updating quote status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quote status');
      return false;
    }
  };

  // Delete quote
  const deleteQuote = async (quoteId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
      
      return true;
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete quote');
      return false;
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [user]);

  return {
    quotes,
    loading,
    error,
    loadQuotes,
    createQuote,
    updateQuoteStatus,
    deleteQuote,
  };
}

