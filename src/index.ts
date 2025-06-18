import type { ConverterHealthSuccessResponse, PrepareFileUploadSuccessResponse, FileEntryGetResponse } from "./types";
import ky, { HTTPError } from "ky";
import { consola } from "consola";
import fs from "fs";


console.log(process.env.XEO_SERVICES_ACCESS_TOKEN);

const XEO_STORAGE_URL = "https://storage.xeo.vision";
const XEO_CONVERTER_URL = "https://converter.xeo.vision";

const xeoStorageClient = ky.create({
  prefixUrl: XEO_STORAGE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.XEO_SERVICES_ACCESS_TOKEN}` },
});

const xeoConverterClient = ky.create({
  prefixUrl: XEO_CONVERTER_URL,
  headers: {
    'Authorization': `Bearer ${process.env.XEO_SERVICES_ACCESS_TOKEN}` },
});


async function checkConverterStatus() {
  const healthPath = 'health';
  try {
    const response = await xeoConverterClient.get(`${healthPath}`);
    if (response.status === 200) {
      const data = await response.json<ConverterHealthSuccessResponse>();
      consola.success('Converter Health Status', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
    } else {
      consola.error(`Unexpected Error: ${error}`);
    }
  }
}

async function uploadFile(filePath: string): string {
  const uploadPath = 'file';
  let presignedUploadUrl: string;
  let fileEntryId: string;

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Upload file in one part
  try {
    const response = await xeoStorageClient.post(`${uploadPath}`, {
      json: {
        name: filePath.split('/').pop() || 'unknown',
        parts: 1,
      },
    });
    if (response.status === 201) {
      const data = await response.json<PrepareFileUploadSuccessResponse>();
      consola.success('Upload link created successfully:', data);
      presignedUploadUrl = data.parts[0].uploadUrl;
      fileEntryId = data.id;
    } else {
      throw new Error(`Failed to create upload link: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
      throw error;
    } else {
      consola.error(`Unexpected Error: ${error}`);
      throw error;
    }
  }

  // Upload the file
  try {
    const fileBuffer = fs.readFileSync(filePath);

    await ky.put(presignedUploadUrl, {
      body: fileBuffer,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
  return fileEntryId;
}

async function getFileEntryDownloadUrl(fileEntryId: string): Promise<string> {
  const metadataPath = `file/${fileEntryId}`;
  try {
    const response = await xeoStorageClient.get(metadataPath);
    if (response.status === 200) {
      const data = await response.json<FileEntryGetResponse>();
      consola.success('File Entry Metadata:', JSON.stringify(data, null, 2));
      return data.downloadUrl;
    } else {
      throw new Error(`Failed to fetch file entry metadata: ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
      throw error;
    } else {
      consola.error(`Unexpected Error: ${error}`);
      throw error;
    }
  }
};


async function example() {
  await checkConverterStatus();
  const fileEntryId = await uploadFile('example.ifc');
  await getFileEntryDownloadUrl(fileEntryId);

}

example();

