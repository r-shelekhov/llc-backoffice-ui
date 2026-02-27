import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@/types";
import { users } from "@/lib/mock-data";

interface AuthContextValue {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, allUsers: users }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
