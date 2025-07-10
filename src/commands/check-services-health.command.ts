import type { ConverterHealthSuccessResponse, StorageHealthSuccessResponse } from "../types";
import { xeoConverterClient, xeoStorageClient } from '../client';
import { type CommandModule } from 'yargs';
import { consola } from "consola";
import fs from 'fs';
import { HEALTH_LOG_FILE } from "../constants";
import { HTTPError } from "ky";
import type { KyInstance } from 'ky';
import util from 'util';


/**
 * Checks the health of xeoConverter and xeoStorage services and logs the status.
 * @param xeoConverterClient - The client instance for xeo conversion operations.
 * @param xeoStorageClient - The client instance for xeo storage operations.
 */
async function checkServicesHealth(xeoConverterClient: KyInstance, xeoStorageClient: KyInstance) {
  const healthPath = 'health';
  const logs: {
    timestamp: string;
    xeoConverter: ConverterHealthSuccessResponse;
    xeoStorageClient: StorageHealthSuccessResponse;
  } = {
    timestamp: new Date().toISOString(),
    xeoConverter: {},
    xeoStorageClient: {},
  };
  try {
    const converterResponse = await xeoConverterClient.get(`${healthPath}`);
    if (converterResponse.status === 200) {
      const data = await converterResponse.json<ConverterHealthSuccessResponse>();
      logs.xeoConverter = data;
      consola.success('Fetch converter health status');
    } else {
      throw new Error(`Converter health check failed: ${converterResponse.statusText}`);
    }

    const storageResponse = await xeoStorageClient.get(`${healthPath}`);
    if (storageResponse.status === 200) {
      const data = await storageResponse.json<StorageHealthSuccessResponse>();
      logs.xeoStorageClient = data;
      consola.success('Fetch storage health status');
    } else {
      throw new Error(`Storage health check failed: ${storageResponse.statusText}`);
    }

    // Write logs to file
    fs.writeFileSync(HEALTH_LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
    consola.success(`Health status logged to ${HEALTH_LOG_FILE}`);
  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
    } else {
      consola.error(`Unexpected Error: ${error}`);
    }
  }
}

/**
 * Command module to check the health of xeoservices.
 * It fetches the health status of xeoConverter and xeoStorage services
 * and logs the results to a file.
 */
export const checkServicesHealthCommand: CommandModule = {
  command: 'health',
  describe: 'Check xeoservices health',

  builder: (yargs) => {
    return yargs;
  },

  handler: (argv) => {
    const { _, $0, ...executableArgv } = argv;

    try {
      checkServicesHealth(xeoConverterClient, xeoStorageClient);

    } catch (error) {
      consola.error(util.format(error));
    }
  },
};
