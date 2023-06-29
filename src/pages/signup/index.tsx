import { useState, FormEvent, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../../../styles/home.module.scss";

import logoImg from "../../../public/logo-white.svg";

import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

import Link from "next/link";

export default function SignUp() {
  const { signUp } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignUp(event: FormEvent) {
    event.preventDefault();

    // Verificar se o nome, login e senha foram fornecidos
    if (name === "" || login === "" || password === "") {
      // Exibir mensagem de erro ao usuário
      toast.warn("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);

    let data = {
      name,
      login,
      password,
    };

    await signUp(data);

    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Cradastrar usuário</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.login}>
          <h1>Criando sua conta</h1>

          <form onSubmit={handleSignUp}>
            <Input
              placeholder="Digite o nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              placeholder="Digite o login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />

            <Input
              placeholder="Digite a senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" loading={loading}>
              Cadastrar
            </Button>
          </form>

          <Link legacyBehavior href="/">
            <a className={styles.text}>Já possui uma conta? Faça login!</a>
          </Link>
        </div>

        <Image className="logo" src={logoImg} alt="Logo Espetinho Casanova" />
      </div>
    </>
  );
}
