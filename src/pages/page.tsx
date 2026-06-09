"use client";

import styled from "styled-components";
import HeroPanel from "../components/HeroPanel/page";
import LoginPanel from "../components/LoginPanel/page";
import Footer from "../components/footer/page";

export default function LoginPage() {
    return (
        <Container>
            <HeroPanel />
            <LoginPanel />
            <Footer></Footer>
        </Container>
    );
}

export const Container = styled.div`
    width: 100%;

    height: 100vh;

    max-height: 100vh;

    display: grid;
    grid-template-columns: 1fr 30rem;
    grid-template-rows: 90vh 10vh;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
    }

    & > footer {
        grid-column-start: 1;
        grid-column-end: 3;
    }
`;
