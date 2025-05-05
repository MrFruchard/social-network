"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';

// Types pour les notifications
export type NotificationType = 'LIKE' | 'DISLIKE' | 'COMMENT' | 'COMMENT_LIKE' | 'COMMENT_DISLIKE' | 'ASK_FOLLOW' | 'INVITE_GROUP';

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  profilePic: string;
}

export interface LikeData {
  post_id: string;
  content: string;
  image_url: string;
  created_at: string;
  user: User;
}

export interface CommentData {
  comment_id: string;
  post_id: string;
  content: string;
  image_url: string;
  created_at: string;
  user: User;
}

export interface FollowRequestData {
  follower_id?: string;  // Facultatif car certaines réponses peuvent ne pas l'inclure
  created_at: string;
  sender: User;
  // Si follower_id est absent, on peut utiliser sender.id à la place
}

export interface GroupInviteData {
  group_id: string;
  group_name: string;
  group_bio: string;
  created_at: string;
  user: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  data: LikeData | CommentData | FollowRequestData | GroupInviteData;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isConnected, messages } = useWebSocket();

  // Récupérer les notifications depuis l'API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:80/api/notification', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Validation supplémentaire pour s'assurer que les données sont bien formatées
      if (Array.isArray(data)) {
        // Vérifier et nettoyer les données si nécessaire
        const cleanedData = data.map((notif: Notification) => {
          // S'assurer que les notifications de type ASK_FOLLOW ont les bons champs
          if (notif.type === 'ASK_FOLLOW' && notif.data) {
            // Vérifier que sender existe et a un id
            if (!notif.data.sender || !notif.data.sender.id) {
              console.warn('Notification ASK_FOLLOW mal formatée:', notif);
            }
          }
          return notif;
        });
        
        setNotifications(cleanedData);
        
        // Calculer le nombre de notifications non lues
        const unread = cleanedData.filter((notif: Notification) => !notif.read).length;
        setUnreadCount(unread);
      } else {
        console.error('Format de données de notification invalide:', data);
        setNotifications([]);
        setUnreadCount(0);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Utiliser la nouvelle API pour marquer une notification comme lue
      const response = await fetch(`http://localhost:80/api/notification?id=${notificationId}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Mettre à jour l'état local après confirmation du serveur
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        
        // Mettre à jour le compteur de non lues
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        console.log(`Notification ${notificationId} marquée comme lue`);
      } else {
        console.error(`Erreur lors du marquage de la notification: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      // Utiliser l'API pour marquer toutes les notifications comme lues
      const response = await fetch('http://localhost:80/api/notification?all=true', {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Mettre à jour l'état local après confirmation du serveur
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
        console.log('Toutes les notifications marquées comme lues');
      } else {
        console.error(`Erreur lors du marquage de toutes les notifications: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  }, []);

  // Formatage du texte de notification
  const getNotificationText = useCallback((notification: Notification): string => {
    switch (notification.type) {
      case 'LIKE':
        const likeData = notification.data as LikeData;
        return `${likeData.user.firstname} ${likeData.user.lastname} a aimé votre publication.`;
      case 'DISLIKE':
        const dislikeData = notification.data as LikeData;
        return `${dislikeData.user.firstname} ${dislikeData.user.lastname} n'a pas aimé votre publication.`;
      case 'COMMENT':
        const commentData = notification.data as CommentData;
        return `${commentData.user.firstname} ${commentData.user.lastname} a commenté votre publication.`;
      case 'COMMENT_LIKE':
        const commentLikeData = notification.data as CommentData;
        return `${commentLikeData.user.firstname} ${commentLikeData.user.lastname} a aimé votre commentaire.`;
      case 'COMMENT_DISLIKE':
        const commentDislikeData = notification.data as CommentData;
        return `${commentDislikeData.user.firstname} ${commentDislikeData.user.lastname} n'a pas aimé votre commentaire.`;
      case 'ASK_FOLLOW':
        const followData = notification.data as FollowRequestData;
        return `${followData.sender.firstname} ${followData.sender.lastname} souhaite vous suivre.`;
      case 'INVITE_GROUP':
        const groupData = notification.data as GroupInviteData;
        return `${groupData.user.firstname} ${groupData.user.lastname} vous invite à rejoindre le groupe ${groupData.group_name}.`;
      default:
        return 'Nouvelle notification';
    }
  }, []);

  // Écouter les nouvelles notifications via WebSocket
  useEffect(() => {
    if (messages.length > 0) {
      // Nouvelle notification reçue par WebSocket
      const latestMessage = messages[messages.length - 1];
      
      // Si le message est une notification
      if (latestMessage && latestMessage.type && latestMessage.id) {
        // Vérifier si cette notification existe déjà
        const exists = notifications.some(n => n.id === latestMessage.id);
        
        if (!exists) {
          // Ajouter la nouvelle notification à la liste
          setNotifications(prev => [latestMessage, ...prev]);
          
          // Incrémenter le compteur de non lues
          setUnreadCount(prev => prev + 1);
          
          // Notification du navigateur (si autorisé)
          if (Notification.permission === "granted") {
            new Notification("Nouvelle notification", {
              body: getNotificationText(latestMessage),
              icon: "/notification-icon.png" // Assurez-vous d'avoir cette icône dans votre dossier public
            });
          }
        }
      }
    }
  }, [messages, notifications, getNotificationText]);

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Demander la permission de notifications au navigateur
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationText,
    isConnected
  };
}

export default useNotifications;