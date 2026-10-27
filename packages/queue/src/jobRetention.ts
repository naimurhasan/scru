const KEEP_COMPLETED_SECONDS = 3_600;
const KEEP_FAILED_SECONDS = 86_400;

export const JOB_RETENTION = {
  removeOnComplete: { age: KEEP_COMPLETED_SECONDS },
  removeOnFail: { age: KEEP_FAILED_SECONDS },
};
