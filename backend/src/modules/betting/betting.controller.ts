import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { BettingService } from './betting.service';
import { RealMoney } from '../../common/decorators/real-money.decorator';
import { RegulatoryModeGuard } from '../../common/guards/regulatory-mode.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

class PlaceBetDto {
  selections!: { selectionId: string }[];
  stake!: string;
}

@ApiTags('bets')
@ApiBearerAuth()
@Controller('bets')
@UseGuards(AuthGuard, RegulatoryModeGuard)
export class BettingController {
  constructor(private readonly bettingService: BettingService) {}

  @Post()
  @RealMoney()
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  async placeBet(
    @CurrentUser() userId: string,
    @Body() dto: PlaceBetDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required.');
    }
    return this.bettingService.placeBet({
      userId,
      selectionIds: dto.selections.map((s) => s.selectionId),
      stake: dto.stake,
      idempotencyKey,
    });
  }
}
