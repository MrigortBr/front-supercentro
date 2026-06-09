import styled, { keyframes } from "styled-components";

export const Container = styled.section`
    position: relative;
    width: 100%;
    max-height: 90vh;
    padding: 3rem;

    overflow: hidden;

    background: ${({ theme }) => theme.colors.blueBackground};

    display: flex;

    &::after {
        content: "";
        position: absolute;
        bottom: -15vh;
        right: -15vh;
        width: 45vh;
        height: 45vh;
        border: 60px solid rgba(255, 255, 255, 0.04);
        border-radius: 50%;
        pointer-events: none;
    }

    &::before {
        content: "";
        position: absolute;
        bottom: -8vh;
        left: -8vh;
        -webkit-box-shadow: 14px -4px 250px 50px #fff000;
        box-shadow: 14px -4px 250px 50px #fff000;
        width: 10vh;
        height: 10vh;
        border-radius: 50%;
        pointer-events: none;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

export const Content = styled.div`
    position: relative;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export const DotsGrid = styled.div`
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
    background-size: 1.75rem 1.75rem;
`;

export const Top = styled.div`
    display: flex;
    flex-direction: column;
`;

export const GovBar = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 4rem;
`;

export const GovLogo = styled.div`
    width: 2.8rem;
    height: 2.8rem;

    border-radius: ${({ theme }) => theme.borderRadius.md};

    background: ${({ theme }) => theme.colors.yellowVibrant};

    display: flex;
    align-items: center;
    justify-content: center;

    color: ${({ theme }) => theme.colors.blueBackground};

    font-size: 1.1rem;
    font-weight: 700;
`;

export const GovText = styled.div`
    display: flex;
    flex-direction: column;

    strong {
        color: ${({ theme }) => theme.colors.text.strong};
        font-size: ${({ theme }) => theme.fontSizes.sm};
    }

    span {
        color: ${({ theme }) => theme.colors.text.normal};
        font-size: ${({ theme }) => theme.fontSizes.xs};
    }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
`;

export const HeroLabel = styled.div`
    width: fit-content;

    padding: 0.3rem 0.9rem;
    display: inline-flex;

    align-items: center;
    justify-content: center;
    gap: 10px;

    border-radius: ${({ theme }) => theme.borderRadius.hero};

    background: ${({ theme }) => theme.colors.yellowVibrantMoreOpaque};
    border: ${({ theme }) => theme.border.xs} solid ${({ theme }) => theme.colors.yellowVibrantOpaque};

    color: ${({ theme }) => theme.colors.yellowVibrant};

    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};

    margin-bottom: 1.5rem;

    &::before {
        content: "";

        width: 6px;
        height: 6px;

        border-radius: 50%;

        background: ${({ theme }) => theme.colors.yellowVibrant};

        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

export const HeroTitle = styled.h1`
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    line-height: 0.95;

    color: ${({ theme }) => theme.colors.text.strong};

    letter-spacing: -0.08em;

    margin-bottom: 1rem;

    em {
        font-style: normal;
        color: ${({ theme }) => theme.colors.yellowVibrant};
    }
`;

export const HeroSub = styled.p`
    max-width: 26rem;

    color: ${({ theme }) => theme.colors.text.normal};

    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.8;
`;

export const Bottom = styled.div`
    width: 100%;
`;

export const StatsRow = styled.div`
    display: flex;
    gap: 2.5rem;

    padding-top: 2rem;

    border-top: ${({ theme }) => theme.border.xs} solid ${({ theme }) => theme.colors.whiteUltraOpaque};

    flex-wrap: wrap;
`;

export const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

export const StatNumber = styled.div`
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};

    color: ${({ theme }) => theme.colors.text.strong};

    span {
        color: ${({ theme }) => theme.colors.yellowVibrant};
    }
`;

export const StatLabel = styled.div`
    color: ${({ theme }) => theme.colors.text.normal};

    font-size: ${({ theme }) => theme.fontSizes.xs};

    text-transform: uppercase;
`;