import { IsIn, IsOptional } from 'class-validator';
import { TIME_WINDOWS, TimeWindow } from '../../common/constants/time-windows';

export class AvailabilityQueryDto {
  @IsOptional()
  @IsIn(TIME_WINDOWS)
  window?: TimeWindow = '1h';
}
