const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REG_CONFIG = {
  REGION: 'ru-1',
  ENDPOINT: 'https://s3.regru.cloud',
  BUCKET: 'stng',
  ACCESS_KEY: process.env.REG_ACCESS_KEY,
  SECRET_KEY: process.env.REG_SECRET_KEY,
};

const DEFAULT_EXPIRES = 900;
const MAX_EXPIRES = 3600;

const regClient = new S3Client({
  region: REG_CONFIG.REGION,
  endpoint: REG_CONFIG.ENDPOINT,
  credentials: {
    accessKeyId: REG_CONFIG.ACCESS_KEY || '',
    secretAccessKey: REG_CONFIG.SECRET_KEY || '',
  },
  forcePathStyle: true,
});

function credentialsReady() {
  return Boolean(REG_CONFIG.ACCESS_KEY && REG_CONFIG.SECRET_KEY);
}

function normalizeKey(key) {
  if (typeof key !== 'string') return null;
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/') || trimmed.includes('\\') || trimmed.includes('..')) return null;
  return trimmed;
}

function normalizeExpires(expiresIn) {
  if (expiresIn === undefined || expiresIn === null || expiresIn === '') return DEFAULT_EXPIRES;
  const n = Number(expiresIn);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(Math.floor(n), MAX_EXPIRES);
}

async function presignUpload(key, contentType, expiresIn) {
  const input = {
    Bucket: REG_CONFIG.BUCKET,
    Key: key,
  };
  const headers = {};
  if (contentType) {
    input.ContentType = contentType;
    headers['Content-Type'] = contentType;
  }
  const url = await getSignedUrl(regClient, new PutObjectCommand(input), { expiresIn });
  return { url, method: 'PUT', key, expiresIn, headers };
}

async function presignDownload(key, expiresIn) {
  const url = await getSignedUrl(
    regClient,
    new GetObjectCommand({ Bucket: REG_CONFIG.BUCKET, Key: key }),
    { expiresIn }
  );
  return { url, method: 'GET', key, expiresIn };
}

module.exports = {
  credentialsReady,
  normalizeKey,
  normalizeExpires,
  presignUpload,
  presignDownload,
};
