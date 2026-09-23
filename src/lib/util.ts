const randomHex = async (length: number) => {
  const arr = new Uint8Array(length / 2);
  await crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((i) => i.toString(16).padStart(2, "0"))
    .join("");
};

export async function generateTraceparent() {
  return `00-${await randomHex(32)}-${await randomHex(16)}-00`;
}

export function generateUserAgent() {
  const agents = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/117.0",
    "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

export function parseUserAgent(userAgent: string) {
  const isIOS = /iPhone|iPad/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);

  return {
    browser: {
      name: isSafari ? "Safari" : isChrome ? "Chrome" : isFirefox ? "Firefox" : "Safari",
      version: isIOS ? "17.0" : "117.0",
    },
    device: {
      type: "mobile",
      vendor: isIOS ? "Apple" : "Samsung",
      model: isIOS ? "iPhone" : "Galaxy",
    },
    os: {
      name: isIOS ? "iOS" : isAndroid ? "Android" : "iOS",
      version: isIOS ? "17.0" : "13",
    },
    engine: { name: isSafari || isIOS ? "WebKit" : "Blink" },
    cpu: { architecture: "64" },
  };
}

export function getRandomLocation() {
  const locations = [
    {
      country: "United States",
      state: "California",
      timezone: "America/Los_Angeles",
      lang: "en-US,en;q=0.9",
    },
    {
      country: "United States",
      state: "New York",
      timezone: "America/New_York",
      lang: "en-US,en;q=0.9",
    },
    {
      country: "Canada",
      state: "Ontario",
      timezone: "America/Toronto",
      lang: "en-CA,en;q=0.9,fr;q=0.8",
    },
    {
      country: "Australia",
      state: "New South Wales",
      timezone: "Australia/Sydney",
      lang: "en-AU,en;q=0.9",
    },
    {
      country: "Germany",
      state: "Berlin",
      timezone: "Europe/Berlin",
      lang: "de-DE,de;q=0.9,en;q=0.8",
    },
    {
      country: "France",
      state: "Île-de-France",
      timezone: "Europe/Paris",
      lang: "fr-FR,fr;q=0.9,en;q=0.8",
    },
    {
      country: "Netherlands",
      state: "North Holland",
      timezone: "Europe/Amsterdam",
      lang: "nl-NL,nl;q=0.9,en;q=0.8",
    },
    {
      country: "Sweden",
      state: "Stockholm",
      timezone: "Europe/Stockholm",
      lang: "sv-SE,sv;q=0.9,en;q=0.8",
    },
    {
      country: "Norway",
      state: "Oslo",
      timezone: "Europe/Oslo",
      lang: "nb-NO,nb;q=0.9,en;q=0.8",
    },
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}
