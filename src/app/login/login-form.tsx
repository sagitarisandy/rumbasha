"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { Button, LinkButton } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/form";

const DEMO = [
  { label: "Siswa", email: "nadia.aulia@gmail.com", password: "siswa123" },
  { label: "Admin", email: "rina@rumbasha.id", password: "admin123" },
];

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [email, setEmail] = useState(state.email ?? "");
  const [password, setPassword] = useState("");

  return (
    <div className="w-full">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <Field label="Email atau No. HP" htmlFor="email">
          <Input id="email" name="email" autoComplete="username" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Kata sandi" htmlFor="password" error={state.error}>
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!state.error || undefined} required />
        </Field>
        <div className="flex items-center justify-between">
          <Checkbox name="remember" defaultChecked label="Ingat saya" />
          <a href="https://wa.me/6281234567890?text=Halo%20admin%2C%20saya%20lupa%20kata%20sandi%20Rumbasha" target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-primary">
            Lupa kata sandi?
          </a>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Memeriksa…" : "Masuk"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-border" />
        atau
        <span className="h-px flex-1 bg-border" />
      </div>
      <LinkButton href="/trial" variant="outline" size="lg" className="w-full">
        Coba quiz gratis
      </LinkButton>

      <div className="mt-6 rounded-2xl border border-dashed border-[#c9cbe0] bg-sidebar p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Akun demo (preview)</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {DEMO.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword(d.password);
              }}
              className="rounded-xl bg-white px-3 py-2 text-left text-[13px] shadow-tab transition hover:ring-2 hover:ring-primary/30"
            >
              <span className="font-semibold text-ink">{d.label}</span>
              <span className="block truncate text-subtle">{d.email}</span>
              <span className="text-subtle">sandi: {d.password}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-center text-xs text-subtle">
        Butuh bantuan?{" "}
        <Link href="https://wa.me/6281234567890" className="font-semibold text-primary">
          Chat admin
        </Link>
      </p>
    </div>
  );
}
