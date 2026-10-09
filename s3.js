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

const CONTENT_TYPES = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  mp4: 'video/mp4',
};

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

function contentTypeFromKey(key) {
  const name = key.split('/').pop();
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return 'application/octet-stream';
  const ext = name.slice(dot + 1).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

async function presignUpload(key) {
  const contentType = contentTypeFromKey(key);
  const expiresIn = DEFAULT_EXPIRES;
  const url = await getSignedUrl(
    regClient,
    new PutObjectCommand({
      Bucket: REG_CONFIG.BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  );
  return {
    url,
    method: 'PUT',
    key,
    expiresIn,
    headers: { 'Content-Type': contentType },
  };
}

async function presignDownload(key) {
  const expiresIn = DEFAULT_EXPIRES;
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
  presignUpload,
  presignDownload,
};
