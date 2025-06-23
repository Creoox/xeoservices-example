import ky from 'ky';

if (!process.env.XEO_SERVICES_ACCESS_TOKEN) {
  throw new Error('XEO_SERVICES_ACCESS_TOKEN environment variable is not set.');
}

const XEO_STORAGE_URL = "https://storage.xeo.vision";
const XEO_CONVERTER_URL = "https://converter.xeo.vision";

export const xeoStorageClient = ky.create({
  prefixUrl: XEO_STORAGE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.XEO_SERVICES_ACCESS_TOKEN}` },
});

export const xeoConverterClient = ky.create({
  prefixUrl: XEO_CONVERTER_URL,
  headers: {
    'Authorization': `Bearer ${process.env.XEO_SERVICES_ACCESS_TOKEN}` },
});
