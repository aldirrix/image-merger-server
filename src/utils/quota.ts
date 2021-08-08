import { QuotaProps } from "../types";

export const isQuotaExceeded = async (quotaProps: QuotaProps, referenceFileNames: string[]) => {
  // Files are saved in the format TIMESTAMP-ID so slicing the last (-N) will
  // always result in the most recent files, the 1st element being the oldest
  const mostRecentFilenames = referenceFileNames.slice(-Math.abs(quotaProps.maxRequests));

  const oldestFileCreationTimestamp = Number(mostRecentFilenames[0].split('-')[0]);
  const isOldestFileWithinInterval = oldestFileCreationTimestamp > (quotaProps.executionTimestamp - quotaProps.timeReferenceMs);

  return mostRecentFilenames.length >= 10 && isOldestFileWithinInterval;
}
