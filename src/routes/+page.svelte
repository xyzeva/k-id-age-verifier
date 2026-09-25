<script lang="ts">
import face0431Image from "$lib/assets/img/face_0431.jpg";
import face0435Image from "$lib/assets/img/face_0435.jpg";
import privatelyDataCollectionImage from "$lib/assets/img/privately-data-collection.png";
</script>

<h1 class="text-3xl font-bold">
  this version of the age verifier has been fully patched.
</h1>

<h1 class="text-2xl font-bold mt-8">how did this work?</h1>
<p>
  a lot different then the last time we did this, we infact, were not using the official age estimation system at all. we would've liked to, but after privately (k-id's age estimation provider) added captchas following our previous work, it made automation near impossible. so we went a different route
  <br />
  <br />
  the id verification provider (Veratad / DCAMS) k-id uses has a very weird api
  that in turn allowed us to use another one of their products, their age
  estimation (which isn't local like privately) on a ID verification session,
  their age estimation isn't great, at all. we simply scraped adult faces off
  <a class="underline" href="https://thispersondoesnotexist.com">thispersondoesnotexist.com</a> (better than using real peoples faces, in my opinion), ran multiple classifiers on them to filter out
  the children, and then used it to send verification requests to Veratad
  claiming that our session was an age estimation.
  <br />
  <br />
  this in turn caused K-ID to say "looks good to me" and send it over to
  discord, as a successful verification. all of the code is now open source on
  <a class="underline" href="https://github.com/xyzeva/k-id-age-verifier">github</a>
</p>

<h1 class="text-2xl font-bold mt-8">the stupidity of this whole thing</h1>
<p>
	two people got banned from using this age verifier out of about 600, the reason for why is hillarious and proves why this entire system is flawed. veratad decided that these two images were in fact, under 13.
</p>

<div class="flex gap-4">
	<img class="w-96" src={face0431Image} alt="a non-existent adult" />
	<img class="w-96" src={face0435Image} alt="a non-existent adult" />
</div>

<p class="mt-4">
	both of them i managed (or they managed) to reach out to, and i got both of them unbanned using the same verifier that got them banned (lol), which in age appeals you are forced to scan your ID to get unbanned. i deeply apologise to them, but i'm glad i managed to get their accounts back.
	<br />
	<br />
	after that, we ran another classifier to basically not include anyone that doesn't have a beard, and doesn't look over 40. this worked well.
</p>

<h1 class="text-2xl font-bold mt-8">the claim that your data "doesn't get retained"</h1>
<p>
	k-id claims that your verification data is removed after it is done, but with age estimation, this actually isn't the case and i was able to access the data of my verification that took place a year ago.
	<br />
	<br />
	privately stores verification data, although they don't have images of your face, they store a lot of metadata about it, indefinitely, forever. they even state it in plaintext on <a class="underline" href="https://web.archive.org/web/20260518160002/https://documentation.privately.eu/articles/faceassure-browser-gettingstarted">their website</a>.
</p>

<img src={privatelyDataCollectionImage} alt="Privately's website, stating that 'When possible, Privately stores the transaction outcomes also in its databases. Upon request, we can open an endpoint to you so that they can query these records. Additional logs can be made available based on mutually agreed design choices.'" />

<p class="mt-8">
	they are vague of what the data they store is, but here is what i managed to get out of my verification from a year ago that i saved the id of:
</p>
<ul class="list-disc list-inside">
	<li>my k-id attempt and verification id (can be used to link back to a discord account)</li>
		<li>my genuinesss scores</li>
		<li>speeds of my face moving</li>
		<li>biometrics about my face (blur scores, glare ratios, prediction outputs, bounding boxes)</li>
		<li>metadata about my camera</li>
		<li>metadata about my device</li>
		<li>my audio and video devices (serial numbers. aspect ratios, names)</li>
		<li>metadata about my browser (fingerprint, generally everything in a user-agent)</li>
		<li>my device region geolocated by ip address</li>
	</ul>
<p class="mt-8">
	this was the main reason why this existed, i again, do not blame discord for this, and i told them in advance about this data collection before releasing this verifier, i have not yet heard back but i am sure they are investigating my claims.
</p>

<h1 class="text-2xl font-bold mt-8">what was the reason for this existing?</h1>
<p>
  suprisingly not the one you think. i don't hate discord, not at all. i think
  the way they are doing age verification is probably one of the most reasonable
  implementations of it. i more blame the governments forcing it upon them.
  <br />
  <br />
  while it's probably one of the most reasonable implementations, it doesn't
  mean i want to do it, still. and i think there's many people who don't either.
  this isn't meant to be hate against discord.
  <br />
  <br />
  a lot of you would be automatically age-verified anyway, with the help of app
  store signals that discord is using right now to automatically verify you
  without you having to do anything. but i am not one of those people, and many
  still aren't. i would be perfectly fine with discord handling the data of a
  credit card (because they already have said data), but the fact it's being
  off-loaded to a third party is what gets me.
</p>
