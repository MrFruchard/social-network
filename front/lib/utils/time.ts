/**
 * Calcule le temps écoulé depuis une date donnée et retourne une chaîne formatée
 */
export function timeAgo(dateString: string | Date): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec}s`;
  } else if (diffMin < 60) {
    return `${diffMin}m`;
  } else if (diffHour < 24) {
    return `${diffHour}h`;
  } else if (diffDay < 30) {
    return `${diffDay}j`;
  } else {
    return past.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }
}

/**
 * Formate une date en format lisible
 */
export function formatDate(
  dateString: string | Date, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('fr-FR', defaultOptions);
}

/**
 * Formate une date et heure en format lisible
 */
export function formatDateTime(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return date.toLocaleDateString('fr-FR', defaultOptions);
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(dateString: string | Date): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
}

/**
 * Vérifie si une date est hier
 */
export function isYesterday(dateString: string | Date): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Formate intelligemment une date selon sa proximité
 */
export function formatSmartDate(dateString: string | Date): string {
  if (isToday(dateString)) {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  if (isYesterday(dateString)) {
    return 'Hier';
  }
  
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  
  if (diffDays < 365) {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}