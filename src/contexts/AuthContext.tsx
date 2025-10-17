import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  name: string;
  role: "student" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  profile: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.auth.getSession();
      setUser(response.user || null);
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    const response = await api.auth.login(username, password);
    setUser(response.user);
  };

  const signOut = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        profile: user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
