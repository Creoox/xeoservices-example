import { type CommandModule } from 'yargs';
import { consola } from "consola";
import fs from 'fs';
import type { KyInstance } from 'ky';
import { LOGS_PATH } from '../constants';
import path from 'path';
import type { ProcessGetResponse } from "../types";
import util from 'util';
import { xeoConverterClient } from '../client';

async function checkProcess(xeoConverterClient: KyInstance, processId: string){
  const conversionPath = 'process';
  const logs: {
    timestamp: string;
    processResponse: ProcessGetResponse | null;
  } = {
    timestamp: new Date().toISOString(),
    processResponse: null,
  };

  const processPath = path.join(LOGS_PATH, `${processId}-process-status.log.json`);

  try {
    const response = await xeoConverterClient.get(`${conversionPath}/${processId}`);
    if (response.status === 200) {
      const data = await response.json<ProcessGetResponse>();
      logs.processResponse = data;
      consola.success(`Process status for ID ${processId} fetched successfully`);
      // Write the output to a file
      fs.writeFileSync(processPath, JSON.stringify(logs, null, 2), 'utf8');
      consola.success(`Conversion completed successfully. Output written to ${processPath}`);
    } else {
      throw new Error(`Failed to check process status: ${response.statusText}`);
    }
  } catch (error) {
    consola.error(`Error checking process status: ${error}`);
  }
}


export const checkProcessCommand: CommandModule = {
  command: 'check-process',
  describe: 'Check process status by ID',

  builder: (yargs) => {
    return yargs
      .option('process', {
        alias: 'p',
        describe: 'Id of the process to check',
        demandOption: true,
        type: 'string',
      })
    ;
  },

  handler: (argv) => {
    const { _, $0, ...executableArgv } = argv;

    try {
      checkProcess(xeoConverterClient, executableArgv.process as string);
    } catch (error) {
      consola.error(util.format(error));
    }
  },
};
