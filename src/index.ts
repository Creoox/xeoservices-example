import ky, { HTTPError } from "ky";
import { consola } from "consola";

import type { ConverterHealthSuccessResponse } from "./types/converter-api";


const XEO_STORAGE_URL = "https://storage.xeo.vision";
const XEO_CONVERTER_URL = "https://converter.xeo.vision";


async function checkConverterStatus() {
  const healthPath = '/health';

  try {
    const converterHealthResponse = await ky.get(`${XEO_CONVERTER_URL}${healthPath}`);
    if (converterHealthResponse.status === 200) {
      const healthData = await converterHealthResponse.json<ConverterHealthSuccessResponse>();
      consola.success('Converter Health Status', JSON.stringify(healthData, null, 2));
    }

  } catch (error) {
    if (error instanceof HTTPError) {
      consola.error(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
    } else {
      consola.error(`Unexpected Error: ${error}`);
    }
  }
}



async function example() {
  await checkConverterStatus();
}

example();

