export const PROFILE_CONSTANTS = {
  API_BASE_URL: 'http://localhost:80/api',
  AVATAR_BASE_URL: 'http://localhost:80/api/avatars',
  
  MESSAGES: {
    NO_EMAIL: "Aucun email disponible",
    NO_BIRTH_DATE: "Aucune date de naissance disponible", 
    NO_DESCRIPTION: "Aucune description disponible.",
    NO_FOLLOWERS: "Pas encore d'abonnés.",
    NO_FOLLOWING: "Ne suit personne pour l'instant.",
    SUBSCRIBE_FOR_MORE: "Abonnez-vous pour voir plus d'informations",
    PRIVATE_ACCOUNT: "Compte privé"
  },
  
  LABELS: {
    FOLLOW: "Suivre",
    UNFOLLOW: "Ne plus suivre", 
    REQUEST_FOLLOW: "Demander à suivre",
    ACCEPT: "Accepter",
    DECLINE: "Refuser",
    CANCEL_REQUEST: "Annuler la demande",
    PUBLIC: "Public",
    PRIVATE: "Privé",
    FOLLOWERS: "Abonnés",
    FOLLOWING: "Abonnements",
    POSTS: "Publications"
  }
} as const;