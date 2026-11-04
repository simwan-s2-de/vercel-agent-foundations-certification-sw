"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { ProductDetailsToolInvocation } from "@/lib/agent";

interface AgentProductCardProps {
  readonly invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({ invocation }: AgentProductCardProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const id = invocation.input?.productId;
    return (
      <output
        className="block overflow-hidden rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground [overflow-wrap:anywhere]"
      >
        Looking up{id ? ` "${id}"` : ""}...
        <div aria-hidden="true" className="mt-3 space-y-3 motion-safe:animate-pulse">
          <div className="aspect-4/3 rounded bg-secondary" />
          <div className="h-4 w-3/4 rounded bg-secondary" />
          <div className="h-3 w-1/2 rounded bg-secondary" />
        </div>
      </output>
    );
  }

  if (invocation.state === "output-error") {
    return (
      <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive [overflow-wrap:anywhere]">
        {invocation.errorText}
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;
  const output = invocation.output;
  if (!output) return null;

  if ("error" in output) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive [overflow-wrap:anywhere]">
        {output.error}
      </div>
    );
  }

  const image = output.images[0];
  const stockLabel = output.stock.lowStock ? "Low stock" : "In stock";
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {image ? (
        <div className="relative aspect-4/3 bg-secondary">
          <Image
            src={image}
            alt={output.name}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-contain"
          />
        </div>
      ) : null}
      <div className="space-y-3 p-4 [overflow-wrap:anywhere]">
        <div>
          <h3 className="text-base font-semibold leading-tight">{output.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatPrice(output.price, output.currency)}
          </p>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{output.description}</p>
        <p className="text-sm font-medium">
          {output.stock.inStock
            ? `${stockLabel}: ${output.stock.stock} available`
            : "Out of stock"}
        </p>
        {output.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {output.tags.slice(0, 5).map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        ) : null}
        <Link
          href={`/products/${output.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          View product
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}