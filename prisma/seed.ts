import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Crear (o actualizar) un Estudiante de prueba
  // Usamos 'upsert' para que no falle si lo corres dos veces
  const estudiante = await prisma.user.upsert({
    where: { email: '21390384@utchetumal.edu.mx' },
    update: {},
    create: {
      email: '21390384@utchetumal.edu.mx',
      password: 'password123', // En producción esto irá hasheado
      role: 'student',
      isActive: true,
      // AQUÍ ESTÁ LA MAGIA: Creamos el perfil al mismo tiempo
      studentProfile: {
        create: {
          matricula: '21390384',
          nombreCompleto: 'Diego Alberto Beltrán Can',
          carrera: 'Ingeniería en Desarrollo de Software',
          estatusAcademico: 'Activo',
          grado: '10', // Ejemplo
          perfilLaboral: { 
            skills: ['React', 'Next.js', 'PostgreSQL'],
            bio: 'Estudiante apasionado por el backend.'
          }
        }
      }
    },
  })

  console.log('✅ Usuario y Estudiante creado:', estudiante)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })