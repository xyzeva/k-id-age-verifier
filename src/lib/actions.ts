import { sendAlert } from "./alerting";

interface ActionInformation {
  id: string;
  deploymentId: string;
}

export async function getVeratadActionId(
  kv: KVNamespace | undefined,
  deploymentId: string,
  language: string,
  userAgent: string,
  scriptUrls: string[],
) {
  const veratadActionInformation = await kv?.get("k-id-veratad-action", "json") as ActionInformation | undefined;

  if (veratadActionInformation?.deploymentId !== deploymentId) {
    console.info({ message: "fetching new veratad action id for deployment", deploymentId });

    const assetScriptUrls = scriptUrls.filter((s) => s.includes("?dpl=" + deploymentId));

    for (const url of assetScriptUrls) {
      const response = await fetch(url, {
        headers: {
          "Accept": "*/*",
          "Accept-Language": language,
          "Cache-Control": "no-cache",
          "Origin": "https://family.k-id.com",
          "Pragma": "no-cache",
          "Referer": "https://family.k-id.com",
          "Sec-Fetch-Dest": "script",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          "User-Agent": userAgent,
        },
      });
      if (!response.ok) continue;

      const text = await response.text();
      const match = text.match(
        /\.createServerReference\)\("([a-f0-9]+)",.\.callServer,void 0,.\.findSourceMapURL,"generateVeratadLinkAction"\)/,
      );
      if (!match) continue;

      const id = match[1];
      await kv?.put("k-id-veratad-action", JSON.stringify({ id, deploymentId }));

      console.info({ message: "obtained new veratad action id for deployment", deploymentId });
      return id;
    }

    console.error({ message: "failed to get veratad action information", scriptUrls, deploymentId });
    await sendAlert(`failed to get veratad action information \`deploymentId=${deploymentId}\``);
    throw new Error("failed to get veratad action information");
  }

  return veratadActionInformation!.id;
}
