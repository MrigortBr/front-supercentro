"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { SessionUser } from "../../service/type";

export interface SessionData {
    user: SessionUser;
    token: string;
    expiresAt: number; // timestamp em ms
}

interface SessionContextData {
    session: SessionData | null;
    setSession: (data: SessionData) => void;
    clearSession: () => void;
}

const SESSION_KEY = "sah_session";

const SessionContext = createContext<SessionContextData>({} as SessionContextData);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSessionState] = useState<SessionData | null>(() => {
        try {
            const stored = localStorage.getItem(SESSION_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const setSession = useCallback((data: SessionData) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        setSessionState(data);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        setSessionState(null);
    }, []);

    const value = useMemo(
        () => ({ session, setSession, clearSession }),
        [session, setSession, clearSession]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
    return useContext(SessionContext);
}
