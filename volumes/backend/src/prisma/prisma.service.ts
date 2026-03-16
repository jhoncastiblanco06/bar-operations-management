import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Reemplazamos process.env por la cadena de texto literal
    const pool = new Pool({
      connectionString:
        'postgresql://manager:z0LBnvLxjbzRKzWSApCr@database:5432/Bar_DB?schema=public',
    });

    const adapter = new PrismaPg(pool as any);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🚀 Base de datos conectada exitosamente (Prisma 7)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
