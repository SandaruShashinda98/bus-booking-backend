/**
 * The following function generates a key for the upload based on directory and fileName
 * @param directory the directory the file to be saved
 * @param fileName the file name of the file to be uploaded
 * @returns a generated key for upload that contains the directory
 */
export function generateUploadKey(directory: string, fileName: string): string {
  return `${directory}/${Date.now()}-${fileName}`;
}
