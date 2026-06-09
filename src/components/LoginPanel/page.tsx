"use client";
import {
    Container,
    Content,
    Description,
    Eyebrow,
    Field,
    Footer,
    ForgotPassword,
    Form,
    Header,
    Input,
    Links,
    LoginButton,
    ProfileCard,
    ProfileDescription,
    ProfileGrid,
    ProfileIcon,
    ProfileName,
    SectionLabel,
    Title,
    Version,
    GovBar,
    GovLogo,
    GovText,
} from "./styled";
import { MouseEvent, useState } from "react";
import { validateLogin } from "../../utils/validateEmail";
import Loading from "../spinner/page";
import { useAlert } from "../../providers/alert/page";

export default function LoginPanel() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { callMessage } = useAlert();
    const [isLoading, setIsloading] = useState(false);

    async function handleLogin(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setIsloading(true);

        const response = validateLogin({ email, password });

        if (!response.valid) {
            if (response.errors.email) callMessage(response.errors.email, "warning");
            else if (response.errors.password) callMessage(response.errors.password, "warning");
            setIsloading(false);
            return null;
        }

        // const responseLogin = await login(email, password);

        // if (!responseLogin.status) callMessage(responseLogin.message ?? "Sistema SAH está temporariamente fora do ar!", "error");
        setIsloading(false);
    }

    return (
        <Container>
            <Content>
                <GovBar>
                    <GovLogo>MS</GovLogo>

                    <GovText>
                        <strong>Ministério da Saúde</strong>
                        <span>Departamento de Atenção ao Câncer </span>
                    </GovText>
                </GovBar>
                <Header>
                    <Eyebrow>Acesso restrito</Eyebrow>

                    <Title>Entrar no sistema</Title>

                    <Description>Use seu login institucional para acessar o SAH.</Description>
                </Header>

                <Form>
                    <SectionLabel>Perfil de acesso</SectionLabel>

                    <Field>
                        <label>Login</label>

                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
                    </Field>

                    <Field>
                        <label>Senha</label>

                        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
                    </Field>

                    {/* <ForgotPassword href="#">Esqueceu a senha?</ForgotPassword> */}

                    <LoginButton disabled={isLoading} type="submit" onClick={handleLogin}>
                        {isLoading ? <Loading text="" heightSpinner="24px" widthSpinner="24px"></Loading> : "Entrar no sistema"}
                    </LoginButton>
                </Form>

                <Footer>
                    <Version>SAH v1.0 · 2026</Version>

                    {/* <Links>
                        <a href="#">Suporte</a>
                        <a href="#">Manual</a>
                        <a href="#">Privacidade</a>
                    </Links> */}
                </Footer>
            </Content>
        </Container>
    );
}
