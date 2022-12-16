import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { HeartbeatController } from './heartbeat/heartbeat.controller';
import { HeartbeatService } from './heartbeat/heartbeat.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController, HeartbeatController],
  providers: [AppService, HeartbeatService],
})
export class AppModule {}
