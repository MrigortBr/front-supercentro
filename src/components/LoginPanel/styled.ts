import styled from "styled-components";

export const Container = styled.section`
    width: 100%;
    max-height: 90vh;

    background: ${({ theme }) => theme.colors.white};

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 3rem 2rem;

    position: relative;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 0.3rem;
        height: 100%;
        background: linear-gradient(180deg, ${({ theme }) => theme.colors.yellowVibrant}, ${({ theme }) => theme.colors.blueBackground});
    }

    @media (max-width: 768px) {
        height: 90dvh;
        max-height: 87dvh;
        position: relative;

        &::before {
            height: 100dvh;
            z-index: 40;
        }

        &::after {
            content: "";
            position: absolute;
            right: 0;
            top: 0;
            width: 0.3rem;
            height: 100dvh;
            z-index: 40;
            background: linear-gradient(180deg, ${({ theme }) => theme.colors.yellowVibrant}, ${({ theme }) => theme.colors.blueBackground});
        }
    }
`;

export const Content = styled.div`
    width: 100%;
    max-width: 24rem;
`;

export const Header = styled.div`
    margin-top: 7vh;
    margin-bottom: 2rem;
`;

export const Eyebrow = styled.p`
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.medium};

    letter-spacing: 0.15em;
    text-transform: uppercase;

    color: ${({ theme }) => theme.colors.blueLight};

    margin-bottom: 0.2rem;
`;

export const Title = styled.h2`
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.greenDark};

    margin-bottom: 0.2rem;
`;

export const Description = styled.p`
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.gray};

    line-height: 1.7;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

export const SectionLabel = styled.p`
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.regular};

    margin-bottom: 0.5rem;

    color: ${({ theme }) => theme.colors.greenDark};
`;

export const ProfileGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 0.8rem;

    margin-bottom: 1rem;
`;

export const ProfileCard = styled.div<{ $active: boolean }>`
    padding: 0.5rem;

    border-radius: 0.8rem;

    border: 1.5px solid ${({ $active }) => ($active ? "#2E7D52" : "#E4EBE6")};

    background: ${({ $active }) => ($active ? "#EAF4EF" : "#F4F6F4")};

    cursor: pointer;

    transition: 0.2s;

    display: flex;
    align-items: center;
    gap: 0.8rem;

    &:hover {
        border-color: #2e7d52;
    }
`;

export const ProfileIcon = styled.div`
    width: 2.5rem;
    height: 2.5rem;

    border-radius: ${({ theme }) => theme.borderRadius.md};

    background: ${({ theme }) => theme.colors.blueBackground};

    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ProfileName = styled.div`
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};

    color: ${({ theme }) => theme.colors.greenDark};
`;

export const ProfileDescription = styled.div`
    font-size: ${({ theme }) => theme.fontSizes.xxs};

    color: ${({ theme }) => theme.colors.gray};
`;

export const Field = styled.div`
    display: flex;
    flex-direction: column;

    gap: 0.5rem;

    margin-bottom: 1.2rem;

    label {
        font-size: ${({ theme }) => theme.fontSizes.xs};
        font-weight: ${({ theme }) => theme.fontWeights.medium};

        color: ${({ theme }) => theme.colors.greenDark};
    }
`;

export const Input = styled.input`
    width: 100%;

    padding: 0.9rem 1rem;

    border-radius: 0.7rem;

    border: 1.5px solid ${({ theme }) => theme.colors.grayUltraLight};

    background: ${({ theme }) => theme.colors.grayLight};

    outline: none;

    transition: 0.2s;

    &:focus {
        border-color: ${({ theme }) => theme.colors.blueLight};
        background: ${({ theme }) => theme.colors.white};
    }
`;

export const ForgotPassword = styled.a`
    width: fit-content;

    margin-left: auto;
    margin-bottom: 1.5rem;

    color: ${({ theme }) => theme.colors.blueLight};

    font-size: ${({ theme }) => theme.fontSizes.xs};

    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

export const LoginButton = styled.button`
    width: 100%;

    height: 3.2rem;

    border: none;
    border-radius: 0.8rem;

    background: ${({ theme }) => theme.colors.blueBackground};

    color: ${({ theme }) => theme.colors.white};

    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};

    cursor: pointer;

    transition: 0.2s;

    &:hover {
        background: ${({ theme }) => theme.colors.blueLight};
        transform: translateY(-1px);
    }
`;

export const Footer = styled.div`
    margin-top: 2rem;

    padding-top: 0.5rem;

    border-top: 1px solid #e4ebe6;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 1rem;

    flex-wrap: wrap;
    margin-bottom: 6vh;
`;

export const Version = styled.span`
    font-size: ${({ theme }) => theme.fontSizes.xxs};

    color: ${({ theme }) => theme.colors.gray};
`;

export const Links = styled.div`
    display: flex;
    gap: 1rem;

    a {
        color: ${({ theme }) => theme.colors.gray};

        font-size: ${({ theme }) => theme.fontSizes.xxs};

        text-decoration: none;

        &:hover {
            color: #1b5e3b;
        }
    }
`;

export const GovBar = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 4rem;
    display: none;

    @media (max-width: 768px) {
        display: flex;
        margin-left: 0;
        background-color: ${({ theme }) => theme.colors.greenUltraLight};
        padding: 10px;
        border-radius: 20px;
    }
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
