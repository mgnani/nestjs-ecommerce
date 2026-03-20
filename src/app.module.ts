import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './database/typeorm/typeorm.service';
import { ApiModule } from './api/api.module';
import { configuration } from './config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RealtimeController } from './api/realtime';
@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ApiModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController, RealtimeController],
  providers: [AppService],
})
export class AppModule {}
