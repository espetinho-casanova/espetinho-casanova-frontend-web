import { useState, FormEvent } from "react";
import Head from "next/head";
import { Header } from "../../components/Header";
import styles from "./styles.module.scss";

import { setupApiClient } from "../../services/api";
import { toast } from "react-toastify";

import { canSSRAuth } from "../../utils/canSSRAuth";

export default function Category() {
  const [name, setName] = useState("");

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (name === "") {
      return;
    }

    const apiClient = setupApiClient();
    await apiClient.post("/category", {
      name: name,
    });

    toast.success("Categoria Cadastrada com sucesso!");
    setName("");
  }

  return (
    <>
      <Head>
        <title>Nova Categoria - Espetinho Casanova</title>
      </Head>

      <div>
        <Header />
        <main className={styles.container}>
          <h1>Cadastrar Categorias</h1>

          <form className={styles.form} onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Digite o nome da ctegoria"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button className={styles.buttonAdd} type="submit">
              Cadastrar
            </button>
          </form>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (context) => {
  return {
    props: {},
  };
});
