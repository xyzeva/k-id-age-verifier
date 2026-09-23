const NUMBER_OF_FACES = 5000;
const CURRENT_ADULT_FACE_ID_KEY = "current-adult-face-id";

export async function getAdultFace(
  bucket: R2Bucket | undefined,
  kv: KVNamespace | undefined,
  faceId: number | null = null,
) {
  if (!bucket || !kv) {
    console.warn({ message: "kv or bucket not found, defaulting to single image" });
    const response = await fetch(
      "https://cdn.discordapp.com/attachments/1029315212521771020/1552459457328455740/1738359146688.jpg?ex=6ab5b009&is=6ab45e89&hm=be668fbf0b272d19fb6dc253ac79d9e19342ea277b8ed14d8d350e4c483d8b85&",
    );

    return {
      image: await response.arrayBuffer(),
      imageId: "kevin",
    };
  }

  faceId ??= Number((await kv.get(CURRENT_ADULT_FACE_ID_KEY)) ?? "0") + 1;

  if (faceId > NUMBER_OF_FACES) {
    faceId = 1;
  }

  await kv.put(CURRENT_ADULT_FACE_ID_KEY, faceId.toString());

  const key = `adult_faces/face_${faceId.toString().padStart(4, "0")}.jpg`;
  const image = await bucket.get(key);

  if (!image) {
    console.warn({ message: "face not found in bucket", key, faceId });
    // dzi decided to put missing images in my ordered list of images. fuck you.
    return await getAdultFace(bucket, kv, faceId + 1);
  }

  return {
    image: await image.arrayBuffer(),
    imageId: key,
  };
}
