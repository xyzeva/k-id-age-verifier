// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env: Env;
      ctx: ExecutionContext;
      caches: CacheStorage;
      cf?: IncomingRequestCfProperties;

      env: {
        VERIFIER_KV: KVNamespace;
      };
    }

    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
  }
}

export {};
