import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';

export interface Notification {
  id: number;
  usuario_destino_id: string;
  tipo: string;
  mensaje: string;
  cita_id: number | null;
  leida: boolean;
  creado_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Tracks the active channel so cleanup always targets the right instance.
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_destino_id', user.id)
      .order('creado_at', { ascending: false });

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.leida).length);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Use crypto.randomUUID() when available (secure contexts); fall back to
    // Math.random() for non-secure contexts (e.g. host.docker.internal in dev).
    const uid = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    const channelName = `notificaciones:${user.id}:${uid}`;

    // Build the channel and register the listener BEFORE calling subscribe().
    // Supabase throws if .on() is called after .subscribe() on the same instance.
    const channel = supabase.channel(channelName);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_destino_id=eq.${user.id}`,
      },
      (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    );

    channelRef.current = channel;
    channel.subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_destino_id', user.id)
      .eq('leida', false);

    fetchNotifications();
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
