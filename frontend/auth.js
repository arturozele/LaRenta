// auth.js
(function() {
  const token = localStorage.getItem("firebaseToken");
  const rol = localStorage.getItem("rol");

  // Si no hay token, redirigir a login
  if (!token) {
    window.location.href = "index.html";
  }

  // Validar rol según la página
  const pathname = window.location.pathname;

  if (pathname.includes("menu_admin.html") && rol !== "admin") {
    alert("Acceso denegado. No eres administrador.");
    window.location.href = "index.html";
  }

  if (pathname.includes("menu_gerente.html") && rol !== "gerente") {
    alert("Acceso denegado. No eres gerente.");
    window.location.href = "index.html";
  }

  // Función global de logout
  window.logout = function() {
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("rol");
    window.location.href = "index.html";
  }
})();
