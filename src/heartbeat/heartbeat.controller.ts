import { Controller, Get, Param } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';

@Controller('heartbeat')
export class HeartbeatController {
    constructor(private readonly hbService: HeartbeatService) {}

    @Get(':config')
    getHeartbeat(@Param() params): {}{
        return this.hbService.check(params.config);
    }
}
