"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';

// Types pour les notifications
export type NotificationType = 'LIKE' | 'DISLIKE' | 'COMMENT' | 'COMMENT_LIKE' | 'COMMENT_DISLIKE' | 'ASK_FOLLOW' | 'INVITE_GROUP' | 'NEW_FOLLOWER';

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
  status?: string;  // Status de la demande côté serveur ("accepted", "pending", etc.)
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
  
  // Liste des notifications déjà traitées (acceptées ou refusées)
  const [processedNotifications, setProcessedNotifications] = useState<string[]>([]);
  
  // Liste des notifications de nouvel abonné (générées localement)
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  const { isConnected, messages } = useWebSocket();
  
  // Charger les notifications locales depuis localStorage
  useEffect(() => {
    try {
      const savedNotifs = localStorage.getItem('localNotifications');
      if (savedNotifs) {
        const parsedNotifs = JSON.parse(savedNotifs);
        setLocalNotifications(parsedNotifs);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des notifications locales:', e);
    }
  }, []);
  
  // Nous n'avons plus besoin de charger les notifications traitées ici
  // car cela est maintenant fait directement dans fetchNotifications

  // Récupérer les notifications depuis l'API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer d'abord la liste des notifications traitées dans localStorage
      let processedIds: string[] = [];
      try {
        const savedIds = localStorage.getItem('processedNotifications');
        if (savedIds) {
          processedIds = JSON.parse(savedIds);
          console.log('Notifications traitées chargées:', processedIds);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des notifications traitées:', e);
      }
      
      const response = await fetch('http://localhost:80/api/notification', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Validation supplémentaire pour s'assurer que les données sont bien formatées
      if (data === null) {
        // Si l'API renvoie null, traiter comme un tableau vide
        setNotifications([]);
        setUnreadCount(0);
      } else if (Array.isArray(data)) {
        // Vérifier et nettoyer les données si nécessaire
        const cleanedData = data.map((notif: Notification) => {
          // S'assurer que les notifications de type ASK_FOLLOW ont les bons champs
          if (notif.type === 'ASK_FOLLOW' && notif.data) {
            // Vérifier que sender existe et a un id
            if (!notif.data.sender || !notif.data.sender.id) {
              console.warn('Notification ASK_FOLLOW mal formatée:', notif);
            }
            
            // Pour le débogage
            console.log('Notification ASK_FOLLOW:', notif.id, 'traitée:', processedIds.includes(notif.id));
          }
          return notif;
        });
        
        // Récupérer les demandes déjà acceptées depuis localStorage
        let acceptedMap = {};
        try {
          const acceptedFollows = localStorage.getItem('acceptedFollowRequests');
          if (acceptedFollows) {
            acceptedMap = JSON.parse(acceptedFollows);
            console.log('Demandes déjà acceptées chargées:', Object.keys(acceptedMap).length);
          }
        } catch (e) {
          console.error('Erreur lors du chargement des demandes acceptées:', e);
        }
        
        // Transformer les notifications: convertir les demandes acceptées en "vous suit maintenant"
        const transformedData = cleanedData.map(notif => {
          // Si c'est une demande de suivi déjà acceptée selon notre localStorage
          if (notif.type === 'ASK_FOLLOW' && acceptedMap.hasOwnProperty(notif.id)) {
            // La convertir en notification "NEW_FOLLOWER"
            console.log('Conversion d\'une demande acceptée en "vous suit maintenant":', notif.id);
            return {
              ...notif,
              type: 'NEW_FOLLOWER' as NotificationType,
              data: {
                ...notif.data,
                status: 'accepted'
              }
            };
          }
          return notif;
        });
        
        // Filtrer les notifications déjà traitées
        const filteredData = transformedData.filter(notif => {
          // Filtrer les notifications déjà traitées par notre système
          if (processedIds.includes(notif.id)) {
            return false;
          }
          
          // Filtrer les demandes de suivi déjà acceptées par le serveur (si présentes)
          if (notif.type === 'ASK_FOLLOW') {
            const followData = notif.data as FollowRequestData;
            if (followData.status === 'accepted') {
              console.log('Filtrage d\'une demande déjà acceptée côté serveur:', notif.id);
              // Ajouter automatiquement à notre liste de notifications traitées
              processedIds.push(notif.id);
              localStorage.setItem('processedNotifications', JSON.stringify(processedIds));
              return false;
            }
          }
          
          return true;
        });
        
        console.log('Total notifications:', cleanedData.length, 'Après filtrage:', filteredData.length);
        
        // Mettre à jour l'état des notifications traitées
        setProcessedNotifications(processedIds);
        
        // Log des notifications locales pour débogage
        console.log('Notifications locales avant fusion:', localNotifications.length);
        
        try {
          // Récupérer les notifications locales à partir de localStorage
          const savedNotifs = localStorage.getItem('localNotifications');
          if (savedNotifs) {
            // Parsage et mise à jour de l'état local
            const parsedNotifs = JSON.parse(savedNotifs);
            setLocalNotifications(parsedNotifs);
            console.log('Notifications locales chargées depuis localStorage:', parsedNotifs.length);
          }
        } catch (e) {
          console.error('Erreur lors du chargement des notifications locales:', e);
        }
        
        // Combiner les notifications du serveur avec les notifications locales
        const combinedNotifications = [...filteredData, ...localNotifications];
        
        // Trier les notifications par date (les plus récentes en premier)
        combinedNotifications.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        console.log('Notifications combinées avant mise à jour:', combinedNotifications.length);
        
        // Mettre à jour les notifications
        setNotifications(combinedNotifications);
        
        // Calculer le nombre de notifications non lues (incluant les notifications locales)
        const unreadServer = filteredData.filter(notif => !notif.read).length;
        const unreadLocal = localNotifications.filter(notif => !notif.read).length;
        setUnreadCount(unreadServer + unreadLocal);
        console.log('Notifications non lues (serveur):', unreadServer, 'Notifications non lues (locales):', unreadLocal);
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

  // Marquer une notification comme traitée
  const markNotificationProcessed = useCallback((notificationId: string) => {
    // Vérifier d'abord si la notification existe
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      console.warn(`Notification ${notificationId} introuvable`);
      return;
    }
    
    console.log('Marquage de la notification comme traitée:', notificationId);
    
    // Mettre à jour la liste des notifications traitées dans l'état et localStorage
    setProcessedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev;
      }
      const newProcessed = [...prev, notificationId];
      try {
        localStorage.setItem('processedNotifications', JSON.stringify(newProcessed));
        console.log('Sauvegarde dans localStorage:', newProcessed);
      } catch (e) {
        console.error('Erreur lors de la sauvegarde dans localStorage:', e);
      }
      return newProcessed;
    });
    
    // Supprimer la notification de l'affichage
    setNotifications(prev => {
      const filtered = prev.filter(notif => notif.id !== notificationId);
      console.log(`Notification ${notificationId} supprimée de l'affichage, reste ${filtered.length} notifications`);
      return filtered;
    });
    
    // Si c'était une notification non lue, ajuster le compteur
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

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
  
  // Effet supplémentaire pour gérer les notifications de suivi déjà acceptées
  // et les supprimer de l'interface
  useEffect(() => {
    // Parcourir toutes les notifications pour trouver les demandes de suivi déjà acceptées
    const updatedProcessedIds = [...processedNotifications];
    let changed = false;
    
    const filteredNotifications = notifications.filter(notif => {
      if (notif.type === 'ASK_FOLLOW') {
        const followData = notif.data as FollowRequestData;
        // Si la demande est déjà acceptée et n'est pas déjà dans notre liste
        if (followData.status === 'accepted' && !processedNotifications.includes(notif.id)) {
          console.log('Demande déjà acceptée détectée:', notif.id);
          updatedProcessedIds.push(notif.id);
          changed = true;
          return false;
        }
      }
      return true;
    });
    
    // Si des changements ont été effectués
    if (changed) {
      // Mettre à jour localStorage
      localStorage.setItem('processedNotifications', JSON.stringify(updatedProcessedIds));
      // Mettre à jour l'état des notifications traitées
      setProcessedNotifications(updatedProcessedIds);
      // Mettre à jour la liste des notifications
      setNotifications(filteredNotifications);
      // Recalculer le nombre de notifications non lues
      const unread = filteredNotifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    }
  }, [notifications, processedNotifications]);

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
        // Vérifier si la demande a été acceptée
        if (followData.status === 'accepted') {
          return `${followData.sender.firstname} ${followData.sender.lastname} vous suit maintenant.`;
        }
        return `${followData.sender.firstname} ${followData.sender.lastname} souhaite vous suivre.`;
      case 'NEW_FOLLOWER':
        const newFollowerData = notification.data as FollowRequestData;
        return `${newFollowerData.sender.firstname} ${newFollowerData.sender.lastname} vous suit maintenant.`;
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

  // Fonction pour ajouter une notification locale (comme un nouvel abonné)
  const addLocalNotification = useCallback((notification: Notification) => {
    console.log('Ajout d\'une notification locale:', notification);
    
    setLocalNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Sauvegarder dans localStorage
      try {
        localStorage.setItem('localNotifications', JSON.stringify(newNotifications));
        console.log('Notifications locales sauvegardées:', newNotifications);
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des notifications locales:', e);
      }
      return newNotifications;
    });
    
    // Ajouter à l'état des notifications immédiatement
    setNotifications(prev => {
      const updated = [notification, ...prev];
      console.log('État des notifications mis à jour:', updated.length, 'notifications');
      return updated;
    });
    
    // Si la notification n'est pas lue, incrémenter le compteur
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Forcer un rechargement des notifications après un court délai
    setTimeout(() => {
      fetchNotifications();
    }, 500);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationText,
    isConnected,
    markNotificationProcessed,
    addLocalNotification
  };
}

export default useNotifications;