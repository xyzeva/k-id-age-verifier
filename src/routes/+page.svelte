<script lang="ts">
import { page } from "$app/state";
import { onMount } from "svelte";

const webviewUrl = page.url.searchParams.get("webviewUrl");

let enteredWebviewUrl = $state<string>("");
let status = $state<"pending" | "complete" | "error">("pending");
let error = $state<string | null>(null);

onMount(() => {
  if (!webviewUrl) return;

  fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webviewUrl }),
  }).then(async (r) => {
    if (!r.ok) {
      const errorText = await r.text().catch(() => "");
      throw new Error(
        "failed to verify your age: " + r.status + " "
          + errorText.substring(0, Math.min(errorText.length, 200)),
      );
    }

    status = "complete";
  }).catch((e) => {
    status = "error";
    error = e.message;
  });
});

const baseUrl = new URL(page.url);
baseUrl.pathname = "/";
baseUrl.search = "";
baseUrl.hash = "";

const VERIFICATION_SCRIPT = `// add a chunk to extract webpack's moduleCache
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

// send a api request to discord /age-verification/verify/v2 and then redirect the page to our website with the webview url
const request = await api.post({
  url: "/age-verification/verify/v2",
  body: { method: 3, vendor: 1 },
});
const verificationUrl = request.body.verification_webview_url;
window.location.href = "${baseUrl.toString()}?webviewUrl=" + encodeURIComponent(verificationUrl);`;
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/@arborium/arborium@2/dist/arborium.iife.js"></script>
</svelte:head>

{#if webviewUrl}
  {#if status === "pending"}
    <p class="font-bold">
      verifying your age automatically, do not close this tab
    </p>
  {:else if status === "complete"}
    <p class="font-bold text-[#55FF55]">your age has been verified!! c:</p>
  {:else}
    <p class="text-[#FF5555]">
      {
        error
        ?? "something went wrong while trying to verify your age, please try again later."
      }
    </p>
  {/if}
{:else}
  <h1 class="text-2xl font-bold">using on discord</h1>
  <p>
    go to discord on your browser, open up your developer tools, usually with
    <span class="font-bold">control + shift + i</span>. from there, go to the
    <span class="font-bold">Console</span> tab, and paste the following in.
  </p>
  <pre class="my-4 hidden md:block bg-white/10 p-5 text-wrap"><code class="language-js"
            >{VERIFICATION_SCRIPT}</code
        ></pre>

  <div class="md:hidden my-4 text-red-400">
    <p>
      you are probably on a phone which would making using the script nearly
      impossible, but if you'd like to try anyway, click the button below to
      copy anyway
    </p>
    <button
      class="cursor-pointer hover:bg-red-400 hover:border-white border-2 border-red-400 mt-4 px-6 py-2 text-white"
      onclick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(VERIFICATION_SCRIPT);
      }}
    >
      copy
    </button>
  </div>

  <h1 class="text-2xl font-bold">using on other platforms</h1>

  <p>
    go to their age verification flow, and try to get the k-id webview url out.
    it likely is in an iframe, or it will straight up redirect you to k-id, when
    you do, paste it below:
  </p>

  <div class="flex w-full flex-row mt-4 gap-2">
    <input
      class="px-2 w-full py-1 border-2 border-red-300"
      bind:value={enteredWebviewUrl}
      type="text"
      placeholder="https://family.k-id.com/..."
    />
    <button
      onclick={(e) => {
        e.preventDefault();
        window.location.href = `${baseUrl.toString()}?webviewUrl=`
          + encodeURIComponent(enteredWebviewUrl);
      }}
      class="cursor-pointer hover:bg-red-400 hover:border-white border-2 border-red-400 px-6 py-2"
    >
      go!!
    </button>
  </div>

  <h1 class="text-2xl font-bold mt-8">why isn't this open-source?</h1>
  <p>
    this was the case last iteration of k-id-age-verifier, we made everything
    open. the problem was that k-id engineers were also looking at the code, and
    it led to a war of them patching something only for us to fix it, only for
    them to patch it again as close to 5 minutes later.
    <br />
    <br />
    i think the <a
      class="underline"
      href="https://github.com/xyzeva/k-id-age-verifier/commits/main/"
    >commit history</a> says it all. we still plan to open source this after all
    is done and dusted and a majority of people have verified.
  </p>

  <h1 class="text-2xl font-bold mt-8">what's the reason for this existing?</h1>
  <p>
    suprisingly not the one you think. i don't hate discord, not at all. i think
    the way they are doing age verification is probably one of the most
    reasonable implementations of it. i more blame the governments forcing it
    upon them.
    <br />
    <br />
    while it's probably one of the most reasonable implementations, it doesn't
    mean i want to do it, still. and i think there's many people who don't
    either. this isn't meant to be hate against discord.
    <br />
    <br />
    a lot of you would be automatically age-verified anyway, with the help of
    app store signals that discord is using right now to automatically verify
    you without you having to do anything. but i am not one of those people, and
    many still aren't. i would be perfectly fine with discord handling the data
    of a credit card (because they already have said data), but the fact it's
    being off-loaded to a third party is what gets me.
  </p>
{/if}
