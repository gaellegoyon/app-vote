// Utilitaires pour gérer les cookies côté client

export function clearVoterSession() {
  document.cookie =
    "voter_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=lax";
}

export function clearAdminSession() {
  document.cookie =
    "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=lax";
}

export function clearAllSessions() {
  clearVoterSession();
  clearAdminSession();
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue || null;
  }
  return null;
}
