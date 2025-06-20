
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export const useRealtime = ({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true
}: UseRealtimeOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      console.log(`Real-time disabled for table: ${table}`);
      return;
    }

    // Create a unique channel name
    const channelName = `realtime-${table}-${Date.now()}`;
    console.log(`Setting up real-time channel: ${channelName} for table: ${table} with filter:`, filter);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log(`Realtime INSERT on ${table}:`, payload);
          onInsert?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log(`Realtime UPDATE on ${table}:`, payload);
          onUpdate?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log(`Realtime DELETE on ${table}:`, payload);
          onDelete?.(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${table}:`, status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log(`Cleaning up real-time channel for ${table}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, onInsert, onUpdate, onDelete, enabled]);

  return channelRef.current;
};

export default useRealtime;
