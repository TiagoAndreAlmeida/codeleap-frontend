/**
 * Calcula o tempo relativo de uma data (ex: "just now", "5 minutes ago", "2 hours ago").
 * @param date String da data no formato ISO ou similar.
 * @returns String formatada com o tempo decorrido.
 */
export const timeAgo = (date: string): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  // Fallback para dias se passar de 24h
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};
