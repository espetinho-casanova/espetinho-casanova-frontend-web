import { createContext, ReactNode, useState, useEffect } from "react";

import { api } from "../services/apiClient";

import { setCookie, parseCookies, destroyCookie } from "nookies";
import Router from "next/router";

import { toast } from "react-toastify";

type AuthContextData = {
  user: UserProps;
  isAuthenticated: boolean;
  signIn: (credentials: SingInProps) => Promise<void>;
  signOut: () => void;
  signUp: (credentials: SignUpProps) => Promise<void>;
};

type UserProps = {
  id: string;
  name: string;
  login: string;
};

type SingInProps = {
  login: string;
  password: string;
};

type SignUpProps = {
  name: string;
  login: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  try {
    destroyCookie(undefined, "@es-casanova.token");
    Router.push("/");
  } catch {
    console.log("Erro ao deslogar!");
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>();
  const isAuthenticated = !!user;

  useEffect(() => {
    //tentar pegar o token no cookie
    const { "@es-casanova.token": token } = parseCookies();

    if (token) {
      api
        .get("/userinfo")
        .then((response) => {
          const { id, name, login } = response.data;

          setUser({
            id,
            name,
            login,
          });
        })
        .catch(() => {
          //Se der erro deslogar o usuario.
          signOut();
        });
    }
  }, []);

  async function signIn({ login, password }: SingInProps) {
    try {
      const response = await api.post("/session", {
        login,
        password,
      });

      const { id, name, token } = response.data;

      setCookie(undefined, "@es-casanova.token", token, {
        maxAge: 60 * 60 * 24 * 30, // expira em um mês
        path: "/", //quais caminhos terao acesso ao cookie ( todos )
      });

      setUser({
        id,
        name,
        login,
      });

      //passar para proximas requisições o token

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      toast.success("Logado com sucesso!");

      //Redirecionar o usuario que estiver logado para /dashboard
      Router.push("/dashboard");
    } catch (err) {
      toast.error("Erro ao acessar!");
      console.log("Erro ao acessar ", err);
    }
  }

  async function signUp({ name, login, password }: SignUpProps) {
    try {
      const response = await api.post("/users", {
        name,
        login,
        password,
      });

      toast.success("Conta criada com sucesso!");

      Router.push("/");
    } catch (err) {
      const { error } = err.response.data;
      toast.error(error);

      console.log("Erro ao cadastrar: ", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signIn, signOut, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}
