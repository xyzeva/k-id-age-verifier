<script lang="ts">
	import QRCodeScanner from '$lib/components/QRCodeScanner.svelte';

	const IS_PATCHED = false;
</script>

<div class="mx-auto w-screen max-w-6xl items-center p-5 pb-16">
	<h1 class="mt-16 text-center text-3xl font-extrabold">
		discord/twitch/kick/snapchat age verifier
	</h1>
	<p class="text-center">
		age verifies your account automatically as an adult on any website using k-id
	</p>
	<p class="mt-4 text-center text-white/50">
		made by <a class="underline" href="https://kibty.town" target="_blank">xyzeva</a> and
		<a class="underline" href="https://github.com/Dziurwa14" target="_blank">Dziurwa</a>, greetz to
		<a class="underline" href="https://amplitudes.me/" target="_blank">amplitudes</a> (for previous work)
	</p>

	{#if !IS_PATCHED}
		<h2 class="mt-8 text-2xl font-bold">how to verify on discord</h2>
		<div class="mt-4 flex flex-col bg-red-500/50 p-5">
			<h1 class="text-2xl font-extrabold">important: please re-read</h1>
			<p>
				we recently had to remove the fully automatic k-id verification for discord because of fixes
				by k-id.
				<br />
				<br />
				please re-read the discord section, as you will now have to scan a qr code it gives you. (the
				qr code scanner is below the code snippet)
			</p>
		</div>
		<div class="mt-4 flex flex-col bg-red-500/50 p-5">
			<h1 class="text-2xl font-extrabold">important: not seeing face scan</h1>
			<p>
				if you are not seeing a face scan option on k-id, try using a vpn and setting it in europe (uk is best but something like the netherlands works)
			</p>
		</div>
		<p class="mt-4 text-left">
			it <span class="font-bold">doesn't matter</span> if you are in the UK or similar region that
			currently has access to this, this will verify your account for the future global rollout in
			march aswell as current. to use, simply paste this script into your discord console by going
			to
			<a
				class="font-bold underline"
				href="https://discord.com/app"
				target="_blank"
				rel="noreferer noopener">discord.com/app</a
			>, pressing <span class="font-bold">F12</span>, going to
			<span class="font-bold">Console</span>
			and copying and pasting and hitting enter on the following script and solving the captcha that pops
			up
			<span class="text-white/70">(typing "allow pasting" before if necessary)</span>:
		</p>
		<pre class="my-4 bg-white/10 p-5 text-wrap">
// add a chunk to extract webpack's moduleCache
let webpackRequire = webpackChunkdiscord_app.push([[Symbol()],&lcub;&rcub;,(r) => r]);
// cleanup the chunk we added
webpackChunkdiscord_app.pop();

let modules = webpackRequire.m;
let cache = webpackRequire.c;

// https://github.com/moonlight-mod/moonlight/blob/main/packages/core-extensions/src/spacepack/webpackModules/spacepack.ts
// helper to find a webpack module via code snippet
function findByCode(src) &lcub;
  for (const [id, mod] of Object.entries(modules)) &lcub;
    if (mod.toString().includes(src)) &lcub;
      return cache[id].exports;
    &rcub;
  &rcub;
&rcub;

// helper to find an object by its key
function findObjectFromKey(exports, key) &lcub;
  if (!exports) return;
  for (const exportKey in exports) &lcub;
    const obj = exports[exportKey];
    if (obj && obj[key]) return obj;
  &rcub;
&rcub;

// https://github.com/moonlight-mod/moonlight/blob/main/packages/mappings/src/mappings/discord/utils/HTTPUtils.ts
// find the discord api client
const api = findObjectFromKey(
  findByCode('.set("X-Audit-Log-Reason",'),
  "patch",
);

// send a api request to discord /age-verification/verify and then redirect the page to k-id's website
const request = await api.post(&lcub;
  url: "/age-verification/verify",
  body: &lcub; method: 3 &rcub;,
&rcub;);
const verificationUrl = request.body.verification_webview_url;
window.location.href = verificationUrl;</pre>
		<p class="text-center text-white/50">
			(feel free to read the code, we made it readable and we have nothing to hide)
		</p>
		<p class="mt-4 text-left">
			it should navigate to a k-id, verification page, from there hit the face scan option and
			upload/scan/type the qr code it gives you below and press <span class="font-extrabold"
				>verify</span
			>. <span class="font-bold">if you don't see a face scan option</span>, try vpning out of the
			usa and try again, this is something discord is rolling out that makes usa based users only
			have the id scan option.
		</p>
		<QRCodeScanner />

		<h2 class="mt-4 text-2xl font-bold">
			how to verify on other platforms (twitch, kick, snapchat, ...others)
		</h2>
		<p>
			navigate to the age verification page and choose selfie, from there, get the url of the qr
			code and put it in this input box, and press <span class="font-extrabold">verify</span>
		</p>
		<QRCodeScanner />
	{:else}
		<p class="mt-8 text-red-500">
			the age verifier is currently patched, we are working on a fix and will update this page when
			we do.
		</p>
	{/if}

	<h2 class="mt-8 text-2xl font-bold">how does this work</h2>
	<p>
		k-id, the age verification provider discord uses doesn't store or send your face to the server.
		instead, it sends a bunch of metadata about your face and general process details. while this is
		good for your privacy <span class="text-white/50"
			>(well, considering some other providers send actual videos of your face to their servers)</span
		>, its also bad for them, because we can just send legitimate looking metadata to their servers
		and they have no way to tell its not legitimate.
		<br />
		while this was easy in the past, k-id's partner for face verification (faceassure) has made this significantly
		harder to achieve after
		<a href="https://github.com/amplitudesxd/discord-k-id-verifier" class="underline"
			>amplitudes k-id verifier</a
		>
		was released,
		<span class="text-white/50">(which doesn't work anymore because of it.)</span>
		<br />
		<br />
		with discord's decision of making the age verification requirement global, we decided to look into
		it again to see if we can bypass the new checks.
	</p>
	<h3 class="mt-8 text-xl font-bold">step 1: encrypted_payload and auth_tag</h3>

	<p>
		the first thing we noticed that the old implementation doesn't send when comparing a legitimate
		request payload with a generated one, is its missing <code class="bg-white/20 text-blue-400"
			>encrypted_payload</code
		>, <code class="bg-white/20 text-blue-400">auth_tag</code>,
		<code class="bg-white/20 text-blue-400">timestamp</code>
		and
		<code class="bg-white/20 text-blue-400">iv</code> in the body.
		<br />
		<br />
		looking at the code, this appears to be a simple AES-GCM cipher with the key being
		<code class="bg-white/20"
			><span class="text-orange-300">nonce</span> + <span class="text-orange-300">timestamp</span> +
			<span class="text-orange-300">transaction_id</span></code
		>, derived using HKDF (sha256). we can easily replicate this and also create the missing
		parameters in our generated output.
	</p>
	<h3 class="mt-8 text-xl font-bold">step 2: prediction data</h3>
	<p>
		heres where it kind of gets tricky, even after perfectly replicating the encryption, our
		verification attempt still doesn't succeed, so they must also be doing checks on the actual
		payload.
		<br />
		<br />
		after some trial and error, we narrowed the checked part to the prediction arrays, which are
		<code class="bg-white/20 text-blue-400">outputs</code>,
		<code class="bg-white/20 text-blue-400">primaryOutputs</code>
		and <code class="bg-white/20 text-blue-400">raws</code>.
		<br />
		<br />
		turns out, both <code class="bg-white/20 text-blue-400">outputs</code> and
		<code class="bg-white/20 text-blue-400">primaryOutputs</code>
		are generated from <code class="bg-white/20 text-blue-400">raws</code>. basically, the raw
		numbers are mapped to age outputs, and then the outliers get removed with z-score (once for
		<code class="bg-white/20 text-blue-400">primaryOutputs</code>
		and twice for <code class="bg-white/20 text-blue-400">outputs</code>).
		<br />
		<br />
		there is also some other differences:
	</p>
	<ul
		class="list-inside list-disc
"
	>
		<li>
			<code class="bg-white/20 text-blue-400">xScaledShiftAmt</code> and
			<code class="bg-white/20 text-blue-400">yScaledShiftAmt</code> in predictions are not random but
			rather can be one of two values
		</li>
		<li>
			it is checked that the media name (camera) matches one of your media devices in the array of
			devices
		</li>
		<li>it is checked if the states completion times match the state timeline</li>
	</ul>

	<h3 class="mt-8 text-xl font-bold">the (failed) patch</h3>
	<p>
		after the initial release, k-id's provider for face scans, privately added a patch to this
		script. however, the patch wasn't sufficient enough and we bypassed it. <span
			class="text-white/50">(so the script works again!)</span
		>
		<br />
		<br />
		the patch was the fact they started checking
		<code class="bg-white/20 text-blue-400">recordedOpennessStreak</code>,
		<code class="bg-white/20 text-blue-400">recordedSpeeds</code>,
		<code class="bg-white/20 text-blue-400">failedOpennessReadings</code>,
		<code class="bg-white/20 text-blue-400">failedOpennessSpeeds</code> and
		<code class="bg-white/20 text-blue-400">failedOpennessIntervals</code> to be valid by checking the
		values referencing eachother server-side.
	</p>

	<p>
		<br />
		with all of that done,
		<span class="font-extrabold">we can officially verify our age as an adult.</span> all of this
		code is open source and available
		<a
			href="https://github.com/xyzeva/k-id-age-verifier"
			target="_blank"
			class="font-extrabold underline"
			rel="noreferer noopener">on github</a
		>, so you can actually see how we do this exactly.
	</p>
</div>
