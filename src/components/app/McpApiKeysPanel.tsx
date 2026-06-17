"use client";

import { useState } from "react";
import {
  createMcpApiKey,
  listMcpApiKeys,
  revokeMcpApiKey,
} from "@/actions/mcp-keys";
import { AppButton, AppCard } from "@/components/app/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
};

export function McpApiKeysPanel({
  initialKeys,
}: {
  initialKeys: ApiKeyRow[];
}) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function refreshKeys() {
    const result = await listMcpApiKeys();
    if (result.success) {
      setKeys(result.data);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNewSecret(null);
    setCreating(true);

    const result = await createMcpApiKey({ name });
    if (!result.success) {
      setError(result.error);
      setCreating(false);
      return;
    }

    setNewSecret(result.data.secret);
    setName("");
    await refreshKeys();
    setCreating(false);
  }

  async function handleRevoke(keyId: string) {
    setError(null);
    setRevokingId(keyId);

    const result = await revokeMcpApiKey(keyId);
    if (!result.success) {
      setError(result.error);
      setRevokingId(null);
      return;
    }

    setRevokingId(null);
    await refreshKeys();
  }

  return (
    <AppCard
      title="API keys for MCP"
      description="Generate personal keys to connect Finance Buddy from Cursor, Claude Desktop, or other MCP clients."
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Setup instructions and tool reference:{" "}
        <a href="/docs" className="text-accent-green hover:underline">
          MCP documentation
        </a>
        .
      </p>
      <form onSubmit={handleCreate} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="mcp-key-name">Key name</Label>
          <Input
            id="mcp-key-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My laptop"
            maxLength={50}
          />
        </div>
        <AppButton type="submit" loading={creating} disabled={!name.trim()}>
          Create API key
        </AppButton>
      </form>

      {newSecret ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/40">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Copy your key now — it won&apos;t be shown again
          </p>
          <code className="mt-2 block break-all rounded bg-background/80 px-2 py-1 text-xs">
            {newSecret}
          </code>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-6 space-y-3">
        {keys.length === 0 ? (
          <li className="text-sm text-muted-foreground">No active API keys.</li>
        ) : (
          keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{key.name}</p>
                <p className="text-xs text-muted-foreground">
                  {key.key_prefix}… · created{" "}
                  {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at
                    ? ` · last used ${new Date(key.last_used_at).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <AppButton
                type="button"
                variant="secondary"
                loading={revokingId === key.id}
                disabled={revokingId !== null || creating}
                onClick={() => void handleRevoke(key.id)}
              >
                Revoke
              </AppButton>
            </li>
          ))
        )}
      </ul>
    </AppCard>
  );
}
