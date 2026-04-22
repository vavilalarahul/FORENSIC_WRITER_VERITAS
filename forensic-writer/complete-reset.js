// Complete browser reset to fix login/dashboard issue
console.log("%c=== FORENSIC WRITER - COMPLETE RESET ===", "color: red; font-size: 20px; font-weight: bold;");

// Step 1: Clear all storage
console.log("%cStep 1: Clearing all storage...", "color: blue;");
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log("%c✓ localStorage cleared", "color: green;");
  console.log("%c✓ sessionStorage cleared", "color: green;");
} catch (error) {
  console.error("%c✗ Error clearing storage:", error, "color: red;");
}

// Step 2: Clear all cookies
console.log("%cStep 2: Clearing cookies...", "color: blue;");
document.cookie.split(";").forEach(function(c) { 
  const cookieParts = c.split("=");
  const cookieName = cookieParts[0]?.trim();
  if (cookieName) {
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
  }
});
console.log("%c✓ All cookies cleared", "color: green;");

// Step 3: Force reload to login
console.log("%cStep 3: Forcing redirect to login page...", "color: blue;");
setTimeout(() => {
  window.location.href = "/login";
}, 1000);

console.log("%c=== RESET COMPLETE ===", "color: green; font-size: 16px;");
console.log("%cIf dashboard still loads, try:", "color: orange;");
console.log("%c1. Close browser completely", "color: orange;");
console.log("%c2. Open new browser window", "color: orange;");
console.log("%c3. Go to localhost:5173", "color: orange;");
console.log("%c4. Should see login page", "color: orange;");
