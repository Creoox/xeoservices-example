import type { operations } from './converter-api-schema';

export type ConverterHealthSuccessResponse = operations['HealthController_check']['responses']['200']['content']['application/json'];
export type ProcessCreateSuccessResponse = operations['ProcessController_createOne']['responses']['200']['content']['application/json'];
export type ProcessGetResponse = operations['ProcessController_getOne']['responses']['200']['content']['application/json'];
