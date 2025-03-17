import { Controller } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@Controller({ path: 'reports' })
export class ReportsController {
  constructor() {}
}
