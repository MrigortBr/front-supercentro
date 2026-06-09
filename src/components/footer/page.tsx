"use client";

import { FooterContainer, FooterLeft, FooterRight, ImageWrapper } from "./styled";

export default function Footer() {
    return (
        <FooterContainer>
            <FooterLeft>© 2026 SAH - Sistema de Acompanhamento de Habilitações</FooterLeft>
            <FooterRight>
                <ImageWrapper>
                    <img src="/especialista.png" alt="Agora tem especialistas" style={{ objectFit: "contain" }} />
                </ImageWrapper>
                <ImageWrapper>
                    <img src="/ministerio-semfundo.png" alt="Ministerio da saude" style={{ objectFit: "contain" }} />
                </ImageWrapper>
                <ImageWrapper>
                    <img src="/sus.png" alt="Governo Federal" style={{ objectFit: "contain" }} />
                </ImageWrapper>
            </FooterRight>
        </FooterContainer>
    );
}
