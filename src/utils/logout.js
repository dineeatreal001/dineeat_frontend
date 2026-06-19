// utils/logout.js
export const logout = (router) => {
  // Clear all stored data
  localStorage.removeItem("chaosstoredineeat");
  localStorage.removeItem("authToken");
  localStorage.removeItem("storeData");
  localStorage.removeItem("storeId");
  localStorage.removeItem("jwtDecoded");
  localStorage.removeItem("tokenExpiry");
  
  // Clear session storage
  const sessionTimeout = sessionStorage.getItem("sessionTimeout");
  if (sessionTimeout) {
    clearTimeout(parseInt(sessionTimeout));
    sessionStorage.removeItem("sessionTimeout");
  }
  sessionStorage.removeItem("authToken");
  
  // Redirect to login
  if (router) {
    router.push("/login");
  }
};