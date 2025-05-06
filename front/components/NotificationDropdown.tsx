'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, MessageCircle, ThumbsUp, ThumbsDown, UserPlus, Users } from 'lucide-react';
import { 
  Avatar,
  AvatarFallback, 
  AvatarImage
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    useNotifications,
    Notification,
    NotificationType, FollowRequestData, GroupInviteData
} from '@/hooks/utils/useNotifications';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationDropdown() {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    getNotificationText
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format de date relative (ex: "il y a 2 heures")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Icône en fonction du type de notification
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'LIKE': return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'DISLIKE': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'COMMENT': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'COMMENT_LIKE': return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'COMMENT_DISLIKE': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'ASK_FOLLOW': return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'INVITE_GROUP': return <Users className="h-4 w-4 text-orange-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // URL de redirection en fonction du type de notification
  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'LIKE':
      case 'DISLIKE':
        return `/post/${(notification.data as any).post_id}`;
      case 'COMMENT':
      case 'COMMENT_LIKE':
      case 'COMMENT_DISLIKE':
        return `/post/${(notification.data as any).post_id}`;
      case 'ASK_FOLLOW':
        return `/profile?id=${(notification.data as any).sender.id}`;
      case 'INVITE_GROUP':
        return `/group/${(notification.data as any).group_id}`;
      default:
        return '#';
    }
  };

  const handleClick = (notif: Notification) => {
    // Marquer comme lu au clic
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
  };

  // Actions spécifiques pour certaines notifications
  const renderActions = (notif: Notification) => {
    if (notif.type === 'ASK_FOLLOW') {
      return (
        <div className="flex space-x-2 mt-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Accepter la demande de suivi - vérifier que sender.id est bien défini
              const senderId = (notif.data as FollowRequestData).sender?.id;
              if (!senderId) {
                console.error('Erreur: ID de l\'expéditeur manquant dans la notification');
                return;
              }
              console.log('Acceptation de la demande de suivi de:', senderId);
              fetch(`http://localhost:80/api/user/agree?user=${senderId}`, {
                method: 'POST',
                credentials: 'include'
              }).then(response => {
                if (response.ok) {
                  // Marquer la notification comme lue d'abord
                  fetch(`http://localhost:80/api/notification?id=${notif.id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                  }).then(readResponse => {
                    if (readResponse.ok) {
                      console.log('Notification marquée comme lue');
                      // Mettre à jour l'état local après
                      markAsRead(notif.id);
                      console.log('Demande de suivi acceptée');
                    }
                  });
                } else {
                  console.error(`Erreur lors de l'acceptation de la demande: ${response.status}`);
                  // Récupérer le message d'erreur du serveur si disponible
                  response.text().then(errorText => {
                    console.error('Détail de l\'erreur:', errorText);
                  }).catch(err => {
                    console.error('Impossible de lire le détail de l\'erreur');
                  });
                }
              }).catch(error => {
                console.error('Erreur:', error);
              });
            }}
          >
            <Check className="mr-1 h-3 w-3" />
            Accepter
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Refuser la demande de suivi - vérifier que sender.id est bien défini
              const senderId = (notif.data as FollowRequestData).sender?.id;
              if (!senderId) {
                console.error('Erreur: ID de l\'expéditeur manquant dans la notification');
                return;
              }
              console.log('Refus de la demande de suivi de:', senderId);
              fetch(`http://localhost:80/api/user/decline?user=${senderId}`, {
                method: 'POST',
                credentials: 'include'
              }).then(response => {
                if (response.ok) {
                  // Marquer la notification comme lue d'abord
                  fetch(`http://localhost:80/api/notification?id=${notif.id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                  }).then(readResponse => {
                    if (readResponse.ok) {
                      console.log('Notification marquée comme lue');
                      // Mettre à jour l'état local après
                      markAsRead(notif.id);
                      console.log('Demande de suivi refusée');
                    }
                  });
                } else {
                  console.error(`Erreur lors du refus de la demande: ${response.status}`);
                  // Récupérer le message d'erreur du serveur si disponible
                  response.text().then(errorText => {
                    console.error('Détail de l\'erreur:', errorText);
                  }).catch(err => {
                    console.error('Impossible de lire le détail de l\'erreur');
                  });
                }
              }).catch(error => {
                console.error('Erreur:', error);
              });
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Refuser
          </Button>
        </div>
      );
    }
    
    if (notif.type === 'INVITE_GROUP') {
      const groupData = notif.data as GroupInviteData;
      return (
        <div className="flex space-x-2 mt-2">
          <Button
            size="sm" 
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Cette API n'existe peut-être pas encore, à adapter
              fetch(`http://localhost:80/api/group/accept?group=${groupData.group_id}`, {
                method: 'POST',
                credentials: 'include'
              }).then(response => {
                if (response.ok) {
                  markAsRead(notif.id);
                  console.log('Invitation acceptée');
                } else {
                  console.error('Erreur lors de l\'acceptation de l\'invitation');
                }
              }).catch(error => {
                console.error('Erreur:', error);
              });
            }}
          >
            <Check className="mr-1 h-3 w-3" />
            Rejoindre
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Cette API n'existe peut-être pas encore, à adapter
              fetch(`http://localhost:80/api/group/decline?group=${groupData.group_id}`, {
                method: 'POST',
                credentials: 'include'
              }).then(response => {
                if (response.ok) {
                  markAsRead(notif.id);
                  console.log('Invitation refusée');
                } else {
                  console.error('Erreur lors du refus de l\'invitation');
                }
              }).catch(error => {
                console.error('Erreur:', error);
              });
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Ignorer
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-0 w-80 max-h-[70vh] overflow-auto">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="mr-1 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <>
              {notifications.map((notif, index) => (
                <React.Fragment key={notif.id}>
                  {index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem 
                    className="p-0 focus:bg-transparent hover:bg-transparent"
                  >
                    <Link 
                      href={getNotificationLink(notif)} 
                      className={`flex p-3 gap-3 w-full rounded-sm hover:bg-muted ${!notif.read ? 'bg-muted/50' : ''}`}
                      onClick={() => handleClick(notif)}
                    >
                      <div className="relative shrink-0">
                        {/* Avatar de l'utilisateur qui a généré la notification */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={(notif.data as any).user?.profilePic ? `http://localhost:80/api/avatars/${(notif.data as any).user.profilePic}` : undefined} 
                            alt={(notif.data as any).user?.username || "avatar"} 
                          />
                          <AvatarFallback>
                            {((notif.data as any).user?.firstname?.[0] || '') + ((notif.data as any).user?.lastname?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        {/* Icône du type de notification */}
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
                          {getNotificationIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-0.5 line-clamp-2">
                          {getNotificationText(notif)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notif.created_at)}
                        </p>
                        {renderActions(notif)}
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full self-start mt-2" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </>
          )}
          
          {notifications.length > 0 && (
            <div className="p-2 border-t text-center">
              <Link 
                href="/notifications" 
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}