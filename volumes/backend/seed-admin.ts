import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@gg.com' },
    update: {},
    create: {
      nombre_completo: 'Administrador Maestro',
      email: 'admin@gg.com',
      password_hash: 'admin', // Nota: En producción usa Bcrypt, pero para esta prueba lo pondremos directo
      rol: 'Administrador',
      estado: 'Activo'
    },
  });
  console.log('✅ Usuario Creado:', admin);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
