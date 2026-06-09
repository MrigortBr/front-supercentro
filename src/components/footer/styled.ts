import styled from "styled-components";

export const FooterContainer = styled.footer`
    width: 100%;
    height: 100%;

    padding: 0 24px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: ${({ theme }) => theme.colors.white};

    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.greenDark};

    border-top: 1px solid ${({ theme }) => theme.colors.blueBackground};
    @media (max-width: 768px) {
        width: 100dvw;
        height: 12dvh;
        height: auto;

        flex-direction: column;

        justify-content: center;
        align-items: flex-start;

        gap: 8px;

        padding: 16px 24px;
    }
`;

export const FooterLeft = styled.div`
    font-weight: 500;

    @media (max-width: 768px) {
        text-align: center;
        width: 100%;
    }
`;

export const FooterRight = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        width: 100%;
        margin: auto;
    }
`;

export const ImageWrapper = styled.div`
    position: relative;
    height: 9vh;
    max-height: 9vh;
    width: auto;
    aspect-ratio: 3 / 1;
    display: flex;

    @media (max-width: 768px) {
        aspect-ratio: 3 / 1;
        width: 30dvw;
        height: auto;
        max-height: 9dvh;
        flex-wrap: wrap;
    }

    & > img {
        height: 80%;
        max-height: 9vh;
        aspect-ratio: 3 / 1;
        margin: auto;
    }
`;
