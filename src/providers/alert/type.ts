export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertItem {
    id: number;
    message: string;
    type: AlertType;
}

export interface AlertContextData {
    callMessage: (message: string, type?: AlertType) => void;
}
