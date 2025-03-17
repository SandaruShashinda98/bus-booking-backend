export enum UploadStatusEnum {
  URL_GENERATED = 0,
  UPLOADING = 1,
  UPLOAD_COMPLETED = 2,
  PROCESSING = 3,
  PROCESSING_COMPLETED = 4,
  JOB_COMPLETED = 5,
}

export enum FileStatusEnum {
  PARSED = 'PARSED',
  FAILED = 'FAILED',
  NA = 'NA', // not allocated
}
