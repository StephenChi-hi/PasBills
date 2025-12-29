"use client";

import { useAuth } from "@/providers/AuthProvider";
import AuthModal from "./AuthModal";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // While loading session, don’t render anything
  if (loading) return null;

  // If no user, show modal
  if (!user) return <AuthModal />;

  // Otherwise, show the app
  return <>{children}</>;
}
