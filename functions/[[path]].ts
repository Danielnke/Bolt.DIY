import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// @ts-ignore
import * as remixBuild from '../build/server/index.js';

const build = remixBuild as unknown as ServerBuild;

interface Context {
  env: any;
}

// Define types for parameters
function handler(context: { request: Request, env: any }) {
  return createPagesFunctionHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: (context) => context.env,
  });
}

// @ts-ignore
export const onRequest = async (context: { request: Request, env: any }) => {
  return handler(context);
};
