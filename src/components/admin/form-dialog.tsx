"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { FormState } from "@/app/actions/admin";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { RowActions } from "./toolbar";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "date" | "select" | "textarea" | "switch";
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  wide?: boolean;
  placeholder?: string;
};

type Action = (prev: FormState, f: FormData) => Promise<FormState>;

function Form({ fields, values, action, onDone, submit }: { fields: FieldDef[]; values?: Record<string, unknown>; action: Action; onDone: () => void; submit: string }) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);
  return (
    <form action={run} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const v = values?.[f.name];
        const id = `f-${f.name}`;
        const span = f.wide || f.type === "textarea" ? "sm:col-span-2" : "";
        if (f.type === "switch")
          return (
            <div key={f.name} className={`flex items-end pb-2 ${span}`}>
              <Switch name={f.name} defaultChecked={v === undefined ? true : Boolean(v)} label={f.label} />
            </div>
          );
        return (
          <Field key={f.name} label={f.label} htmlFor={id} hint={f.hint} className={span}>
            {f.type === "select" ? (
              <Select id={id} name={f.name} defaultValue={v === undefined || v === null ? "" : String(v)}>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : f.type === "textarea" ? (
              <Textarea id={id} name={f.name} defaultValue={v === undefined || v === null ? "" : Array.isArray(v) ? v.join("\n") : String(v)} placeholder={f.placeholder} required={f.required} />
            ) : (
              <Input id={id} name={f.name} type={f.type ?? "text"} defaultValue={v instanceof Date ? v.toISOString().slice(0, 10) : v === undefined || v === null ? "" : String(v)} placeholder={f.placeholder} required={f.required} />
            )}
          </Field>
        );
      })}
      {state.error && <p className="text-sm font-semibold text-destructive sm:col-span-2">{state.error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : submit}
        </Button>
      </div>
    </form>
  );
}

export function CreateButton({ label, title, fields, action, values, variant = "default", size, icon = <Plus /> }: { label: string; title: string; fields: FieldDef[]; action: Action; values?: Record<string, unknown>; variant?: ButtonVariant; size?: "sm" | "md"; icon?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => (setKey((k) => k + 1), setOpen(true))}>
        {icon} {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <Form key={key} fields={fields} values={values} action={action} onDone={() => setOpen(false)} submit="Simpan" />
      </Dialog>
    </>
  );
}

export function EditRow({ what, title, fields, values, action, onDelete }: { what: string; title: string; fields: FieldDef[]; values: Record<string, unknown>; action: Action; onDelete?: () => Promise<{ error?: string }> }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <>
      <RowActions what={what} onEdit={() => (setKey((k) => k + 1), setOpen(true))} onDelete={onDelete} />
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <Form key={key} fields={fields} values={values} action={action} onDone={() => setOpen(false)} submit="Simpan perubahan" />
      </Dialog>
    </>
  );
}
