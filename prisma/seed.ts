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

  // 2. Crear las Carreras oficiales de Joby (Ajustado según la interfaz)
  const carreras = [
    'Ingeniería de Software',
    'Licenciatura en Gastronomía',
    'Ingeniería en Mecatrónica',
    'Licenciatura en Negocios'
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
            nombre: '',
            apellidoPaterno: '',
            esSuperAdmin: true,
          }
        }
      }
    })
    console.log(`✅ Súper Administrador creado: ${adminEmail}`)
  } else {
  }

  // 4. Crear Empresas de prueba
  console.log('🌱 Sembrando empresas de prueba...')
  const empresasParaSembrar = [
    {
      correo: 'contacto@techsoluciones.com',
      password: 'PasswordTech2026',
      nombre_comercial: 'TechSoluciones Chetumal',
      descripcion: 'Empresa líder en desarrollo de software a medida, soporte técnico y soluciones de TI para la península de Yucatán.',
      razon_social: 'Tecnologías y Soluciones del Sureste S.A. de C.V.',
      rfc: 'TSS150820AA1',
      sitio_web: 'https://techsoluciones.com',
      nombre: 'Alejandro',
      apellidoPaterno: 'Gómez',
      apellidoMaterno: 'Pérez',
      cargo_contacto: 'Director de Tecnología',
      telefono_contacto: '9831234567',
      estatus_verificacion: 'APROBADA' as const,
      estado: 'Quintana Roo',
      municipio: 'Othón P. Blanco',
    },
    {
      correo: 'reclutamiento@hotelriviera.com',
      password: 'PasswordRiviera2026',
      nombre_comercial: 'Hotel Riviera Maya Resort',
      descripcion: 'Resort de lujo de 5 estrellas en la Riviera Maya, enfocado en hospitalidad de clase mundial y experiencias gastronómicas de primer nivel.',
      razon_social: 'Hotelería y Turismo del Caribe S.A. de C.V.',
      rfc: 'HTC120515BB2',
      sitio_web: 'https://hotelrivieramaya.com',
      nombre: 'Sofía',
      apellidoPaterno: 'Rodríguez',
      apellidoMaterno: 'López',
      cargo_contacto: 'Gerente de Recursos Humanos',
      telefono_contacto: '9847654321',
      estatus_verificacion: 'APROBADA' as const,
      estado: 'Quintana Roo',
      municipio: 'Solidaridad',
    },
    {
      correo: 'rrhh@mecatronicacaribe.com',
      password: 'PasswordMeca2026',
      nombre_comercial: 'Mecatrónica Aplicada del Caribe',
      descripcion: 'Soluciones integrales de automatización industrial, robótica y mantenimiento mecatrónico para empresas manufactureras.',
      razon_social: 'Mecatrónica y Automatización del Caribe S.A. de C.V.',
      rfc: 'MAC181005CC3',
      sitio_web: 'https://mecatronicacaribe.com',
      nombre: 'Carlos',
      apellidoPaterno: 'Sánchez',
      apellidoMaterno: 'Ramírez',
      cargo_contacto: 'Jefe de Operaciones y Talento',
      telefono_contacto: '9988889900',
      estatus_verificacion: 'PENDIENTE' as const,
      estado: 'Quintana Roo',
      municipio: 'Benito Juárez',
    },
    {
      correo: 'info@restaurantefaro.com',
      password: 'PasswordFaro2026',
      nombre_comercial: 'Restaurante El Faro Chetumal',
      descripcion: 'Restaurante de mariscos tradicionales con un toque de autor frente a la bahía de Chetumal, comprometido con la excelencia culinaria.',
      razon_social: 'Servicios Gastronómicos de Chetumal S. de R.L.',
      rfc: 'SGC190412DD4',
      sitio_web: 'https://restaurantelfarochetumal.com',
      nombre: 'Elena',
      apellidoPaterno: 'Martínez',
      apellidoMaterno: 'Cruz',
      cargo_contacto: 'Propietaria y Chef Ejecutiva',
      telefono_contacto: '9839876543',
      estatus_verificacion: 'REQUIERE_CAMBIOS' as const,
      motivo_rechazo: 'El RFC proporcionado no coincide con la Cédula de Identificación Fiscal cargada. Favor de corregir y volver a enviar.',
      estado: 'Quintana Roo',
      municipio: 'Othón P. Blanco',
    },
    {
      correo: 'admin@consultoriasureste.com',
      password: 'PasswordConsultoria2026',
      nombre_comercial: 'Consultoría Estratégica del Sureste',
      descripcion: 'Servicios profesionales de consultoría empresarial, finanzas corporativas, y mercadotecnia estratégica para PyMEs del estado.',
      razon_social: 'Asesores de Negocios del Sureste S.C.',
      rfc: 'ANS200218EE5',
      sitio_web: 'https://consultoriasureste.com',
      nombre: 'Javier',
      apellidoPaterno: 'Díaz',
      apellidoMaterno: 'Méndez',
      cargo_contacto: 'Socio Director',
      telefono_contacto: '9832223344',
      estatus_verificacion: 'SIN_ENVIAR' as const,
      estado: 'Quintana Roo',
      municipio: 'Othón P. Blanco',
    }
  ]

  const salt = await bcrypt.genSalt(10)

  for (const emp of empresasParaSembrar) {
    const usuarioExistente = await prisma.user.findUnique({
      where: { correo: emp.correo }
    })

    if (!usuarioExistente) {
      if (emp.rfc) {
        const rfcExistente = await prisma.empresa.findUnique({
          where: { rfc: emp.rfc }
        })
        if (rfcExistente) {
          console.log(`⚠️ El RFC ${emp.rfc} ya está registrado para otra empresa. Omitiendo ${emp.nombre_comercial}...`)
          continue
        }
      }

      const hash = await bcrypt.hash(emp.password, salt)
      await prisma.user.create({
        data: {
          correo: emp.correo,
          password_hash: hash,
          rol: 'EMPRESA',
          verifiedAt: new Date(),
          empresa: {
            create: {
              nombre_comercial: emp.nombre_comercial,
              descripcion: emp.descripcion,
              razon_social: emp.razon_social,
              rfc: emp.rfc,
              sitio_web: emp.sitio_web,
              nombre: emp.nombre,
              apellidoPaterno: emp.apellidoPaterno,
              apellidoMaterno: emp.apellidoMaterno,
              cargo_contacto: emp.cargo_contacto,
              telefono_contacto: emp.telefono_contacto,
              estatus_verificacion: emp.estatus_verificacion,
              motivo_rechazo: emp.motivo_rechazo || null,
              estado: emp.estado,
              municipio: emp.municipio,
              fotos_empresa: [],
            }
          }
        }
      })
      console.log(`✅ Empresa creada con éxito: ${emp.nombre_comercial} (${emp.correo})`)
    } else {
      console.log(`⚠️ La empresa con correo ${emp.correo} ya estaba registrada.`)
    }
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