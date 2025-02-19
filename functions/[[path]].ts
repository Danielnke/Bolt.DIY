import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// Use a more reliable import path
import * as remixBuild from '../build/server/index.js';

const build = remixBuild as unknown as ServerBuild;

interface Context {
  env: any;
}

function handler(context: { request: Request, env: any }) {
  return createPagesFunctionHandler({
    build,
    mode: process.env.NODE_ENV || 'production',
    getLoadContext: (context) => context.env,
  });
}

export const onRequest = async (context: { request: Request, env: any }) => {
  return handler(context);
};
