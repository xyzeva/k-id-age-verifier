import type { RequestEvent } from './$types';
import { Buffer } from 'node:buffer';

const BASE_URL = 'https://eu-west-1.faceassure.com';
const DEPLOYMENT_ID_REGEX = /dpl=(20\d{12}-[a-f0-9]+-production)/i;
const K_ID_PRIVATELY_ACTION_ID = '408838ce2bed4d4db2ae2194cc41cc46d6008d1872';
const K_ID_NEXT_ROUTER_TREE =
	'%5B%22%22%2C%7B%22children%22%3A%5B%22verify%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D';
const PRIVATELY_URL_REGEX = /(https:\/\/[a-z0-9]+\.cloudfront\.net\/.*)(?=:\{)/;

const jsonResponse = (body: unknown, status: number = 200, extraHeaders: object = {}) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...extraHeaders
		}
	});

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 15) =>
	parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateUserAgent() {
	const agents = [
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
		'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/117.0',
		'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36'
	];
	return agents[Math.floor(Math.random() * agents.length)];
}

function parseUserAgent(userAgent: string) {
	const isIOS = /iPhone|iPad/.test(userAgent);
	const isAndroid = /Android/.test(userAgent);
	const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
	const isChrome = /Chrome/.test(userAgent);
	const isFirefox = /Firefox/.test(userAgent);

	return {
		browser: {
			name: isSafari ? 'Safari' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Safari',
			version: isIOS ? '17.0' : '117.0'
		},
		device: {
			type: 'mobile',
			vendor: isIOS ? 'Apple' : 'Samsung',
			model: isIOS ? 'iPhone' : 'Galaxy'
		},
		os: {
			name: isIOS ? 'iOS' : isAndroid ? 'Android' : 'iOS',
			version: isIOS ? '17.0' : '13'
		},
		engine: { name: isSafari || isIOS ? 'WebKit' : 'Blink' },
		cpu: { architecture: '64' }
	};
}

function getRandomLocation() {
	const locations = [
		{
			country: 'United States',
			state: 'California',
			timezone: 'America/Los_Angeles',
			lang: 'en-US,en;q=0.9'
		},
		{
			country: 'United States',
			state: 'New York',
			timezone: 'America/New_York',
			lang: 'en-US,en;q=0.9'
		},
		{
			country: 'Canada',
			state: 'Ontario',
			timezone: 'America/Toronto',
			lang: 'en-CA,en;q=0.9,fr;q=0.8'
		},
		{
			country: 'Australia',
			state: 'New South Wales',
			timezone: 'Australia/Sydney',
			lang: 'en-AU,en;q=0.9'
		},
		{
			country: 'Germany',
			state: 'Berlin',
			timezone: 'Europe/Berlin',
			lang: 'de-DE,de;q=0.9,en;q=0.8'
		},
		{
			country: 'France',
			state: 'Île-de-France',
			timezone: 'Europe/Paris',
			lang: 'fr-FR,fr;q=0.9,en;q=0.8'
		},
		{
			country: 'Netherlands',
			state: 'North Holland',
			timezone: 'Europe/Amsterdam',
			lang: 'nl-NL,nl;q=0.9,en;q=0.8'
		},
		{
			country: 'Sweden',
			state: 'Stockholm',
			timezone: 'Europe/Stockholm',
			lang: 'sv-SE,sv;q=0.9,en;q=0.8'
		},
		{
			country: 'Norway',
			state: 'Oslo',
			timezone: 'Europe/Oslo',
			lang: 'nb-NO,nb;q=0.9,en;q=0.8'
		}
	];
	return locations[Math.floor(Math.random() * locations.length)];
}

