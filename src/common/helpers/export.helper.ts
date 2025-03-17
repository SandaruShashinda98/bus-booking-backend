import * as fastcsv from 'fast-csv';

export async function generateCSV(formattedData: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const csvRows: any[] = [];

    fastcsv
      .write(formattedData, { headers: true })
      .on('data', (data) => {
        csvRows.push(data);
      })
      .on('end', () => {
        resolve(Buffer.from(csvRows.join('')));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * The function makes an array of strings from an large string based on line separation
 * @param longString is a string containing csv values in different lines
 * @returns an array of string which contain a line information in each value
 */
export function getCSVFirstColumnFromString(longString: string): string[] {
  const extractFirstItem = (line: string) => {
    try {
      return line.split(',').at(0);
    } catch {
      return '';
    }
  };

  const result = longString
    .trim()
    .split('\n')
    .map(extractFirstItem)
    .filter(Boolean);

  return result;
}
