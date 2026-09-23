// now that we are onto veratad my care for making these headers remotely valid has significantly gone down

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { parseUserAgent } from "./util";

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

export async function doVeratadTry(requestId: string, userAgent: string, image: ArrayBuffer) {
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
