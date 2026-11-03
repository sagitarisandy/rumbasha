"use client";

import { useOptimistic, useTransition } from "react";
import { toggleTask } from "@/app/actions/admin";

export function TaskCheck({ id, done }: { id: number; done: boolean }) {
  const [on, setOn] = useOptimistic(done);
  const [, start] = useTransition();
  return (
    <input
      type="checkbox"
      checked={on}
      onChange={() => start(async () => (setOn(!on), await toggleTask(id)))}
      aria-label="Tandai selesai"
      className={`size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-[#c9cbe0] bg-center bg-no-repeat transition checked:border-primary checked:bg-primary checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='white'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M20%206%209%2017l-5-5'/%3E%3C/svg%3E")] checked:bg-[length:12px]`}
    />
  );
}
