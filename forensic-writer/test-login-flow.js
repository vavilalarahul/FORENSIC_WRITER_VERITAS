// Comprehensive test for login page flow
console.log("%c=== FORENSIC WRITER - LOGIN FLOW TEST ===", "color: blue; font-size: 16px; font-weight: bold;");

// Test 1: Check localStorage state
console.log("%cTest 1: Checking localStorage state...", "color: green;");
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;

console.log("  User in localStorage:", user ? "YES" : "NO");
if (user) {
  console.log("  Username:", user.username);
  console.log("  Email:", user.email);
  console.log("  Role:", user.role);
  console.log("  Created:", user.createdAt);
}

// Test 2: Check current path
console.log("%cTest 2: Checking current path...", "color: green;");
console.log("  Current path:", window.location.pathname);

// Test 3: Check route structure
console.log("%cTest 3: Checking route structure...", "color: green;");
const currentPath = window.location.pathname;

if (currentPath === "/") {
  console.log("  ✅ Root path - should redirect to /login");
} else if (currentPath === "/login") {
  console.log("  ✅ Login page - correct");
} else if (currentPath.startsWith("/admin")) {
  console.log("  ❌ Admin dashboard - should be blocked without auth");
} else if (currentPath.startsWith("/investigator")) {
  console.log("  ❌ Investigator dashboard - should be blocked without auth");
} else if (currentPath.startsWith("/legal")) {
  console.log("  ❌ Legal dashboard - should be blocked without auth");
} else if (currentPath.startsWith("/dashboard")) {
  console.log("  ❌ General dashboard - should be blocked without auth");
} else {
  console.log("  ❓ Unknown path:", currentPath);
}

// Test 4: Expected behavior
console.log("%cTest 4: Expected behavior...", "color: orange;");
console.log("  1. Root (/) → redirect to /login");
console.log("  2. No user → /login page");
console.log("  3. With user → dashboard after login");
console.log("  4. Direct dashboard access → redirect to /login");

// Test 5: Recommendation
console.log("%cTest 5: Recommendation...", "color: blue;");
if (user) {
  console.log("  ⚠️  User data found - clear browser cache");
  console.log("  📋 Run: localStorage.clear()");
  console.log("  🔄 Run: location.reload()");
} else {
  console.log("  ✅ No user data - should work correctly");
  console.log("  🌐 Go to: http://localhost:5173");
}

console.log("%c=== TEST COMPLETE ===", "color: green; font-size: 16px;");
