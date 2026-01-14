const TOKEN_KEY = "token";
const USER_KEY = "user";

/* ===============================
   SAVE AUTH (TOKEN + USER)
================================ */
export function setAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

/* ===============================
   GET TOKEN
================================ */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/* ===============================
   GET USER
================================ */
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/* ===============================
   CHECK AUTH
================================ */
export function isAuthenticated() {
  return !!getToken();
}

/* ===============================
   LOGOUT  ✅ (THIS WAS MISSING)
================================ */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
