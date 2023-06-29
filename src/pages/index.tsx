import { FormEvent, useContext, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/home.module.scss";

import logoImg from "../../public/logo-white.svg";

import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-toastify";

import Link from "next/link";

import { canSSRGuest } from "../utils/canSSRGuest";

export default function Home() {
  const { signIn } = useContext(AuthContext);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    // Verificar se o login e a senha foram fornecidos
    if (login === "" || password === "") {
      // Exibir mensagem de erro ao usuário
      toast.warn("Por favor, forneca seu login e senha!");
      return;
    }

    setLoading(true);

    let data = {
      login,
      password,
    };

    await signIn(data);

    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Espetinho Casanonova - Login</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.login}>
          <h1>Faça login!</h1>
          <form onSubmit={handleLogin}>
            <Input
              placeholder="Digite seu login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />

            <Input
              placeholder="Digite sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" loading={loading}>
              Acessar
            </Button>
          </form>

          <Link legacyBehavior href="/signup">
            <a className={styles.text}>Cadastre-se</a>
          </Link>
        </div>

        <Image className="logo" src={logoImg} alt="Logo Espetinho Casanova" />
      </div>
    </>
  );
}

export const getServerSideProps = canSSRGuest(async (context) => {
  return {
    props: {},
  };
});
