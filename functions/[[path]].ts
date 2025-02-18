import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// @ts-ignore
import * as remixBuild from '../build/server/index.js';

const build = remixBuild as unknown as ServerBuild;

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env,
});

// @ts-ignore
export const onRequest = async (context) => {
  return handleRequest(context);
};
