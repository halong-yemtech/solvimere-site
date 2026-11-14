const NAME = "solvimere_cookie_consent";
const MAX_AGE = 60 * 60 * 24 * 180;

export function readConsent() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${NAME}=(accepted|declined)(?:;|$)`));
  if (match) return match[1];
  try {
    const stored = localStorage.getItem(NAME);
    if (stored === "accepted" || stored === "declined") return stored;
  } catch {
    return null;
  }
  return null;
}

export function writeConsent(value) {
  document.cookie = `${NAME}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
  try {
    localStorage.setItem(NAME, value);
  } catch {
    /* preference still lives in the cookie */
  }
}
