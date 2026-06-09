"use client";
import {
    Container,
    Content,
    Description,
    Eyebrow,
    Field,
    Footer,
    Form,
    Header,
    Input,
    LoginButton,
    SectionLabel,
    Title,
    Version,
    GovBar,
    GovLogo,
    GovText,
} from "./styled";
import { MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "../../utils/validateEmail";
import Loading from "../spinner/page";
import { useAlert } from "../../providers/alert/page";
import { useSession } from "../../providers/session/page";
import { api } from "../../service";

function parseTokenExpiry(token: string): number {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp) return payload.exp * 1000;
    } catch {}
    return Date.now() + 60 * 60 * 1000;
}

export default function LoginPanel() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { callMessage } = useAlert();
    const { setSession } = useSession();
    const [isLoading, setIsloading] = useState(false);
    const navigate = useNavigate();

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

        const responseLogin = await api.login(email, password);

        if (!responseLogin.status) {
            callMessage(responseLogin.message ?? "Sistema Super Centro está temporariamente fora do ar!", "error");
            setIsloading(false);
            return null;
        }

        if (responseLogin.token && responseLogin.user) {
            api.setAuthToken(responseLogin.token);
            const expiresAt = parseTokenExpiry(responseLogin.token);
            setSession({ token: responseLogin.token, user: responseLogin.user, expiresAt });
        }

        setIsloading(false);
        navigate("/instituicoes");
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

                    <Description>Use seu login institucional para acessar o SUPER CENTRO.</Description>
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
                    <Version>SUPER CENTRO v1.0 · 2026</Version>

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
