import { Logo } from "@/components/Logo";
import React from "react";
import { DynamicLogo } from "./DynamicLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-between p-12 text-white lg:flex">
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"
          alt="Interior de um apartamento moderno"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/80 to-indigo-900/80" />
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
          <div />
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Gerencie seu condomínio com facilidade
            </h2>
            <p className="mt-4 text-purple-200">
              Uma plataforma completa para administradores, gestores e moradores.
              Tudo em um só lugar.
            </p>
          </div>
          <div className="text-sm text-purple-300">
            &copy; {new Date().getFullYear()} Seu App. Todos os direitos reservados.
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 py-12 sm:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <DynamicLogo />
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