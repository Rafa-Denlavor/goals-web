import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Logo } from "../components/ui/logo";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { login } from "../service/login";
import { Toaster } from "react-hot-toast";
import { useCookies } from "react-cookie";
import { useState, useEffect } from "react";

type TLogin = {
  username: string;
  password: string;
};

enum ButtonStatus {
  DEFAULT = 'DEFAULT',
  PENDING = 'PENDING',
  FAIL = 'FAIL',
  DONE = 'DONE',
}

export function LoginPage(): any {
  const [cookies, setCookie] = useCookies(["gltoken"], {
    doNotParse: true,
  });

  useEffect(() => {
    if (cookies.gltoken) {
      return window.location.replace("/");
    }
  }, []);

  const [buttonStatus, setButtonStatus] = useState(ButtonStatus.DEFAULT);
  const [passwordIsVisible, setPasswordIsVisible] = useState(true);
  const { register, handleSubmit, formState, reset } = useForm<TLogin>({});

  async function handleLogin(data: any): Promise<void> {
    setButtonStatus(ButtonStatus.PENDING);

    await login(data)
      .then((data) => {
        if (!data.token) {
          return toast.error("Senha ou usuário inválido!");
        }

        const expires = new Date();
        expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);

        setCookie("gltoken", data.token, {
          expires,
        });

        toast.success("Seja bem-vindo de volta!");

        setTimeout(() => {
          reset();
          return window.location.replace("/");
        }, 2000);
      })
      .catch(() => {
        reset();
        setButtonStatus(ButtonStatus.FAIL);

        return toast.error(
          "Não foi possível autenticar seus dados. Tente novamente!"
        );
      })
      .finally(() => setButtonStatus(ButtonStatus.DONE));
  }

  return (
    <section className="flex align-center h-screen">
      <Toaster position="bottom-left" />
      <form
        action=""
        method="post"
        onSubmit={handleSubmit(handleLogin)}
        className="flex flex-col align-center w-[480px] m-auto rounded-md border-2 border-gray-700 p-6"
      >
        <div className="flex justify-center gap-3 mb-8">
          <Logo />
          <h1 className="text-4xl text-center">Login</h1>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              autoFocus
              placeholder="maria_helena"
              {...register("username")}
            />
            {formState.errors.username && (
              <p className="text-red-400 text-s">
                {formState.errors.username.message as any}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="w-full relative">
              <Input
                id="password"
                type={passwordIsVisible ? "password" : "text"}
                autoFocus
                className="w-full"
                placeholder="Deve conter número, letras e caracteres especiais"
                {...register("password")}
              />
              <img
                className="absolute right-4 top-3"
                onClick={() => setPasswordIsVisible(!passwordIsVisible)}
                src={
                  passwordIsVisible ? "./visibility.svg" : "/visibility-off.svg"
                }
                alt="Ver/ocultar senha"
              />
            </div>
            {formState.errors.password && (
              <p className="text-red-400 text-s">
                {formState.errors.password.message as any}
              </p>
            )}
          </div>
        </div>
        <a
          href="/new-account"
          className="text-center underline text-gray-400 mt-6 hover:text-violet-300"
        >
          Novo no Goals? Crie uma conta agora!
        </a>
        <footer className="flex items-center gap-3 mt-8">
          <Button type="submit" className="flex-1" disabled={buttonStatus === ButtonStatus.PENDING}>
            {buttonStatus === ButtonStatus.DEFAULT && 'Entrar no Goals'}
            {buttonStatus === ButtonStatus.PENDING && 'Carregando...'}
            {buttonStatus === ButtonStatus.DONE && 'Sucesso!'}
            {buttonStatus === ButtonStatus.FAIL && 'Hey, tente novamente entrar no Goals'}
          </Button>
        </footer>
      </form>
    </section>
  );
}
