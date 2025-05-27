"use client";

import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/hooks/user/checkAuth";
import { useNotifications, Notification } from "@/hooks/utils/useNotifications";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  Users,
  X,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/login",
  });

  const {
    notifications = [],
    loading: notificationsLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationText,
  } = useNotifications();
  
  // État local pour tracker les notifications traitées (acceptées/refusées)
  const [processedNotifications, setProcessedNotifications] = useState<string[]>([]);

  // Recharger les notifications au chargement de la page
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Format de date relative (ex: "il y a 2 heures")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Organiser les notifications par catégorie
  const unreadNotifications = notifications ? notifications.filter(notif => !notif.read) : [];
  const readNotifications = notifications ? notifications.filter(notif => notif.read) : [];

  // Obtenir l'icône pour le type de notification
  const getNotificationIcon = (type: string, className = "h-5 w-5") => {
    switch (type) {
      case 'LIKE': return <ThumbsUp className={`${className} text-blue-500`} />;
      case 'DISLIKE': return <ThumbsDown className={`${className} text-red-500`} />;
      case 'COMMENT': return <MessageCircle className={`${className} text-green-500`} />;
      case 'COMMENT_LIKE': return <ThumbsUp className={`${className} text-blue-500`} />;
      case 'COMMENT_DISLIKE': return <ThumbsDown className={`${className} text-red-500`} />;
      case 'ASK_FOLLOW': return <UserPlus className={`${className} text-purple-500`} />;
      case 'INVITE_GROUP': return <Users className={`${className} text-orange-500`} />;
      default: return <Bell className={className} />;
    }
  };

  // Obtenir le lien pour la notification
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

  // Actions spécifiques pour certaines notifications
  const renderActions = (notif: Notification) => {
    if (notif.type === 'ASK_FOLLOW') {
      return (
        <div className="flex space-x-2 mt-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Accepter la demande de suivi - vérifier que sender.id est bien défini
              const senderId = (notif.data as any).sender?.id;
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
                  // Marquer comme traitée immédiatement pour une meilleure UX
                  setProcessedNotifications(prev => [...prev, notif.id]);
                  
                  // Marquer la notification comme lue dans la base de données
                  fetch(`http://localhost:80/api/notification?id=${notif.id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                  }).then(readResponse => {
                    if (readResponse.ok) {
                      // Mettre à jour l'état local
                      markAsRead(notif.id);
                      
                      // Recharger les notifications en arrière-plan
                      setTimeout(() => fetchNotifications(), 1000);
                      console.log('Demande de suivi acceptée et notification marquée comme lue');
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
            <Check className="mr-2 h-4 w-4" />
            Accepter
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Refuser la demande de suivi - vérifier que sender.id est bien défini
              const senderId = (notif.data as any).sender?.id;
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
                  // Marquer comme traitée immédiatement pour une meilleure UX
                  setProcessedNotifications(prev => [...prev, notif.id]);
                  
                  // Marquer la notification comme lue dans la base de données
                  fetch(`http://localhost:80/api/notification?id=${notif.id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                  }).then(readResponse => {
                    if (readResponse.ok) {
                      // Mettre à jour l'état local
                      markAsRead(notif.id);
                      
                      // Recharger les notifications en arrière-plan
                      setTimeout(() => fetchNotifications(), 1000);
                      console.log('Demande de suivi refusée et notification marquée comme lue');
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
            <X className="mr-2 h-4 w-4" />
            Refuser
          </Button>
        </div>
      );
    }
    
    if (notif.type === 'INVITE_GROUP') {
      const groupData = notif.data as any;
      return (
        <div className="flex space-x-2 mt-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Accepter l'invitation de groupe
              fetch(`http://localhost:80/api/group/acceptInvite?groupId=${groupData.group_id}`, {
                method: 'POST',
                credentials: 'include'
              }).then(response => {
                if (response.ok) {
                  // Marquer comme traitée immédiatement pour une meilleure UX
                  setProcessedNotifications(prev => [...prev, notif.id]);
                  markAsRead(notif.id);
                  
                  // Recharger les notifications en arrière-plan
                  setTimeout(() => fetchNotifications(), 1000);
                  console.log('Invitation acceptée');
                } else {
                  console.error('Erreur lors de l\'acceptation de l\'invitation');
                }
              }).catch(error => {
                console.error('Erreur:', error);
              });
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Rejoindre
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Refuser l'invitation de groupe
              fetch(`http://localhost:80/api/group/declineInvite?groupId=${groupData.group_id}`, {
                method: 'POST',
                credentials: 'include'
              }).then(response => {
                if (response.ok) {
                  // Marquer comme traitée immédiatement pour une meilleure UX
                  setProcessedNotifications(prev => [...prev, notif.id]);
                  markAsRead(notif.id);
                  
                  // Recharger les notifications en arrière-plan
                  setTimeout(() => fetchNotifications(), 1000);
                  console.log('Invitation refusée');
                } else {
                  console.error('Erreur lors du refus de l\'invitation');
                }
              }).catch(error => {
                console.error('Erreur:', error);
              });
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Ignorer
          </Button>
        </div>
      );
    }
    
    return null;
  };

  // Rendu de chaque notification
  const renderNotification = (notif: Notification) => {
    // Ne pas afficher les notifications traitées
    if (processedNotifications.includes(notif.id)) {
      return null;
    }
    
    return (
      <Card 
        key={notif.id} 
        className={`mb-4 ${!notif.read ? 'border-l-4 border-l-primary' : ''}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={(notif.data as any).user?.profilePic ? `http://localhost:80/api/avatars/${(notif.data as any).user.profilePic}` : undefined} 
                  alt={(notif.data as any).user?.username || "avatar"} 
                />
                <AvatarFallback>
                  {((notif.data as any).user?.firstname?.[0] || '') + ((notif.data as any).user?.lastname?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1">
                {getNotificationIcon(notif.type)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-semibold">
                    {getNotificationText(notif)}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDate(notif.created_at)}
                  </div>
                </div>
                {!notif.read && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => markAsRead(notif.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Prévisualisation du contenu */}
              {(notif.type === 'LIKE' || notif.type === 'DISLIKE' || notif.type === 'COMMENT') && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                  {(notif.data as any).content && (
                    <p className="line-clamp-2">
                      {(notif.data as any).content}
                    </p>
                  )}
                  {(notif.data as any).image_url && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Image associée</Badge>
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions spécifiques */}
              {renderActions(notif)}
              
              {/* Lien vers le contenu */}
              <div className="mt-3">
                <Link 
                  href={getNotificationLink(notif)}
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  Voir le détail
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || notificationsLoading) {
    return (
      <MainLayout>
        <div className="p-4 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications && notifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
            >
              <Check className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Toutes
              {notifications && notifications.length > 0 && (
                <Badge className="ml-2" variant="secondary">{notifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues
              {unreadNotifications && unreadNotifications.length > 0 && (
                <Badge className="ml-2" variant="destructive">{unreadNotifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Lues</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {!notifications || notifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous n'avez pas de notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {notifications?.map(renderNotification)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread">
            {!unreadNotifications || unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Check className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous n'avez pas de notifications non lues</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {unreadNotifications?.map(renderNotification)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read">
            {!readNotifications || readNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous n'avez pas de notifications lues</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {readNotifications?.map(renderNotification)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}