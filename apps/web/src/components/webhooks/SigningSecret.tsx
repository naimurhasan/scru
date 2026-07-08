import { CodeBlock } from "@/components/dashboard/CodeBlock";

export function SigningSecret({ secret }: { secret: string }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">Signing secret</h2>
      <CodeBlock code={secret} className="select-all" />
      <p className="text-xs text-muted-foreground">
        Every webhook carries an <code>X-Scru-Signature</code> header shaped
        like <code>t=timestamp,v1=signature</code>. The signature is the
        HMAC-SHA256 of <code>timestamp.body</code> made with this secret.
        Compare it before trusting the request.
      </p>
    </section>
  );
}