function generateMediaMetadata() {
	const randomHex = () =>
		Array.from({ length: 32 }, () =>
			Math.floor(Math.random() * 16)
				.toString(16)
				.toUpperCase()
		).join('');

	const specs = [
		{
			width: 4032,
			height: 3024,
			frameRate: 60,
			zoom: 10,
			aspectRatio: 4032 / 3024
		},
		{
			width: 3840,
			height: 2160,
			frameRate: 60,
			zoom: 8,
			aspectRatio: 3840 / 2160
		},
		{
			width: 1920,
			height: 1080,
			frameRate: 120,
			zoom: 5,
			aspectRatio: 1920 / 1080
		},
		{
			width: 2560,
			height: 1440,
			frameRate: 60,
			zoom: 6,
			aspectRatio: 2560 / 1440
		}
	];

	const spec = randomChoice(specs);
	const deviceId = randomHex();

	return [
		{
			mediaKind: 'audioinput',
			mediaLabel: randomChoice(['', 'Built-in Microphone', 'Default']),
			mediaId: randomHex(),
			mediaCapabilities: {}
		},
		{
			mediaKind: 'videoinput',
			mediaLabel: 'Front Camera',
			mediaId: deviceId,
			mediaCapabilities: {
				aspectRatio: {
					max: spec.aspectRatio,
					min: randomFloat(0.0003, 0.001, 15)
				},
				backgroundBlur: [false],
				deviceId: deviceId,
				facingMode: ['user'],
				focusDistance: { min: randomFloat(0.1, 0.3) },
				frameRate: { max: spec.frameRate, min: 1 },
				groupId: randomHex(),
				height: { max: spec.height, min: 1 },
				powerEfficient: [false, true],
				whiteBalanceMode: randomChoice([
					['manual', 'continuous'],
					['auto', 'manual'],
					['continuous']
				]),
				width: { max: spec.width, min: 1 },
				zoom: { max: spec.zoom, min: 1 }
			}
		}
	];
}

const AMAP_MAP: Record<number, [number, number]> = {
	0: [0, 2],
	1: [2, 4],
	2: [4, 8],
	3: [8, 13],
	4: [13, 18],
	5: [18, 21],
	6: [21, 25],
	7: [25, 28],
	8: [28, 32],
	9: [32, 36],
	10: [36, 40],
	11: [40, 45],
	12: [45, 50],
	13: [50, 60],
	14: [60, 70],
	15: [70, 120]
};

function amap(e: number) {
	const n = AMAP_MAP[~~e];
	const r = e % 1;
	return n[0] + r * (n[1] - n[0]);
}

function removeOutliersWithZscore(arr: number[]) {
	const r =
		arr.reduce(function (e, t) {
			return e + t;
		}, 0) / arr.length;
	const a =
		arr.reduce(function (e, t) {
			return e + Math.pow(t - r, 2);
		}, 0) / arr.length;
	const s = Math.sqrt(a);
	return arr.filter(function (e) {
		return Math.abs((e - r) / s) <= 1;
	});
}

async function encryptPayload(nonce: string, payload: any) {
	const getKey = async (nonce: string, timestamp: string, transactionId: string) => {
		const data = nonce + timestamp + transactionId;
		const dataEncoded = new TextEncoder().encode(data);

		const key = await crypto.subtle.importKey(
			'raw',
			dataEncoded,
			{
				name: 'HKDF'
			},
			false,
			['deriveBits']
		);
		const derived = await crypto.subtle.deriveBits(
			{
				name: 'HKDF',
				hash: 'SHA-256',
				salt: new Uint8Array(0),
				info: new TextEncoder().encode('payload-encryption')
			},
			key,
			32 * 8
		);

		return await crypto.subtle.importKey(
			'raw',
			derived,
			{
				name: 'AES-GCM'
			},
			false,
			['encrypt']
		);
	};
	const timestamp = new Date().toISOString();

	const key = await getKey(nonce, timestamp, payload.transaction_id);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encryptedBuffer = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv
		},
		key,
		new TextEncoder().encode(JSON.stringify(payload))
	);

	const rawBuffer = Buffer.from(encryptedBuffer);
	const encryptedPayloadBuf = rawBuffer.subarray(0, rawBuffer.length - 16);
	const authTagBuf = rawBuffer.subarray(rawBuffer.length - 16);

	return {
		encrypted_payload: encryptedPayloadBuf.toString('base64'),
		iv: Buffer.from(iv).toString('base64'),
		auth_tag: authTagBuf.toString('base64'),
		timestamp
	};
}

