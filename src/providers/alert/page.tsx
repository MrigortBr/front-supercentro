"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { Container, Toast } from "./styled";

import { AlertContextData, AlertItem, AlertType } from "./type";

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    const callMessage = useCallback((message: string, type: AlertType = "info") => {
        const id = Date.now() + Math.random();

        setAlerts((old) => [
            ...old,
            {
                id,
                message,
                type,
            },
        ]);

        setTimeout(() => {
            setAlerts((old) => old.filter((item) => item.id !== id));
        }, 3000);
    }, []);

    const value = useMemo(
        () => ({
            callMessage,
        }),
        [callMessage]
    );

    return (
        <AlertContext.Provider value={value}>
            {children}

            <Container>
                {alerts.map((item) => (
                    <Toast key={item.id} $type={item.type}>
                        {item.message}
                    </Toast>
                ))}
            </Container>
        </AlertContext.Provider>
    );
}

export function useAlert() {
    return useContext(AlertContext);
}
