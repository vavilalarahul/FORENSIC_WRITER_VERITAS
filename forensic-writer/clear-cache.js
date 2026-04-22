// Clear cache script to fix routing issues
console.log("Clearing cache and user data...");

// Clear all user data
localStorage.clear();
sessionStorage.clear();

// Clear any cookies
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"); 
});

console.log("Cache cleared. Please refresh the page.");
console.log("Instructions:");
console.log("1. Close this terminal");
console.log("2. Hard refresh browser (Ctrl + Shift + R)");
console.log("3. Clear browser cache if needed");
console.log("4. Application should now open to login page");
