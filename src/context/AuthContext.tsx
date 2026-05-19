/**
 * AuthContext — single source of truth for all authenticated user data.
 *
 * State shape:
 *   user        — the authenticated user (null when logged out)
 *   initializing — true only on first mount while restoring session from cookie
 *   roleLoading  — true while the background backend profile sync is in flight
 *
 * Actions:
 *   login(email, password) — authenticates, stores cookie, syncs profile
 *   logout()               — clears cookie and resets all user state
 *   updateUser(patch)      — merges a partial update into user state
 *                            (useful if a profile edit page is added later)
 *
 * Two-phase resolution:
 *   Phase 1 (instant)    — JWT decoded values set immediately so UI never blocks
 *   Phase 2 (background) — backend profile fetched to get authoritative role/name
 *                          Falls back to JWT values silently on network failure.
 */

import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { apiFetch, getCurrentUserProfile } from "@/services/api";
import { AuthUser } from "@/types";

// ── State ──────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  initializing: boolean;
  roleLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  initializing: true,
  roleLoading: false,
};

// ── Actions ────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: "SET_USER"; payload: AuthUser }
  | { type: "UPDATE_USER"; payload: Partial<AuthUser> }
  | { type: "CLEAR_USER" }
  | { type: "SET_INITIALIZING"; payload: boolean }
  | { type: "SET_ROLE_LOADING"; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "UPDATE_USER":
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };

    case "CLEAR_USER":
      return { ...state, user: null, roleLoading: false };

    case "SET_INITIALIZING":
      return { ...state, initializing: action.payload };

    case "SET_ROLE_LOADING":
      return { ...state, roleLoading: action.payload };

    default:
      return state;
  }
}

// ── Context type ───────────────────────────────────────────────────────────

interface AuthContextType {
  /** The authenticated user, or null when logged out. */
  user: AuthUser | null;
  /** True only on first mount while restoring session from cookie. */
  initializing: boolean;
  /** True while the background backend profile sync is in flight. */
  roleLoading: boolean;
  /** Convenience flag — true when user is not null. */
  isAuthenticated: boolean;
  /** Authenticate with email + password. Returns true on success. */
  login: (email: string, password: string) => Promise<boolean>;
  /** Clear session and reset all user state. */
  logout: () => void;
  /** Merge a partial update into the current user state. */
  updateUser: (patch: Partial<AuthUser>) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Phase 2: fetch authoritative profile from backend and merge into state.
   * Silently falls back to JWT values on any network/API failure.
   */
  const syncProfileFromBackend = useCallback(async (tokenUser: AuthUser) => {
    dispatch({ type: "SET_ROLE_LOADING", payload: true });
    try {
      // /users/me works for all roles — no 403 for team_lead
      const profile = await getCurrentUserProfile();
      if (profile) {
        dispatch({
          type: "UPDATE_USER",
          payload: {
            id: profile.id,
            name: profile.name || tokenUser.name,
            email: profile.email,
            role: profile.role, // ← authoritative role from backend
          },
        });
      }
    } catch {
      // Network error — JWT-decoded values remain as fallback
    } finally {
      dispatch({ type: "SET_ROLE_LOADING", payload: false });
    }
  }, []);

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const data = await apiFetch("/login", {
        method: "POST",
        body: formData,
      });

      console.log("Login response:", data);

      if (data?.access_token) {
        Cookies.set("token", data.access_token, { path: "/" });
        console.log("Token saved:", Cookies.get("token")?.substring(0, 20));

        const decoded = jwtDecode<{ sub: string; role: string; name?: string }>(
          data.access_token
        );

        // Phase 1 — set JWT values immediately so the UI isn't blocked
        const tokenUser: AuthUser = {
          name: decoded.name,
          email: decoded.sub,
          role: decoded.role,
        };
        dispatch({ type: "SET_USER", payload: tokenUser });

        // Phase 2 — confirm role/name from backend in the background
        syncProfileFromBackend(tokenUser);

        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  }, [syncProfileFromBackend]);

  // ── AUTO LOGIN (page refresh) ────────────────────────────────────────────
  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = jwtDecode<{ sub: string; role: string; name?: string }>(token);

        // Phase 1 — restore from cookie immediately
        const tokenUser: AuthUser = {
          email: decoded.sub,
          role: decoded.role,
          name: decoded.name,
        };
        dispatch({ type: "SET_USER", payload: tokenUser });

        // Phase 2 — confirm from backend
        syncProfileFromBackend(tokenUser);
      } catch {
        // Malformed token — clear it
        Cookies.remove("token");
      }
    }

    dispatch({ type: "SET_INITIALIZING", payload: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    Cookies.remove("token");
    dispatch({ type: "CLEAR_USER" });
  }, []);

  // ── UPDATE USER ──────────────────────────────────────────────────────────
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    dispatch({ type: "UPDATE_USER", payload: patch });
  }, []);

  const value: AuthContextType = {
    user: state.user,
    initializing: state.initializing,
    roleLoading: state.roleLoading,
    isAuthenticated: state.user !== null,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook ───────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
