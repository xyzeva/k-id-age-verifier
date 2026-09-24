import { getVeratadActionId } from "$lib/actions";
import { sendAlert } from "$lib/alerting";
import { getAdultFace } from "$lib/images";
import { generateTraceparent, generateUserAgent, getRandomLocation } from "$lib/util";
import { doVeratadTry } from "$lib/veratad";
import type { RequestEvent } from "./$types";

export const POST = async (event: RequestEvent) => {
  const { webviewUrl }: { webviewUrl: string } = await event.request.json();

  if (typeof webviewUrl !== "string") {
    return new Response("webviewUrl must be a string", {
      status: 400,
    });
  }

  let parsedWebviewUrl: URL;
  try {
    parsedWebviewUrl = new URL(webviewUrl);
  } catch (e) {
    return new Response("invalid url", { status: 400 });
  }

  if (
    parsedWebviewUrl.protocol !== "https:"
    || parsedWebviewUrl.host !== "family.k-id.com"
    || parsedWebviewUrl.pathname !== "/verify"
  ) {
    return new Response("this url isn't a valid k-id webview url", {
      status: 400,
    });
  }

  const kIdToken = parsedWebviewUrl.searchParams.get("token");
  if (!kIdToken) {
    return new Response("no k-id token in webview url", { status: 400 });
  }

  const parts = kIdToken.split(".");
  if (parts.length !== 3) {
    return new Response("invalid k-id jwt", { status: 400 });
  }

  let payload: { jti: string };

  try {
    payload = JSON.parse(atob(parts[1]));

    if (!payload.jti) throw new Error("no jti in jwt");
  } catch (e) {
    return new Response("invalid k-id jwt payload", { status: 400 });
  }

  const userAgent = generateUserAgent();
  const location = getRandomLocation();

  const webviewHtmlRes = await fetch(webviewUrl, {
    headers: {
      "User-Agent": userAgent,
      accept: "*/*",
      "accept-language": location.lang,
      priority: "u=1, i",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      Origin: "https://family.k-id.com",
      Referer: webviewUrl,
    },
  });

  if (!webviewHtmlRes.ok) {
    return new Response("webview fetch returned " + webviewHtmlRes.status, {
      status: 500,
    });
  }

  const deploymentId = webviewHtmlRes.headers.get("x-release-version");

  if (!deploymentId) {
    return new Response("webview fetch returned no deployment id", {
      status: 500,
    });
  }

  const webviewHtmlText = await webviewHtmlRes.text();

  const scriptUrls = [
    ...webviewHtmlText
      .matchAll(/src="([A-Za-z0-9-_.!~*'():\/?=]+)"/g)
      .map((m) => m[1]),
  ];

  let adultFace = await getAdultFace(event.platform?.env.VERIFIER_IMAGES, event.platform?.env.VERIFIER_KV);

  let veratadResult = await doVeratadTry(
    event.platform?.env.VERIFIER_KV,
    webviewUrl,
    deploymentId,
    payload.jti,
    location.lang,
    userAgent,
    scriptUrls,
    adultFace.image,
  );
  let attemptCount = 1;

  while (veratadResult.status !== "PASS") {
    if (attemptCount > 5) {
      console.error({
        message: "veratad failed completely with retries",
        attemptCount,
        // actionData,
        // verificationId: payload.jti,
        currentImageId: adultFace.imageId,
      });

      await sendAlert(
        `veratad failed completely with retries attemptCount=${attemptCount} currentImageId=\`${adultFace.imageId}\``,
      );

      return new Response("we failed to verify your age after " + attemptCount + " tries, try again later", {
        status: 500,
      });
    }

    console.warn({ message: "veratad result wasn't pass first try, trying again", imageId: adultFace.imageId });

    adultFace = await getAdultFace(event.platform?.env.VERIFIER_IMAGES, event.platform?.env.VERIFIER_KV);
    veratadResult = await doVeratadTry(
      event.platform?.env.VERIFIER_KV,
      webviewUrl,
      deploymentId,
      payload.jti,
      location.lang,
      userAgent,
      scriptUrls,
      adultFace.image,
    );
    attemptCount++;
  }

  console.info({
    message: "completed verification",
    // actionData,
    // verificationId: payload.jti,
    imageId: adultFace.imageId,
  });
  return new Response(null, { status: 204 });
};
