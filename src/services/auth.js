export function getStoredUser() {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
}

export function storeSession(user, token) {
  if (token) localStorage.setItem("authToken", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}
