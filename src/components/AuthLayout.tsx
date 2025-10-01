import { Logo } from "@/components/Logo";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-between bg-gradient-to-br from-purple-700 to-indigo-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-black/20" />
        <div className="z-10">
          <Logo theme="dark" />
        </div>
        <div className="z-10 max-w-md text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Gerencie seu condomínio com facilidade
          </h2>
          <p className="mt-4 text-purple-200">
            Uma plataforma completa para administradores, gestores e moradores.
            Tudo em um só lugar.
          </p>
        </div>
        <div className="z-10 text-sm text-purple-300">
          &copy; {new Date().getFullYear()} Seu App. Todos os direitos reservados.
        </div>
      </div>
      <div className="flex items-center justify-center p-6 py-12 sm:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};