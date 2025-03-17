import { join } from 'path';
import { ensureDir } from 'fs-extra';
import { Logger } from '@nestjs/common';

export async function initializeDirectories() {
  //for one time csv generation
  const csvDir = join(process.cwd(), 'public', 'csv');
  await ensureDir(csvDir);
  new Logger().log(`public/csv directory initiated`, 'NestApplication');
}