async function verify(
	userAgent: string,
	location: ReturnType<typeof getRandomLocation>,
	token: string
) {
	const parsedUserAgent = parseUserAgent(userAgent);
	const mediaMetadata = generateMediaMetadata();

	const commonHeaders = {
		'User-Agent': userAgent,
		accept: '*/*',
		'accept-language': location.lang,
		'access-control-allow-origin': '*',
		priority: 'u=1, i',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'cross-site'
	};

	/*
	const qrCodeUrl = new URL(qrCodeUrlStr);
	const shortlinkId = qrCodeUrl.searchParams.get('sl');
	if (!shortlinkId) throw `shortlink id not found in qr code url`;

	const res = await fetch(`${BASE_URL}/shortlinks/${shortlinkId}`, {
		headers: commonHeaders
	});
	if (!res.ok)
		`failed to get shortlink (status=${res.status}, body=${JSON.stringify(await res.text())})`;

	const data = await res.json();
	const originalUrl = new URL(data.Item.original_url.S.replace('#', ''));
	const token = originalUrl.searchParams.get('token');
	if (!token) throw `token not found in original url`;
    */

	const parts = token.split('.');
	if (parts.length !== 3) throw `token is an invalid jwt `;
	const jwtPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

	const sessionRes = await fetch(`${BASE_URL}/age-services/d-privately-age-services`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...commonHeaders
		},
		body: JSON.stringify({
			request_type: 'generate_new_session',
			transaction_id: jwtPayload.jti,
			api_key: null,
			api_secret: null,
			token,
			longURL: null,
			userAgent: userAgent
		})
	});

	if (!sessionRes.ok)
		throw `failed to generate new session (status=${sessionRes.status}, body=${JSON.stringify(await sessionRes.text())})`;

	const sessionData = await sessionRes.json();
	const generateBoundingBox = () => {
		const topLeft = [randomFloat(140, 160), randomFloat(250, 270)];
		const width = randomFloat(170, 190);
		const height = randomFloat(220, 240);
		return {
			topLeft,
			bottomRight: [topLeft[0] + width, topLeft[1] + height],
			width,
			height
		};
	};

	const generateTimeline = (maxTime: number) => {
		const entries = [];
		for (let i = 0; i < randomInt(2, 5); i++) {
			const start = randomInt(1, maxTime - 100);
			const end = start + randomInt(50, 500);
			if (end < maxTime) entries.push([start, end]);
		}
		return entries;
	};

	const generateStateTimelines = (completionTime: number) => {
		const states = [
			'TIME_UNTIL_CLICK_START',
			'GET_READY',
			'NO_FACE',
			'LOOK_STRAIGHT',
			'TURN_LEFT',
			'CENTRE_FACE',
			'KEEP_YOUR_MOUTH_OPEN',
			'CLOSE_YOUR_MOUTH',
			'SLOWLY_COME_CLOSER_TO_THE_CAMERA',
			'SLOWLY_DISTANCE_YOURSELF_FROM_THE_CAMERA',
			'TOO_DARK'
		];
		const timelines: Record<string, number[][]> = {};
		states.forEach((state) => (timelines[state] = generateTimeline(completionTime)));
		return timelines;
	};
	const baseAge = randomFloat(25.2, 26.0);
	const minAge = baseAge - randomFloat(0.1, 0.5);
	const maxAge = baseAge + randomFloat(0.1, 0.5);
	const averageAge = (minAge + maxAge) / 2;
	const currentTime = Date.now() / 1000;
	const completionTime = randomInt(8000, 15000);

	const raws = Array.from({ length: 10 }, () => randomFloat(6.005, 7.007));
	const primaryOutputs = removeOutliersWithZscore(raws.map((r) => amap(r)));
	const outputs = removeOutliersWithZscore(primaryOutputs);

	let payload = {
		request_type: 'complete_transaction',
		transaction_id: sessionData.transaction_id,
		api_key: sessionData.session_id,
		api_secret: sessionData.session_password,
		remote_pld: {},
		browser_response_data: {
			age: 'yes',
			age_confidence: 1,
			genuineness: Array.from({ length: 5 }, () => randomFloat(0.4, 0.98)),
			product: 'age',
			modality: 'image',
			unverifiedPayload: {
				iss: 'https://api.privately.swiss',
				sub: jwtPayload.sub,
				aud: 'https://api.k-id.com',
				exp: jwtPayload.exp,
				nbf: jwtPayload.nbf,
				iat: jwtPayload.iat,
				jti: jwtPayload.jti,
				age: jwtPayload.age,
				liv: true,
				rlt: {
					minAge,
					maxAge,
					score: 0,
					gate: 16
				},
				rsn: 'complete_transaction',
				rtf: 'interval',
				rtb: 'callback',
				vid: jwtPayload.vid,
				ver: 'v1.10.22',
				ufi: []
			},
			ageCheckSession: '-' + randomInt(1000000000, 9999999999),
			miscellaneous: {
				recordedOpennessStreak: Array.from({ length: 5 }, () => randomFloat(0.1, 0.8, 17)),
				recordedSpeeds: Array.from({ length: 5 }, () => randomFloat(0.2, 1.5, 17)),
				recordedIntervals: Array.from({ length: 5 }, () => randomFloat(0.1, 0.2, 3)),
				failedOpennessReadings: [],
				failedOpennessSpeeds: [],
				failedOpennessIntervals: [],
				numberOfGestureRetries: 1,
				antiSpoofConfidences: [],
				fp_scores: [],
				laplacian_blur_scores: Array.from({ length: 300 }, () => randomFloat(10, 300, 15)),
				laplacian_min_score: randomFloat(10, 50),
				laplacian_max_score: randomFloat(300, 350),
				laplacian_avg_score: randomFloat(50, 100),
				glare_ratios: Array.from({ length: 300 }, () => 0),
				allScreenDetectionDetails: {
					beforeClickingStart: {
						screenDetectionConfidence: [],
						screenFaceOverlap: [],
						screenBoundingBoxes: [],
						alternativeScore: []
					},
					positioning: {
						screenDetectionConfidence: Array.from({ length: 2 }, () => randomFloat(0.01, 0.03)),
						screenFaceOverlap: [0, 0],
						screenBoundingBoxes: [[], []],
						alternativeScore: Array.from({ length: 2 }, () => randomFloat(0.2, 0.9))
					},
					liveness: {
						screenDetectionConfidence: Array.from({ length: 2 }, () => randomFloat(0.01, 0.03)),
						screenFaceOverlap: [0, 0],
						screenBoundingBoxes: [[], []],
						alternativeScore: Array.from({ length: 2 }, () => randomFloat(0.2, 0.9))
					},
					distancing: {
						screenDetectionConfidence: Array.from({ length: 2 }, () => randomFloat(0.01, 0.03)),
						screenFaceOverlap: [0, 0],
						screenBoundingBoxes: [Array.from({ length: 2 }, generateBoundingBox)],
						alternativeScore: Array.from({ length: 2 }, () => randomFloat(0.2, 0.9))
					},
					closing: {
						screenDetectionConfidence: Array.from({ length: 2 }, () => randomFloat(0.01, 0.03)),
						screenFaceOverlap: [0, 0],
						screenBoundingBoxes: [Array.from({ length: 2 }, generateBoundingBox)],
						alternativeScore: Array.from({ length: 2 }, () => randomFloat(0.2, 0.9))
					},
					postChallenge: {
						screenDetectionConfidence: Array.from({ length: 2 }, () => randomFloat(0.01, 0.03)),
						screenFaceOverlap: [0, 0],
						screenBoundingBoxes: [[], []],
						alternativeScore: Array.from({ length: 2 }, () => randomFloat(0.2, 0.9))
					}
				},
				plScores: [],
				screenDetectionExecutionTimes: {
					beforeClickingStart: [],
					positioning: Array.from({ length: 2 }, () => randomFloat(5000, 6000)),
					liveness: Array.from({ length: 2 }, () => randomFloat(4000, 5000)),
					distancing: Array.from({ length: 2 }, () => randomFloat(3000, 4000)),
					closing: Array.from({ length: 2 }, () => randomFloat(2000, 3000)),
					postChallenge: Array.from({ length: 2 }, () => randomFloat(500, 1500))
				},
				landmarkDetectionExecutionTimes: {
					beforeClickingStart: [],
					positioning: Array.from({ length: 200 }, () => randomFloat(50, 150)),
					liveness: Array.from({ length: 50 }, () => randomFloat(50, 110)),
					distancing: Array.from({ length: 5 }, () => randomFloat(50, 110)),
					closing: Array.from({ length: 20 }, () => randomFloat(50, 110)),
					postChallenge: Array.from({ length: 7 }, () => randomFloat(50, 110))
				},
				screenAttackMeasure: 0,
				screenAttackBoundingBox: {},
				subclient: jwtPayload.sub,
				verificationID: jwtPayload.vid,
				version: 'v1.10.22',
				sdk_path: './face-capture-v1.10.22.js',
				model_version: 'v.2025.0',
				cropper_version: 'v.0.0.3',
				start_time_stamp: currentTime - randomFloat(20, 60),
				end_time_stamp: currentTime,
				device_timezone: location.timezone,
				referring_page: `https://d3ogqhtsivkon3.cloudfront.net/?token=${token}&shi=false&from_qr_scan=true`,
				parent_page: `https://d3ogqhtsivkon3.cloudfront.net/dynamic_index.html?sl=${jwtPayload.jti}&region=eu-central-1`,
				face_confidence_limit: 0.975,
				multipleFacesDetected: false,
				targetGate: 18,
				targetConfidence: 0.9,
				averageAge,
				selecedLivenessStyle: 'open',
				selectedMediaLabel: 'Front Camera',
				rawImageWidth: 480,
				rawImageHeight: 640,
				boundingBoxesInPixels: Array.from({ length: randomInt(5, 10) }, generateBoundingBox),
				latestReportedState: 'AGE_CHECK_COMPLETE',
				challengeType: 'distance-open',
				authenticationCharacteristics: {
					session_id: sessionData.session_id,
					session_password: sessionData.session_password,
					token
				},
				deviceCharacteristics: {
					deviceBrowserModel: userAgent,
					isMobile: parsedUserAgent.device.type === 'mobile',
					browserName: parsedUserAgent.browser.name?.toLowerCase() || 'safari',
					isDeviceBrowserCompatible: true,
					deviceConnectionSpeedKbps: randomFloat(20000, 500000),
					deviceRegion: {
						country: location.country,
						state: location.state
					},
					mediaMetadata: mediaMetadata,
					platformDetails: {
						name: parsedUserAgent.browser.name || 'Safari',
						version: parsedUserAgent.browser.version || '15.0',
						layout: parsedUserAgent.engine.name || 'WebKit',
						os: {
							architecture: parseInt(parsedUserAgent.cpu.architecture) || 64,
							family: parsedUserAgent.os.name || 'iOS',
							version: parsedUserAgent.os.version || '15.0'
						},
						description: `${parsedUserAgent.browser.name || 'Safari'} ${
							parsedUserAgent.browser.version || '15.0'
						} on ${parsedUserAgent.device.vendor || 'Apple'} ${parsedUserAgent.device.model || 'iPhone'} (${parsedUserAgent.os.name || 'iOS'} ${
							parsedUserAgent.os.version || '15.0'
						})`,
						product: parsedUserAgent.device.model || 'iPhone',
						manufacturer: parsedUserAgent.device.vendor || 'Apple'
					},
					userTriedLandscapeMode: 0,
					txFinishedInLandscapeMode: false
				},
				initializationCharacteristics: {
					cropperInitTime: randomInt(150, 250),
					coreInitTime: randomInt(800, 1000),
					pageLoadTime: randomInt(250, 350),
					from_qr_scan: false,
					blendShapesAvailable: true
				},
				executionCharacteristics: {
					experimentSetup: {
						experimentType: 'passive-liveness-override',
						experimentProbability: 1,
						deviceCoverage: 'all',
						deviceInfo: {
							name: parsedUserAgent.browser.name || 'Safari',
							version: parsedUserAgent.browser.version || '15.0',
							layout: parsedUserAgent.engine.name || 'WebKit',
							os: {
								architecture: parseInt(parsedUserAgent.cpu.architecture) || 64,
								family: parsedUserAgent.os.name || 'iOS',
								version: parsedUserAgent.os.version || '15.0'
							},
							description: `${parsedUserAgent.browser.name || 'Safari'} ${
								parsedUserAgent.browser.version || '15.0'
							} on ${parsedUserAgent.device.vendor || 'Apple'} ${parsedUserAgent.device.model || 'iPhone'} (${parsedUserAgent.os.name || 'iOS'} ${
								parsedUserAgent.os.version || '15.0'
							})`,
							product: parsedUserAgent.device.model || 'iPhone',
							manufacturer: parsedUserAgent.device.vendor || 'Apple'
						},
						txMode: 'experiment',
						timestamp: new Date().getTime()
					},
					experimentConfigResult: {
						success: true,
						txMode: 'experiment',
						experimentType: 'passive-liveness-override'
					},
					isCameraPermissionGranted: true,
					completionTime,
					deferredComputationStartedAt: randomInt(10000, 14000),
					instructionCompletionTime: randomInt(10000, 14000),
					initialAdjustmentTime: randomInt(10000, 14000),
					completionState: 'COMPLETE',
					unfinishedInstructions: Object.fromEntries(
						[
							'NO_FACE',
							'VIDEO_PROCESSING',
							'STAY_STILL',
							'LOOK_STRAIGHT',
							'GET_READY',
							'TURN_LEFT',
							'TURN_RIGHT',
							'ALIGN_YOUR_FACE_WITH_THE_CAMERA_UP',
							'ALIGN_YOUR_FACE_WITH_THE_CAMERA_DOWN',
							'SLIGHTLY_TILT_YOUR_HEAD_LEFT',
							'SLIGHTLY_TILT_YOUR_HEAD_RIGHT',
							'CENTRE_FACE',
							'OPEN_YOUR_MOUTH',
							'KEEP_YOUR_MOUTH_OPEN',
							'CLOSE_YOUR_MOUTH',
							'SLOWLY_COME_CLOSER_TO_THE_CAMERA',
							'SLOWLY_DISTANCE_YOURSELF_FROM_THE_CAMERA',
							'TOO_DARK'
						].map((k) => [k, false])
					),
					// "stateCompletionTimes": {
					//   "TIME_UNTIL_CLICK_START": 2342,
					//   "GET_READY": 1130,
					//   "NO_FACE": 7132,
					//   "CENTRE_FACE": 551,
					//   "TOO_DARK": 29998,
					//   "TURN_LEFT": 30133,
					//   "LOOK_STRAIGHT": 441,
					//   "SLOWLY_DISTANCE_YOURSELF_FROM_THE_CAMERA": 0,
					//   "SLOWLY_COME_CLOSER_TO_THE_CAMERA": 1546,
					//   "CLOSE_YOUR_MOUTH": 1813,
					//   "KEEP_YOUR_MOUTH_OPEN": 9686
					// },
					stateCompletionTimes: {
						TIME_UNTIL_CLICK_START: randomInt(800, 3200),
						GET_READY: randomInt(1200, 4000),
						NO_FACE: randomInt(2000, 5500),
						CENTRE_FACE: randomInt(8000, 18000),
						TOO_DARK: randomInt(1500, 3500),
						TURN_LEFT: randomInt(3000, 8500),
						LOOK_STRAIGHT: randomInt(100, 800),
						SLOWLY_DISTANCE_YOURSELF_FROM_THE_CAMERA: 0,
						SLOWLY_COME_CLOSER_TO_THE_CAMERA: randomInt(800, 3500),
						CLOSE_YOUR_MOUTH: randomInt(1800, 5200),
						KEEP_YOUR_MOUTH_OPEN: randomInt(3500, 9000)
					},
					stateTimelines: generateStateTimelines(completionTime),
					nonNeutralExpressionTimelines: Object.fromEntries(
						[
							'browDownLeft',
							'browDownRight',
							'mouthSmileLeft',
							'mouthSmileRight',
							'mouthPucker',
							'mouthDimpleLeft',
							'mouthDimpleRight',
							'mouthPressLeft',
							'mouthPressRight',
							'mouthShrugLower',
							'mouthShrugUpper',
							'eyeBlinkLeft',
							'eyeBlinkRight',
							'mouthFrownLeft',
							'mouthFrownRight'
						].map((k) => [k, {}])
					),
					handAnalysis: {
						faceHandSizeComparisons: []
					},
					predictions: {
						outputs,
						primaryOutputs,
						raws,
						secondaryOutputs: [],
						secondaryRaws: [],
						age: 'yes',
						horizontal_estimates: Array.from({ length: 6 }, () => randomFloat(3.1, 3.2)),
						vertical_estimates: Array.from({ length: 6 }, () => randomFloat(-1.6, -1.5)),
						horizontalratiotocenter_estimates: Array.from({ length: 6 }, () =>
							randomFloat(1.01, 1.03)
						),
						zy_estimates: Array.from({ length: 6 }, () => randomFloat(0.42, 0.44)),
						driftfromcenterx_estimates: Array.from({ length: 6 }, () => randomFloat(0.005, 0.007)),
						driftfromcentery_estimates: Array.from({ length: 6 }, () => randomFloat(-0.35, -0.37)),
						xScaledShiftAmt: 11.5,
						yScaledShiftAmt: -2
					}
				},
				errorCharacteristics: {
					systemErrors: [],
					userErrors: {}
				}
			}
		}
	};

	const encryptionData = await encryptPayload(sessionData.nonce, payload);
	payload = Object.assign(payload, encryptionData);

	const completeRes = await fetch(`${BASE_URL}/age-services/d-privately-age-services`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': userAgent,
			accept: '*/*',
			'accept-language': location.lang,
			'access-control-allow-origin': '*',
			priority: 'u=1, i',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site'
		},
		body: JSON.stringify(payload)
	});

	if (!completeRes.ok)
		throw `failed to complete transaction (status=${completeRes.status}, body=${JSON.stringify(await completeRes.text())})`;

	console.log('tx completed', payload.transaction_id);
}

