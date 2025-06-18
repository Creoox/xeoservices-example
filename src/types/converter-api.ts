import type { components, operations } from './converter-api-schema';

// type ProcessCreateResponse = components['schemas']['ProcessCreateResponse'];
// type ProcessOutputResponse = components['schemas']['ProcessOutputResponse'];
// type ProcessEntryResponse = components['schemas']['ProcessEntryResponse'];

export type ConverterHealthSuccessResponse = operations['HealthController_check']['responses']['200']['content']['application/json'];
