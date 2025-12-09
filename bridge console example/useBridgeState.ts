// src/components/bridge/hooks/useBridgeState.ts
// Real-time state management for Bridge Console using Supabase

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { BridgeState, Contact, BridgeMessage, NewContact, NewMessage } from '@/lib/bridge/bridgeTypes';

export function useBridgeState() {
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<BridgeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // LOAD INITIAL DATA
  // ============================================

  const loadBridgeState = useCallback(async () => {
    const { data, error } = await supabase
      .from('bridge_state')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for new setup
      console.error('Error loading bridge state:', error);
      setError(error.message);
      return null;
    }

    if (data) {
      setBridgeState(data);
      return data;
    }

    // Create initial bridge state if none exists
    const { data: newState, error: createError } = await supabase
      .from('bridge_state')
      .insert({
        mode: 'tactical',
        current_system: 'DRINAX',
        alert_level: 'normal',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating bridge state:', createError);
      setError(createError.message);
      return null;
    }

    setBridgeState(newState);
    return newState;
  }, []);

  const loadContacts = useCallback(async (bridgeStateId: string) => {
    const { data, error } = await supabase
      .from('bridge_contacts')
      .select('*')
      .eq('bridge_state_id', bridgeStateId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading contacts:', error);
      return;
    }

    setContacts(data || []);
  }, []);

  const loadMessages = useCallback(async (bridgeStateId: string) => {
    const { data, error } = await supabase
      .from('bridge_messages')
      .select('*')
      .eq('bridge_state_id', bridgeStateId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const state = await loadBridgeState();
      if (state) {
        await Promise.all([
          loadContacts(state.id),
          loadMessages(state.id),
        ]);
      }
      setLoading(false);
    };

    init();
  }, [loadBridgeState, loadContacts, loadMessages]);

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  useEffect(() => {
    if (!bridgeState?.id) return;

    const channel = supabase
      .channel('bridge-realtime')
      // Bridge state changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bridge_state',
          filter: `id=eq.${bridgeState.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setBridgeState(payload.new as BridgeState);
          }
        }
      )
      // Contact changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bridge_contacts',
          filter: `bridge_state_id=eq.${bridgeState.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setContacts((prev) => [...prev, payload.new as Contact]);
          } else if (payload.eventType === 'UPDATE') {
            setContacts((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Contact) : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setContacts((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      // New messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bridge_messages',
          filter: `bridge_state_id=eq.${bridgeState.id}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as BridgeMessage, ...prev]);
        }
      )
      // Message updates (read status)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bridge_messages',
          filter: `bridge_state_id=eq.${bridgeState.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as BridgeMessage) : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bridgeState?.id]);

  // ============================================
  // SHIP/CONTACT ACTIONS
  // ============================================

  const moveShip = useCallback(async (contactId: string, hexQ: number, hexR: number) => {
    const { error } = await supabase
      .from('bridge_contacts')
      .update({ hex_q: hexQ, hex_r: hexR })
      .eq('id', contactId);

    if (error) {
      console.error('Error moving ship:', error);
    }
  }, []);

  const addContact = useCallback(async (contact: NewContact) => {
    if (!bridgeState?.id) return;

    const { error } = await supabase
      .from('bridge_contacts')
      .insert({
        bridge_state_id: bridgeState.id,
        name: contact.name,
        ship_class: contact.ship_class,
        tonnage: contact.tonnage,
        status: contact.status,
        hex_q: contact.hex_q ?? 0,
        hex_r: contact.hex_r ?? 0,
        facing: contact.facing ?? 0,
        hull_current: contact.hull_current,
        hull_max: contact.hull_max,
        is_player_ship: contact.is_player_ship ?? false,
        vehicle_id: contact.vehicle_id,
      });

    if (error) {
      console.error('Error adding contact:', error);
    }
  }, [bridgeState?.id]);

  const removeContact = useCallback(async (contactId: string) => {
    const { error } = await supabase
      .from('bridge_contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      console.error('Error removing contact:', error);
    }
  }, []);

  const updateContactStatus = useCallback(async (
    contactId: string, 
    status: 'friendly' | 'unknown' | 'enemy'
  ) => {
    const { error } = await supabase
      .from('bridge_contacts')
      .update({ status })
      .eq('id', contactId);

    if (error) {
      console.error('Error updating contact status:', error);
    }
  }, []);

  const updateContactFacing = useCallback(async (contactId: string, facing: number) => {
    const { error } = await supabase
      .from('bridge_contacts')
      .update({ facing })
      .eq('id', contactId);

    if (error) {
      console.error('Error updating contact facing:', error);
    }
  }, []);

  const updateContactHull = useCallback(async (contactId: string, hullCurrent: number) => {
    const { error } = await supabase
      .from('bridge_contacts')
      .update({ hull_current: hullCurrent })
      .eq('id', contactId);

    if (error) {
      console.error('Error updating hull:', error);
    }
  }, []);

  // ============================================
  // MESSAGE ACTIONS
  // ============================================

  const sendMessage = useCallback(async (
    sender: string, 
    content: string, 
    priority: string = 'normal',
    encrypted: boolean = false,
    encryptionDifficulty?: number
  ) => {
    if (!bridgeState?.id) return;

    const { error } = await supabase
      .from('bridge_messages')
      .insert({
        bridge_state_id: bridgeState.id,
        sender,
        content,
        priority,
        encrypted,
        encryption_difficulty: encryptionDifficulty,
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  }, [bridgeState?.id]);

  const markMessageRead = useCallback(async (messageId: string) => {
    const { error } = await supabase
      .from('bridge_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message read:', error);
    }
  }, []);

  // ============================================
  // BRIDGE STATE ACTIONS
  // ============================================

  const updateAlertLevel = useCallback(async (
    level: 'normal' | 'elevated' | 'combat' | 'emergency'
  ) => {
    if (!bridgeState?.id) return;

    const { error } = await supabase
      .from('bridge_state')
      .update({ alert_level: level, updated_at: new Date().toISOString() })
      .eq('id', bridgeState.id);

    if (error) {
      console.error('Error updating alert level:', error);
    }
  }, [bridgeState?.id]);

  const updateNavigation = useCallback(async (
    currentSystem: string, 
    destination?: string, 
    eta?: string
  ) => {
    if (!bridgeState?.id) return;

    const { error } = await supabase
      .from('bridge_state')
      .update({ 
        current_system: currentSystem,
        destination,
        eta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bridgeState.id);

    if (error) {
      console.error('Error updating navigation:', error);
    }
  }, [bridgeState?.id]);

  const setMode = useCallback(async (mode: 'tactical' | 'navigation') => {
    if (!bridgeState?.id) return;

    const { error } = await supabase
      .from('bridge_state')
      .update({ mode, updated_at: new Date().toISOString() })
      .eq('id', bridgeState.id);

    if (error) {
      console.error('Error setting mode:', error);
    }
  }, [bridgeState?.id]);

  // ============================================
  // RETURN HOOK VALUE
  // ============================================

  return {
    // State
    bridgeState,
    contacts,
    messages,
    loading,
    error,
    
    // Ship/Contact actions
    moveShip,
    addContact,
    removeContact,
    updateContactStatus,
    updateContactFacing,
    updateContactHull,
    
    // Message actions
    sendMessage,
    markMessageRead,
    
    // Bridge state actions
    updateAlertLevel,
    updateNavigation,
    setMode,
    
    // Refresh functions
    refresh: async () => {
      if (bridgeState?.id) {
        await Promise.all([
          loadContacts(bridgeState.id),
          loadMessages(bridgeState.id),
        ]);
      }
    },
  };
}