export const POST = async (event: RequestEvent) => {
	const userAgent = generateUserAgent();
	const location = getRandomLocation();

	const { type, identifier }: { type: string; identifier: string } = await event.request.json();

	if (type === 'webview') {
		let webviewUrl: URL;
		try {
			webviewUrl = new URL(identifier);
		} catch (e) {
			return jsonResponse({ error: 'error parsing webview url' }, 400);
		}

		if (webviewUrl.host !== 'family.k-id.com' || webviewUrl.pathname !== '/verify') {
			return jsonResponse({ error: 'unexpected webview url' }, 400);
		}

		const kIdToken = webviewUrl.searchParams.get('token');
		if (!kIdToken) {
			return jsonResponse({ error: 'no k-id token in webview url' }, 400);
		}

		const parts = kIdToken.split('.');
		if (parts.length !== 3) {
			return jsonResponse({ error: 'invalid k-id jwt' }, 400);
		}

		const payload = JSON.parse(atob(parts[1]));

		// fetch the webview first
		const webViewRes = await fetch(webviewUrl, {
			headers: {
				'User-Agent': userAgent,
				accept: '*/*',
				'accept-language': location.lang,
				priority: 'u=1, i',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site',
				Origin: 'https://family.k-id.com',
				Referer: identifier
			}
		});

		if (!webViewRes.ok) {
			return jsonResponse({ error: 'failed to fetch webview' }, 500);
		}

		const webViewBody = await webViewRes.text();
		const deploymentIdFromBody = webViewBody.match(DEPLOYMENT_ID_REGEX)?.[1];
		console.log('Extracted deployment id', {deploymentIdFromBody});
		if (!deploymentIdFromBody) {
			return jsonResponse({ error: 'no deployment id found in webview body' }, 500);
		}

		const privatelyActionRes = await fetch(webviewUrl, {
			method: 'POST',
			headers: {
				'User-Agent': userAgent,
				accept: '*/*',
				'accept-language': location.lang,
				priority: 'u=1, i',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site',
				'Next-Action': K_ID_PRIVATELY_ACTION_ID,
				'Next-Router-State-Tree': K_ID_NEXT_ROUTER_TREE,
				'X-Deployment-Id': deploymentIdFromBody,
				'Content-Type': 'application/json',
				Origin: 'https://family.k-id.com',
				Referer: identifier
			},
			body: JSON.stringify([
				{ verificationId: payload.jti, useBranding: true, attemptId: crypto.randomUUID() }
			])
		});

		if (!privatelyActionRes.ok) {
			return jsonResponse(
				{
					error: `failed to execute k-id privately action (status=${privatelyActionRes.status})`
				},
				500
			);
		}

		const privatelyActionBody = await privatelyActionRes.text();
		const match = privatelyActionBody.match(PRIVATELY_URL_REGEX);

		if (!match) {
			return jsonResponse({ error: 'no privately url found in response' }, 500);
		}

		const privatelyUrl = new URL(match[1]);
		const privatelyToken = privatelyUrl.searchParams.get('token');

		if (!privatelyToken) {
			return jsonResponse({ error: 'no privately token' }, 500);
		}

		await verify(userAgent, location, privatelyToken);

		return jsonResponse({ success: true });
	}

	if (type === 'qr_link') {
		let qrCodeUrl: URL;
		try {
			qrCodeUrl = new URL(identifier);
		} catch (e) {
			return jsonResponse({ error: 'error parsing qr code url' }, 400);
		}

		const shortlinkId = qrCodeUrl.searchParams.get('sl');
		if (!shortlinkId) {
			return jsonResponse({ error: 'failed to get shortlink id from qr code url' }, 400);
		}

		const res = await fetch(`${BASE_URL}/shortlinks/${encodeURIComponent(shortlinkId)}`, {
			headers: {
				'User-Agent': userAgent,
				accept: '*/*',
				'accept-language': location.lang,
				priority: 'u=1, i',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site'
			}
		});
		if (!res.ok) {
			return jsonResponse(`failed to get shortlink (status=${res.status})`, 400);
		}

		const data = await res.json();
		const originalUrl = new URL(data.Item.original_url.S.replace('#', ''));
		const token = originalUrl.searchParams.get('token');
		if (!token) {
			return jsonResponse({ error: 'token not found in original url' }, 500);
		}

		await verify(userAgent, location, token);

		return jsonResponse({ success: true });
	}

	return jsonResponse({ error: 'unexpected type' }, 400);
};
