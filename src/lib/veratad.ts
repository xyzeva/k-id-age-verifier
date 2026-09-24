// now that we are onto veratad my care for making these headers remotely valid has significantly gone down

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { getVeratadActionId } from "./actions";
import { sendAlert } from "./alerting";
import { generateTraceparent, NEXT_ROUTER_STATE_TREE, parseUserAgent } from "./util";

const fetchVeratadSession = async (requestId: string, userAgent: string) => {
  const parsedUserAgent = parseUserAgent(userAgent);

  const sessionRes = await fetch(
    "https://dcams.app/edge/frontend/api/get_session",
    {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: requestId,
        device_info: {
          browserName: parsedUserAgent.browser.name,
          browserVersion: parsedUserAgent.browser.version,
          fullBrowserVersion: parsedUserAgent.browser.version,
          osName: parsedUserAgent.os.name,
          osVersion: parsedUserAgent.os.version,
          deviceType: "browser",
          mobileVendor: "none",
          mobileModel: "none",
          userAgent,
        },
        url_params: { edge: "true", language: "en", colorScheme: "light" },
      }),
    },
  );

  if (!sessionRes.ok) {
    await sendAlert(`veratad get session failed`);
    console.error({ message: "veratad get session failed", userAgent });
    return new Response("failed to prepare verification", { status: 500 });
  }

  return sessionRes.json() as any;
};

const fetchVeratadStatus = async (requestId: string, userAgent: string) => {
  const sessionRes = await fetch(
    "https://dcams.app/edge/frontend/api/status",
    {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: requestId,
        handoff: true,
      }),
    },
  );

  if (!sessionRes.ok) {
    return { is_final: false };
  }

  return sessionRes.json() as any;
};

export async function doVeratadTry(
  kv: KVNamespace | undefined,
  webviewUrl: string,
  deploymentId: string,
  verificationId: string,
  language: string,
  userAgent: string,
  scriptUrls: string[],
  image: ArrayBuffer,
) {
  const veratadActionId = await getVeratadActionId(
    kv,
    deploymentId,
    language,
    userAgent,
    scriptUrls,
  );

  const actionRes = await fetch(webviewUrl, {
    method: "POST",
    headers: {
      Accept: "text/x-component",
      "accept-language": language,
      "Cache-Control": "no-cache",
      "Content-Type": "text/plain;charset=UTF-8",
      "Next-Action": veratadActionId,
      "Next-Router-State-Tree": encodeURIComponent(
        JSON.stringify(NEXT_ROUTER_STATE_TREE),
      ),
      Pragma: "no-cache",
      Origin: "https://family.k-id.com",
      Referer: webviewUrl,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Traceparent: await generateTraceparent(),
      "user-agent": userAgent,
      "X-Deployment-Id": deploymentId,
    },
    body: JSON.stringify([
      {
        verificationId,
        verificationType: "age-estimation-scan",
        variant: "$undefined",
        useBranding: true,
        attemptId: "",
        locale: "en",
        colorScheme: "light",
        surfaceBaseFallback: { light: "#e6e6e6", dark: "#121212" },
      },
    ]),
  });

  if (!actionRes.ok) {
    return new Response("webview action fetch failed", { status: 500 });
  }

  const actionResText = await actionRes.text();
  const actionLines = actionResText.split("\n");
  const secondLine = actionLines[1];

  if (!secondLine || !secondLine.startsWith("1:")) {
    return new Response("invalid webview action response", { status: 500 });
  }

  const actionData = JSON.parse(secondLine.substring("1:".length));
  if (!actionData.url) {
    return new Response("invalid webview action data", { status: 500 });
  }

  const veratadUrl = new URL(actionData.url);
  const requestId = veratadUrl.pathname.split("/").pop();

  if (!requestId) {
    return new Response("invalid webview action data url", { status: 500 });
  }

  let veratadSession = await fetchVeratadSession(requestId, userAgent);
  while (!veratadSession.data) {
    veratadSession = await fetchVeratadSession(requestId, userAgent);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const data = veratadSession.data;

  await fetchVeratadStatus(requestId, userAgent);

  const s3Client = new S3Client({
    region: "us-east-2",
    credentials: fromCognitoIdentityPool({
      identityPoolId: "us-east-2:d6381cdb-1612-4dd1-ad4a-c8b28de1bd8b",
    }),
  });

  const bucketName = "dcamsv3";

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: "upload/" + requestId + "_dl_" + "selfie.jpeg",
      Body: image,
      ContentType: "image/jpeg",
    }),
  );

  data.request_id = requestId;
  data.type = "SDK_SCAN";
  data.country = "US";
  data.front_ext = "jpeg";
  data.back_ext = "jpeg";
  data.queue = "estimate";

  const res = await fetch("https://dcams.app/edge/frontend/api/queue/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await sendAlert(`veratad queue failed`);

    console.error({ message: "veratad queue failed", userAgent });
    return new Response("failed to send verification", { status: 500 });
  }

  let statusResponse: { is_final: boolean; status: string } = await fetchVeratadStatus(requestId, userAgent);

  while (!statusResponse.is_final) {
    statusResponse = await fetchVeratadStatus(requestId, userAgent);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return statusResponse;
}
