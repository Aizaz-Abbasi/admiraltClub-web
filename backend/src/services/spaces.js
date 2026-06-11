const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT || "https://sfo3.digitaloceanspaces.com",
  region: "sfo3",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
  forcePathStyle: false,
});

const BUCKET = process.env.DO_SPACES_BUCKET || "admiralty-club";
// CDN URL for serving files publicly
const CDN_BASE = `https://${BUCKET}.sfo3.cdn.digitaloceanspaces.com`;

async function uploadToSpaces(file, folder) {
  const ext = path.extname(file.originalname).toLowerCase();
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    })
  );

  return `${CDN_BASE}/${key}`;
}

module.exports = { uploadToSpaces };
