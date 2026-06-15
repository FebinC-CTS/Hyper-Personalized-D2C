import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "@/store";
import type { Role } from "@/store";

/**
 * Gate a subtree behind a session role. If no one is signed in, or the
 * signed-in role doesn't match, bounce back to the portal chooser.
 */
export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { role: current } = useSession();
  if (current !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
