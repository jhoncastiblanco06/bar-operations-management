import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SedesModule } from './sedes/sedes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MesasModule } from './mesas/mesas.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InventarioModule } from './inventario/inventario.module';
import { CajaModule } from './caja/caja.module';

@Module({
  imports: [
    // 📸 LA SOLUCIÓN: Usamos process.cwd() que apunta a la raíz real del contenedor
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    SedesModule,
    UsuariosModule,
    MesasModule,
    ProductosModule,
    CategoriasModule,
    InventarioModule,
    CajaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}