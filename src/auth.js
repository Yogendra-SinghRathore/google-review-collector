// src/auth.js
import { supabase } from "./supabaseClient";

// Sign in with Google
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin, // dynamic domain
      queryParams: { prompt: "select_account" }, // forces account chooser
    },
  });
  if (error) console.error("Sign-in error:", error.message);
};

// Sign out
export const signOut = async (navigate) => {
  await supabase.auth.signOut();
  localStorage.removeItem("supabase.auth.token"); // clear cached session
  if (navigate) navigate("/"); // redirect home
};
