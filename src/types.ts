export type ImageProps = {
  filePath: string;
  id: string;
}

export type QuotaProps = {
  executionTimestamp: number;
  timeReferenceMs: number;
  maxRequests: number;
}

export type ImageUsecaseProps = {
  apiUrl: string;
  cacheFolder: string;
}
