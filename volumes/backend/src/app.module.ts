import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SedesModule } from './sedes/sedes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MesasModule } from './mesas/mesas.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [PrismaModule, AuthModule, SedesModule, UsuariosModule, MesasModule, ProductosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
