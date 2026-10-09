import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./logo";

export function PublicFrame({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cine-bg text-cine-text">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
        <Link to="/" className="inline-flex items-center gap-3 text-cine-muted">
          <ArrowLeft size={18} />
          <Logo size="md" tagline={false} layout="horizontal" />
        </Link>
        <span className="font-ui text-xs font-semibold tracking-[0.12em] text-cine-cyan">{kicker}</span>
      </nav>
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-6">
        <h1 className="font-ui text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-cine-muted">{lede}</p>
        <div className="public-prose mt-10">{children}</div>
      </main>
    </div>
  );
}
