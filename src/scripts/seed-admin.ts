import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@utchetumal.edu.mx'
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminUtch2026'

  console.log(`Verificando existencia de Admin: ${adminEmail}`)

  const existingAdmin = await prisma.user.findUnique({
    where: { correo: adminEmail }
  })

  if (existingAdmin) {
    console.log('El SuperAdministrador ya existe en la base de datos.')
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Creamos el user y de una vez el Admin pero sin datos personales, 
  // para forzar el flujo de completar perfil.
  const newUser = await prisma.user.create({
    data: {
      correo: adminEmail,
      password_hash: hashedPassword,
      rol: 'ADMIN',
      admin: {
        create: {
          nombre: '',
          apellidoPaterno: '',
          esSuperAdmin: true,
        }
      }
    }
  })

  console.log('✅ SuperAdministrador creado exitosamente.')
  console.log(`Email: ${adminEmail}`)
  console.log(`Contraseña: ${adminPassword}`)
  console.log(`Por favor, inicia sesión para completar el perfil.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
