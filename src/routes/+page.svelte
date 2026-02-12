<script lang="ts">
	import jsQR from 'jsqr';

	let qrCodeUrl = $state<string | null>(null);
	let qrCodeError = $state<string | null>(null);
	let qrCodeSuccess = $state(false);

	const IS_PATCHED = false;

	let fileInput = $state<HTMLInputElement>();
	let dragOver = $state(false);

	async function decodeImage(file: File) {
		qrCodeError = null;
		try {
			const bitmap = await createImageBitmap(file);
			const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(bitmap, 0, 0);
			const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
			const result = jsQR(imageData.data, imageData.width, imageData.height);
			if (result) {
				qrCodeUrl = result.data;
			} else {
				qrCodeError = 'no qr code found in image';
			}
		} catch {
			qrCodeError = 'could not read image';
		}
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			decodeImage(file);
		} else {
			qrCodeError = 'please drop an image file';
		}
	}
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

// send a api request to discord /age-verification/verify and then redirect the page to our website
const request = await api.post(&lcub;
  url: "/age-verification/verify",
  body: &lcub; method: 3 &rcub;,
&rcub;);
const verificationUrl = request.body.verification_webview_url;
window.location.href = `https://age-verifier.kibty.town/webview?url=$&lcub;encodeURIComponent(verificationUrl)&rcub;`;</pre>
		<p class="text-center text-white/50">
			(feel free to read the code, we made it readable and we have nothing to hide)
		</p>
		<p class="mt-4 text-left">
			it should navigate to a link <span class="text-white/70"
				>(or give you a link to navigate to)</span
			>, from there, you can just wait until the page says success
		</p>
		<p class="mt-2 text-left">congrats! your discord account is now age verified.</p>

		<h2 class="mt-4 text-2xl font-bold">
			how to verify on other platforms (twitch, kick, snapchat, ...others)
		</h2>
		<p>
			navigate to the age verification page and choose selfie, from there, get the url of the qr
			code and put it in this input box, and press verify. or, scan/drop the qr code image below
		</p>

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="mt-4 flex gap-2"
			ondrop={onDrop}
			ondragover={(e) => {
				e.preventDefault();
				dragOver = true;
			}}
			ondragleave={() => {
				dragOver = false;
			}}
		>
			<input
				class="min-w-0 flex-1 border-2 border-white/50 p-2 {dragOver ? 'border-dashed' : ''}"
				bind:value={qrCodeUrl}
				placeholder="https://... (or drop a qr code image)"
			/>
			<input
				type="file"
				accept="image/*"
				class="hidden"
				bind:this={fileInput}
				onchange={() => {
					if (fileInput?.files?.[0]) decodeImage(fileInput.files[0]);
					if (fileInput) fileInput.value = '';
				}}
			/>
			<button
				class="w-16 border-2 border-white/50 p-2 hover:cursor-pointer"
				onclick={() => fileInput?.click()}>scan</button
			>
			<button
				class="w-24 border-2 border-white/50 p-2 hover:cursor-pointer"
				onclick={(e) => {
					e.preventDefault();
					qrCodeError = null;
					qrCodeSuccess = false;

					if (!qrCodeUrl) {
						qrCodeError = "you didn't enter a qr code url";
						return;
					}

					fetch('/api/verify', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							type: 'qr_link',
							identifier: qrCodeUrl
						})
					})
						.then(async (r) => {
							if (!r.ok) {
								qrCodeError = await r.text().catch(() => 'unexpected error');
								return;
							}

							qrCodeSuccess = true;
						})
						.catch((e) => {
							console.error('error sending verify request', e);
							qrCodeError = 'unexpected error, please check your browser console.';
						});
				}}>verify</button
			>
		</div>

		{#if qrCodeSuccess}
			<p class="mt-4 text-green-500">
				your account has successfully been verified. go back to the site tab to continue
			</p>
		{:else if qrCodeError}
			<p class="mt-4 text-red-500">
				{qrCodeError}
			</p>
		{/if}
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
