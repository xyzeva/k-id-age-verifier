// add a chunk to extract webpack's moduleCache
let webpackRequire = webpackChunkdiscord_app.push([[Symbol()],{},(r) => r]);
// cleanup the chunk we added
webpackChunkdiscord_app.pop();

let modules = webpackRequire.m;
let cache = webpackRequire.c;

// https://github.com/moonlight-mod/moonlight/blob/main/packages/core-extensions/src/spacepack/webpackModules/spacepack.ts
// helper to find a webpack module via code snippet
function findByCode(src) {
  for (const [id, mod] of Object.entries(modules)) {
    if (mod.toString().includes(src)) {
      return cache[id].exports;
    }
  }
}

// helper to find an object by its key
function findObjectFromKey(exports, key) {
  if (!exports) return;
  for (const exportKey in exports) {
    const obj = exports[exportKey];
    if (obj && obj[key]) return obj;
  }
}

// https://github.com/moonlight-mod/moonlight/blob/main/packages/mappings/src/mappings/discord/utils/HTTPUtils.ts
// find the discord api client
const api = findObjectFromKey(
  findByCode('.set("X-Audit-Log-Reason",'),
  "patch",
);

// send a api request to discord /age-verification/verify and then redirect the page to k-id's website
const request = await api.post({
  url: "/age-verification/verify",
  body: { method: 3 },
});
const verificationUrl = request.body.verification_webview_url;
window.open(verificationUrl, "_blank");