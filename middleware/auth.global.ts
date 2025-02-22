import { defineNuxtRouteMiddleware, navigateTo, useState } from "#app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import type { User } from "firebase/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = getAuth();
  const db = getFirestore();

  // 🔹 Allowed routes for guests
  const publicRoutes = ["/", "/auth/login", "/auth/register"];

  // 🔹 State for user authentication
  const userState = useState<User | null>("firebaseUser", () => null);
  const roleState = useState<string | null>("userRole", () => null);

  // 🔹 Check if user is already cached
  if (!userState.value) {
    userState.value = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        resolve(firebaseUser);
      });
    });
  }

  const user = userState.value;

  // ✅ Not logged in: Only allow public routes
  if (!user) {
    if (!publicRoutes.includes(to.path)) {
      return navigateTo("/"); // Redirect guests to home
    }
    return; // Allow access to public routes
  }

  // ✅ Logged in: Prevent access to `/` and `/auth/*`
  if (to.path === "/" || to.path.startsWith("/auth")) {
    return navigateTo("/user/dashboard"); // Redirect logged-in users
  }

  // 🔹 Fetch user role from Firestore if not cached
  if (!roleState.value) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      roleState.value = userSnap.exists() ? userSnap.data().role : "user";
    } catch (error) {
      console.error("Error fetching user role:", error);
      roleState.value = "user"; // Default to user if error occurs
    }
  }

  const role = roleState.value;

  // ✅ Prevent Admin from accessing User pages
  if (to.path.startsWith("/user") && role === "admin" && to.path !== "/admin/dashboard") {
    return navigateTo("/admin/dashboard");
  }

  // ✅ Prevent Users from accessing Admin pages
  if (to.path.startsWith("/admin") && role === "user" && to.path !== "/user/dashboard") {
    return navigateTo("/user/dashboard");
  }
});
