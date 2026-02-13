<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const webviewUrl = page.url.searchParams.get('url');

	let success = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		if (!webviewUrl) return;
		fetch('/api/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ type: 'webview', identifier: webviewUrl })
		})
			.then(async (r) => {
				if (!r.ok) {
					error = await r.text().catch(() => 'unexpected error');
					return;
				}

				success = true;
				setTimeout(() => {
					window.location.href = 'https://discord.com/app';
				}, 3000);
			})
			.catch((e) => {
				console.error('error sending verify request', e);
				error = 'unexpected error, please check your browser console.';
			});
	});
</script>

<div class="flex min-h-screen w-screen flex-col items-center justify-center text-center">
	{#if webviewUrl}
		{#if success}
			<p class="text-green-500">your account is now age verified. enjoy</p>
			<p class="mt-2 text-white/50">redirecting back to discord in a few seconds...</p>
		{:else if error}
			<p class="text-red-500">{error}</p>
		{:else}
			<p>automatically verifying your age</p>
		{/if}
	{:else}
		<p>
			<span class="text-red-500">invalid url</span> <br /> did you mean to go to
			<a class="underline" href="/">the instructions page?</a>
		</p>
	{/if}
</div>
<div class="absolute bottom-4 flex w-screen justify-center">
	<p class="text-center text-white/50">
		made by <a class="underline" href="https://kibty.town" target="_blank">xyzeva</a> and
		<a class="underline" href="https://github.com/Dziurwa14" target="_blank">Dziurwa</a>, greetz to
		<a class="underline" href="https://amplitudes.me/" target="_blank">amplitudes</a> (for previous work)
	</p>
</div>
