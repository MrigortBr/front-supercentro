"use client";

import { FooterContainer, FooterLeft, FooterRight, ImageWrapper } from "./styled";

export default function Footer() {
    return (
        <FooterContainer>
            <FooterLeft>© 2026 Sistema de Monitoramento - Super Centro Brasil</FooterLeft>
            <FooterRight>
                <ImageWrapper>
                    <img src="/ministeriologo.png" alt="Ministerio da saude" />
                </ImageWrapper>
            </FooterRight>
        </FooterContainer>
    );
}
