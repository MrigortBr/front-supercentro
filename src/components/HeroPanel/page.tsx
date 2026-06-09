"use client";

import { Container, Content, DotsGrid, GovBar, GovLogo, GovText, HeroLabel, HeroSub, HeroTitle, Top } from "./styled";

export default function HeroPanel() {
    return (
        <Container>
            <DotsGrid />

            <Content>
                <Top>
                    <GovBar>
                        <GovLogo>MS</GovLogo>

                        <GovText>
                            <strong>Ministério da Saúde</strong>
                            <span>Departamento de Atenção ao Câncer </span>
                        </GovText>
                    </GovBar>

                    <HeroLabel>Sistema em operação</HeroLabel>

                    <HeroTitle>
                        SUPER CENTRO
                        <br />
                    </HeroTitle>

                    <HeroSub>Sistema de Monitoramento - Super Centro Brasil</HeroSub>
                </Top>
                {/* <Bottom>
                    <StatsRow>
                        <StatItem>
                            <StatNumber>
                                300<span>+</span>
                            </StatNumber>

                            <StatLabel>Estabelecimentos</StatLabel>
                        </StatItem>

                        <StatItem>
                            <StatNumber>27</StatNumber>

                            <StatLabel>Unidades da Federação</StatLabel>
                        </StatItem>

                        <StatItem>
                            <StatNumber>43</StatNumber>

                            <StatLabel>Campos monitorados</StatLabel>
                        </StatItem>
                    </StatsRow>
                </Bottom> */}
            </Content>
        </Container>
    );
}
