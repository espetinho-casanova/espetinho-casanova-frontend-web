import {
  GetServerSideProps,
  GetServerSidePropsResult,
  GetServerSidePropsContext,
} from "next";
import { parseCookies } from "nookies";

//função para paginas que só podem ser acessadas por visitantes
export function canSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);

    //se tentatar acessar com o login(tendo cookie) redirecionamos
    if (cookies["@es-casanova.token"]) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    return await fn(context);
  };
}
