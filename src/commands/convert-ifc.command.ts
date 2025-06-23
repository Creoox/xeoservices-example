import type { FileEntryGetResponse, PrepareFileUploadSuccessResponse, ProcessCreateSuccessResponse } from "../types";
import ky, { HTTPError } from "ky";
import { xeoConverterClient, xeoStorageClient } from '../client';
import type { CommandModule } from 'yargs';
import { consola } from "consola";
import fs from 'fs';
import type { KyInstance } from "ky";
import { LOGS_PATH } from '../constants';
import path from 'path';
import util from 'util';

async function uploadFile(xeoStorageClient: KyInstance, filePath: string): Promise<PrepareFileUploadSuccessResponse> {
  const uploadPath = 'file';
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let fileUploadSuccessResponse: PrepareFileUploadSuccessResponse;

  // Upload file in one part
  try {
    const response = await xeoStorageClient.post(`${uploadPath}`, {
      json: {
        name: filePath.split('/').pop() || 'unknown',
        parts: 1,
      },
    });
    if (response.status === 201) {
      fileUploadSuccessResponse = await response.json<PrepareFileUploadSuccessResponse>();
      consola.success('Upload link created successfully');
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

    await ky.put(fileUploadSuccessResponse.parts[0].uploadUrl, {
      body: fileBuffer,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
  return fileUploadSuccessResponse;
}

async function getFileEntryDownloadUrl(xeoStorageClient:KyInstance, fileEntryId: string): Promise<FileEntryGetResponse> {
  const metadataPath = `file/${fileEntryId}`;
  try {
    const response = await xeoStorageClient.get(metadataPath);
    if (response.status === 200) {
      const data = await response.json<FileEntryGetResponse>();
      consola.success('File entry metadata fetched successfully');
      return data;
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

async function createIfcToXktProcess(xeoConverterClient: KyInstance, fileUrl: string): Promise<ProcessCreateSuccessResponse> {
  const conversionPath = 'process';
  try {
    const response = await xeoConverterClient.post(conversionPath, {
      json: {
        downloadUrl: fileUrl,
        type: 'ifc-xkt',
      },
    });

    if (response.status === 201) {
      const data = await response.json<ProcessCreateSuccessResponse>();
      consola.success('Conversion started successfully with process ID:', data.id);
      return data;
    } else {
      throw new Error(`Failed to start conversion: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error(`HTTP Error: ${error.response.status} - ${error.response}`);
      throw error;
    } else {
      consola.error(`Unexpected Error: ${error}`);
      throw error;
    }
  }
}

async function convertIfcXkt(xeoStorageClient: KyInstance, xeoConverterClient: KyInstance, filePath: string, logFileName:string): Promise<void> {
  const logs: {
    timestamp: string
    fileUpload: PrepareFileUploadSuccessResponse | null;
    fileEntry: FileEntryGetResponse | null;
    procesEntry: ProcessCreateSuccessResponse | null;
  } = {
    timestamp: new Date().toISOString(),
    fileUpload: null,
    fileEntry: null,
    procesEntry: null,
  };


  const fileUploadSuccessResponse = await uploadFile( xeoStorageClient , filePath);
  logs.fileUpload = fileUploadSuccessResponse;

  const fileEntry = await getFileEntryDownloadUrl(xeoStorageClient, fileUploadSuccessResponse.id);
  logs.fileEntry = fileEntry;

  const procesEntry = await createIfcToXktProcess(xeoConverterClient, fileEntry.downloadUrl);
  logs.procesEntry = procesEntry;

  const logPath = path.join(LOGS_PATH, logFileName);

  // Write logs to file
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf8');
  consola.success(`Conversion process logs written to ${logPath}`);

}

/**
 * Converts a file path to a valid filename by:
 * 1. Extracting the filename part
 * 2. Replacing invalid characters
 *
 * @param filePath The original file path
 * @param replacement Character to replace invalid chars with (default: '_')
 * @returns A valid filename
 */
function pathToValidFilename(filePath: string, replacement: string = '_'): string {
  // Extract filename from path (handles both Unix and Windows paths)
  let filename = path.basename(filePath);

  // Define invalid characters (Windows has the most restrictive rules)
  // You can adjust this based on your target OS requirements
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;

  // Replace invalid characters
  filename = filename.replace(invalidChars, replacement);

  // Trim whitespace from both ends
  filename = filename.trim();

  // Handle reserved filenames (like CON, PRN, AUX, NUL, COM1-9, LPT1-9 on Windows)
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
  if (reservedNames.test(filename)) {
    filename = replacement + filename;
  }

  // Ensure the filename isn't empty after processing
  if (filename.length === 0) {
    filename = 'file' + replacement + Date.now();
  }

  // Limit length if needed (255 is generally safe for most filesystems)
  if (filename.length > 255) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    filename = base.substring(0, 255 - ext.length) + ext;
  }

  return filename;
}

export const convertIfcXktCommand: CommandModule = {
  command: 'convert-ifc-xkt',
  describe: 'Convert IFC file to XKT format',

  builder: (yargs) => {
    return yargs
      .option('input', {
        alias: 'i',
        describe: 'IFC input file path',
        demandOption: true,
        type: 'string',
      })
    ;
  },

  handler: async (argv) => {
    const { _, $0, ...executableArgv } = argv;
    const inputFilePath = executableArgv.input as string;

    const filename = pathToValidFilename(inputFilePath);
    const logFileName = `${filename}-convert-request.log.json`;
    try {
      await convertIfcXkt( xeoStorageClient, xeoConverterClient, inputFilePath, logFileName);
    } catch (error) {
      consola.error(util.format(error));
    }
  },
};
