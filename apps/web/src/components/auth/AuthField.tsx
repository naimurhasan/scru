import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFieldProps = ComponentProps<typeof Input> & {
  name: string;
  label: string;
};

export function AuthField({ name, label, ...input }: AuthFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required {...input} />
    </div>
  );
}
