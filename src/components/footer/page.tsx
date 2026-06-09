"use client";

import { Image } from "lucide-react";
import { FooterContainer, FooterLeft, FooterRight, ImageWrapper } from "./styled";

export default function Footer() {
    return (
        <FooterContainer>
            <FooterLeft>© 2026 Sistema de Monitoramento - Super Centro Brasil</FooterLeft>
            <FooterRight>
                <ImageWrapper>
                    <img src="/especialista.png" alt="Agora tem especialistas" />
                </ImageWrapper>
                <ImageWrapper>
                    <img src="/ministerio.png" alt="Governo Federal" />
                </ImageWrapper>
                <ImageWrapper>
                    <img src="/gov.jpeg" alt="Ministerio da saude" />
                </ImageWrapper>
            </FooterRight>
        </FooterContainer>
    );
}
