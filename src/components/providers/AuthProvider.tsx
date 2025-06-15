"use client";
import { auth, db } from "@/lib/firebase"; // Note the alias "@/lib/..."
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "AuthProvider: Auth state changed, user:",
        user?.uid || "null"
      );
      if (user) {
        // User is signed in.
        console.log(
          "AuthProvider: User signed in, creating/checking user document"
        );
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        // If the user document doesn't exist, create it.
        // This is useful for storing user-specific data beyond what auth provides.
        if (!docSnap.exists()) {
          console.log("AuthProvider: Creating new user document");
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
          });
        }
        setUser(user);
        console.log("AuthProvider: User set in state");
      } else {
        // User is signed out.
        console.log("AuthProvider: User signed out");
        setUser(null);
      }
      setLoading(false);
      console.log("AuthProvider: Loading set to false");
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Only log unexpected errors, ignore cancelled-popup-request
      if (error?.code !== "auth/cancelled-popup-request") {
        // eslint-disable-next-line no-console
        console.error("Error signing in with Google: ", error);
      }
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
