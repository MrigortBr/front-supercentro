"use client";

import { LoadingContainer, LoadingSpinner, LoadingText } from "./styed";

interface LoadingProps {
    text?: string;
    height?: string;
    width?: string;
    heightSpinner?: string;
    widthSpinner?: string;
}

export default function Loading({
    text = "Carregando...",
    height = "100%",
    width = "100%",
    heightSpinner = "3vw",
    widthSpinner = "3vw",
}: LoadingProps) {
    return (
        <LoadingContainer $height={height} $width={width}>
            <LoadingSpinner $height={heightSpinner} $width={widthSpinner} />

            {text === "" ? <></> : <LoadingText>{text}</LoadingText>}
        </LoadingContainer>
    );
}
