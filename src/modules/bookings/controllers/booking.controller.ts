import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('booking')
@Controller({ path: 'booking' })
export class BookingController {}