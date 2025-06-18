import type { operations } from './storage-api-schema';

type StorageHealthSuccessResponse = operations['HealthController_check']['responses']['200']['content']['application/json'];
export type PrepareFileUploadSuccessResponse = operations['FileController_createOne']['responses']['201']['content']['application/json'];
export type FileEntryGetResponse = operations['FileController_getOne']['responses']['200']['content']['application/json'];
