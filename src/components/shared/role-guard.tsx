import type { ReactNode } from "react";
import type { Role } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { PermissionDenied } from "./permission-denied";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = <PermissionDenied />,
}: RoleGuardProps) {
  const { currentUser } = useAuth();

  if (!allowedRoles.includes(currentUser.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
