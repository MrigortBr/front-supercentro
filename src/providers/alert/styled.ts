import styled, { css, keyframes } from "styled-components";
import { AlertType } from "./type";

export const slide = keyframes`
    from {
        opacity: 0;
        transform: translateX(100%);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

export const Container = styled.div`
    position: fixed;

    bottom: 1.5rem;
    right: 1.5rem;

    z-index: 999999;

    display: flex;
    flex-direction: column;

    gap: 1rem;
`;

export const Toast = styled.div<{
    $type: AlertType;
}>`
    min-width: 320px;

    padding: 1rem 1.25rem;

    border-radius: 0.75rem;

    color: white;

    font-weight: 600;

    animation: ${slide} 0.25s ease;

    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

    ${({ $type }) => {
        switch ($type) {
            case "success":
                return css`
                    background: #16a34a;
                `;

            case "error":
                return css`
                    background: #dc2626;
                `;

            case "warning":
                return css`
                    background: #f59e0b;
                `;

            default:
                return css`
                    background: #2563eb;
                `;
        }
    }}
`;
