import { Module, Global } from '@nestjs/common';
import { PlsqlService } from './plsql.service.js';

@Global()
@Module({
  providers: [PlsqlService],
  exports: [PlsqlService],
})
export class PlsqlModule {}
