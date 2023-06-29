import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";
import { AuthTokenError } from "./errors/AuthTokenError";

import { signOut } from "../contexts/AuthContext";

export function setupApiClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["@es-casanova.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response.status === 401) {
        //Qualquer erro 401 (nao autorizado) devemos delogar o usuario
        if (typeof window !== undefined) {
          //chamar funçao para deslogar
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      // Erros 400
      if (error.response.status === 400) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
      }

      return Promise.reject(error);
    }
  );

  return api;
}
