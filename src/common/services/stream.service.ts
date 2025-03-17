import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import { StringDecoder } from 'string_decoder';

@Injectable()
export default class StreamService {
  constructor() {}

  /**
   * The following function converts a buffer to a string
   * @param fileStream is a buffer stream which is to be converted
   * @returns a string containing the information of the buffer
   */
  bufferToStream = (
    fileStream: PassThrough,
  ): Promise<[Error | null, string | null]> => {
    const decoder = new StringDecoder('utf8');
    return new Promise((resolve) => {
      let fileContent = '';

      fileStream.on('data', (chunk) => {
        fileContent += decoder.write(chunk);
      });

      fileStream.on('end', () => {
        fileContent += decoder.end();
        resolve([null, fileContent]);
      });

      fileStream.on('error', (error) => {
        resolve([new Error(`Failed to read file: ${error.message}`), null]);
      });
    });
  };
}
