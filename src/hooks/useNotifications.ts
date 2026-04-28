import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthProvider'

export interface Notification {
  id: string
  usuario_id: string
  tipo: string
  asunto: string
  contenido: string
  leida: boolean
  creado_at: string
}

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('creado_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
      } else {
        setNotifications(data || [])
        const unread = (data || []).filter(n => !n.leida).length
        setUnreadCount(unread)
      }
      setLoading(false)
    }

    fetchNotifications()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev])
            setUnreadCount((prev) => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            )
            // Update unread count
            const oldNotif = notifications.find((n) => n.id === payload.new.id)
            if (oldNotif?.leida && !payload.new.leida) {
              setUnreadCount((prev) => prev + 1)
            } else if (!oldNotif?.leida && payload.new.leida) {
              setUnreadCount((prev) => prev - 1)
            }
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.leida).map((n) => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .in('id', unreadIds)

    if (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase.from('notificaciones').delete().eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const deleteAllNotifications = async () => {
    if (!user) return

    const { error } = await supabase.from('notificaciones').delete().eq('usuario_id', user.id)

    if (error) {
      console.error('Error deleting all notifications:', error)
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  }
}
