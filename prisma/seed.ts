import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando la siembra de datos...')

  // 1. Crear la Universidad (Si no existe, la crea. Si existe, no hace nada)
  const utch = await prisma.universidad.upsert({
    where: { id: 1 }, // Asumimos que será la ID 1
    update: {},
    create: {
      nombre: 'Universidad Tecnológica de Chetumal',
      siglas: 'UTCH',
      tipo_periodo: 'CUATRIMESTRE',
    },
  })
  console.log(`✅ Universidad registrada: ${utch.nombre}`)

  // 2. Crear las Carreras oficiales de Joby
  const carreras = [
    'Innovación de Negocios y Mercadotecnia',
    'Gastronomía',
    'Mecatrónica',
    'Desarrollo y Gestión de Software'
  ]

  for (const nombreCarrera of carreras) {
    // Usamos findFirst para no duplicar si corres el seed dos veces
    const existe = await prisma.carrera.findFirst({ where: { nombre: nombreCarrera } })
    if (!existe) {
      await prisma.carrera.create({ data: { nombre: nombreCarrera } })
      console.log(`✅ Carrera registrada: ${nombreCarrera}`)
    }
  }

  // 3. Crear el Súper Administrador por defecto
  const adminEmail = 'admin@utchetumal.edu.mx'
  const adminExistente = await prisma.user.findUnique({ where: { correo: adminEmail } })

  if (!adminExistente) {
    const defaultPassword = 'AdminUtch2026'
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(defaultPassword, salt)

    await prisma.user.create({
      data: {
        correo: adminEmail,
        password_hash: hash,
        rol: 'ADMIN',
        admin: {
          create: {
            nombre: 'Sistemas',
            apellidoPaterno: 'UTCH',
            esSuperAdmin: true,
          }
        }
      }
    })
    console.log(`✅ Súper Administrador creado: ${adminEmail}`)
  } else {
    console.log(`⚠️  El Súper Administrador ya estaba registrado.`)
  }

  console.log('🌳 Base de datos poblada con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })