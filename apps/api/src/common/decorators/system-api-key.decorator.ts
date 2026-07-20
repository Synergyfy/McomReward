import { SetMetadata } from "@nestjs/common";

export const IS_SYSTEM_API_KEY = "isSystemApiKey";
export const SystemApiKey = () => SetMetadata(IS_SYSTEM_API_KEY, true);
