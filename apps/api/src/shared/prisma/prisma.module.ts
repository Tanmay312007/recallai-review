import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * PrismaModule — marked @Global() so every feature module can inject
 * PrismaService via DI without re-importing this module.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
