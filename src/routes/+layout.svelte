<script lang="ts">
import "./layout.css";

let { children } = $props();
</script>

<svelte:head><title>k-id age verifier</title></svelte:head>

<nav class="flex flex-col md:flex-row gap-2 mb-8 md:items-center">
  <h1 class="text-red-400 font-bold border py-1 px-2 w-fit">
    k-id age verifier
  </h1>
  <div class="flex flex-row gap-2">
    <p>by</p>
    <a class="text-[#f895ea] underline" href="https://eva.ac">xyzeva</a>
    <p>and</p>
    <a class="text-[#FBE5BA] underline" href="https://github.com/Dziurwa14"
    >Dziurwa</a>
  </div>
  <div class="justify-end flex flex-1">
    verify your age on discord/twitch/kick/snapchat/and more automatically
  </div>
</nav>

{@render children()}

<footer class="flex flex-row my-8 pt-8 border-t border-red-400">
  <p>
    gr33tz to <a
      class="text-[#c27aff] underline"
      href="https://amplitudes.me"
    >amplitudes</a> for previous work
  </p>
  <a
    href="https://hoodnet.work"
    class="justify-end flex-1 flex"
    aria-label="hood network"
  >
    <svg
      class="hover:animate-[spin_1s_infinite]"
      xmlns="http://www.w3.org/2000/svg"
      fill="#ff6868"
      xml:space="preserve"
      width="24"
      height="24"
      viewBox="0 0 14 14"
    >
      <path d="M8.94 8.842a2.674 2.674 0 0 0-.107-3.78 2.674 2.674 0 1 0 .107 3.78m-5.086-4.81a4.3 4.3 0 0 1 3.02-1.346L6.8.01A6.94 6.94 0 0 0 1.91 2.194c-2.657 2.81-2.524 7.24.28 9.892l1.837-1.942a4.32 4.32 0 0 1-.173-6.112m6.119-.176a4.32 4.32 0 0 1 .173 6.112 4.35 4.35 0 0 1-3.027 1.354l.075 2.675a6.96 6.96 0 0 0 4.888-2.183c2.657-2.81 2.532-7.248-.272-9.9z" />
    </svg>
  </a>
</footer>
