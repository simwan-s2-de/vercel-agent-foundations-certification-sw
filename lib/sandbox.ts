import { Sandbox } from "@vercel/sandbox";

export const SANDBOX_NAME = "admin-agent-sandbox";

export const createOrGetSandbox = async (name: string) => {
  try {
    const sandbox = await Sandbox.get({ name });
    return sandbox;
  } catch {
    const sandbox = await Sandbox.create({
      name,
      snapshotExpiration: 7 * 24 * 60 * 60 * 1000,
      timeout: 2700000,
    });
    return sandbox;
  }
};