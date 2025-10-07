import React from 'react';
import { Separator } from '@/components/ui/separator';

export const TypographySection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-admin-foreground">Tipografia</h2>
      <Separator className="bg-admin-border" />

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">H1 - The quick brown fox jumps over the lazy dog</h1>
        <h2 className="text-3xl font-semibold tracking-tight first:mt-0">H2 - The quick brown fox jumps over the lazy dog</h2>
        <h3 className="text-2xl font-semibold tracking-tight">H3 - The quick brown fox jumps over the lazy dog</h3>
        <h4 className="text-xl font-semibold tracking-tight">H4 - The quick brown fox jumps over the lazy dog</h4>
        <h5 className="text-lg font-semibold tracking-tight">H5 - The quick brown fox jumps over the lazy dog</h5>
        <h6 className="text-base font-semibold tracking-tight">H6 - The quick brown fox jumps over the lazy dog</h6>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          The first paragraph of text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <blockquote className="mt-6 border-l-2 pl-6 italic text-admin-foreground-muted">
          "The only way to do great work is to love what you do." - Steve Jobs
        </blockquote>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>Item da lista 1</li>
          <li>Item da lista 2</li>
          <li>Item da lista 3</li>
        </ul>
        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
          <li>Item ordenado 1</li>
          <li>Item ordenado 2</li>
          <li>Item ordenado 3</li>
        </ol>
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          console.log("Hello, Design System!");
        </code>
      </div>
    </div>
  );
};