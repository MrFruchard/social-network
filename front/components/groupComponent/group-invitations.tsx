"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X, Clock } from "lucide-react";

interface GroupInvitation {
  id: string;
  group_id: string;
  group_name: string;
  group_description: string;
  group_pic_url?: string;
  sender_id: string;
  sender_name: string;
  sender_username: string;
  created_at: string;
}

export function GroupInvitations() {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:80/api/group/invitations", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch group invitations");
      }
      
      const data = await response.json();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching group invitations:", error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvitation = async (invitationId: string, groupId: string, action: 'accept' | 'decline') => {
    setProcessingIds(prev => [...prev, invitationId]);
    
    try {
      const endpoint = action === 'accept' 
        ? `http://localhost:80/api/group/acceptInvite?groupId=${groupId}`
        : `http://localhost:80/api/group/declineInvite?groupId=${groupId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} invitation`);
      }
      
      // Supprimer l'invitation de la liste
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      console.log(`Invitation ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      alert(`Erreur lors de l'action sur l'invitation. Veuillez réessayer.`);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== invitationId));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des invitations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invitations de groupes
          {invitations.length > 0 && (
            <Badge variant="destructive">{invitations.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune invitation de groupe en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {invitation.group_pic_url ? (
                    <img
                      src={`http://localhost:80/api/groupImages/${invitation.group_pic_url}`}
                      alt={invitation.group_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{invitation.group_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {invitation.group_description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">
                        Invité par <strong>{invitation.sender_name}</strong> (@{invitation.sender_username})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(invitation.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processingIds.includes(invitation.id)}
                    onClick={() => handleInvitation(invitation.id, invitation.group_id, 'decline')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    disabled={processingIds.includes(invitation.id)}
                    onClick={() => handleInvitation(invitation.id, invitation.group_id, 'accept')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accepter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}