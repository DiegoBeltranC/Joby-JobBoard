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
    console.log(`⚠️  El Súper Administrador ya estaba registrado.`)
  }

  // 4. Crear Empresas de Prueba
  console.log('🌱 Creando empresas de prueba...')
  const passwordSalt = await bcrypt.genSalt(10)
  const companyPasswordHash = await bcrypt.hash('EmpresaUtch2026', passwordSalt)

  const empresasData = [
    {
      correo: 'contacto@techsolutions.com',
      empresa: {
        nombre_comercial: 'TechSolutions Chetumal',
        descripcion: 'Líderes en desarrollo de software a la medida, automatización y soluciones en la nube en el sureste de México.',
        razon_social: 'Tecnologías de Software de Quintana Roo S.A. de C.V.',
        rfc: 'TSQ180512AB3',
        sitio_web: 'https://techsolutions-chetumal.example.com',
        enlaces: { linkedin: 'https://linkedin.com/company/techsolutions', facebook: 'https://facebook.com/techsolutions' },
        estado: 'Quintana Roo',
        municipio: 'Othón P. Blanco',
        nombre: 'Carlos',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: 'Gómez',
        cargo_contacto: 'Director de Tecnología / Reclutador',
        telefono_contacto: '9831234567',
        estatus_verificacion: 'APROBADA' as const,
        fotos_empresa: [],
      },
      vacantes: [
        {
          titulo: 'Desarrollador Web Next.js Junior',
          descripcion: 'Buscamos un desarrollador junior para integrarse al equipo de desarrollo front-end. Trabajarás con React, Next.js y TailwindCSS.',
          tipo_contrato: 'TIEMPO_COMPLETO' as const,
          modalidad: 'HIBRIDO' as const,
          horario: 'Lunes a Viernes de 9:00 AM a 6:00 PM',
          habilidades_req: ['Next.js', 'React', 'TypeScript', 'TailwindCSS'],
          idiomas_req: ['Inglés - B1'],
          sueldo_min: 12000,
          sueldo_max: 16000,
          estatus: 'ABIERTA' as const,
        },
        {
          titulo: 'Estadía en Soporte de Sistemas',
          descripcion: 'Oportunidad para estudiantes de Ingeniería de Software para liberar su estadía técnica en soporte de infraestructura, redes y mantenimiento.',
          tipo_contrato: 'ESTADIA' as const,
          modalidad: 'PRESENCIAL' as const,
          horario: 'Lunes a Viernes de 8:00 AM a 2:00 PM',
          habilidades_req: ['Redes', 'Soporte Técnico', 'Windows Server', 'Linux'],
          idiomas_req: [],
          sueldo_min: 4000,
          sueldo_max: 5000,
          estatus: 'ABIERTA' as const,
        }
      ]
    },
    {
      correo: 'reclutamiento@grandriviera.com',
      empresa: {
        nombre_comercial: 'Hotel Grand Riviera',
        descripcion: 'Resort de lujo 5 estrellas enfocado en ofrecer experiencias turísticas inolvidables en la Riviera Maya.',
        razon_social: 'Servicios Hoteleros del Caribe S.A. de C.V.',
        rfc: 'SHC120405XYZ',
        sitio_web: 'https://grandrivieraresort.example.com',
        enlaces: { facebook: 'https://facebook.com/grandrivierahotel' },
        estado: 'Quintana Roo',
        municipio: 'Solidaridad',
        nombre: 'Ana María',
        apellidoPaterno: 'Ramírez',
        apellidoMaterno: '',
        cargo_contacto: 'Gerente de Capital Humano',
        telefono_contacto: '9847654321',
        estatus_verificacion: 'APROBADA' as const,
        fotos_empresa: [],
      },
      vacantes: [
        {
          titulo: 'Prácticas / Estadía en Gastronomía',
          descripcion: 'Estudiantes para integrarse en el área de cocina fría y repostería en nuestros restaurantes buffet y de especialidad.',
          tipo_contrato: 'ESTADIA' as const,
          modalidad: 'PRESENCIAL' as const,
          horario: 'Rotativo de 6 horas diarias',
          habilidades_req: ['Cocina Fría', 'Higiene alimentaria', 'Trabajo en equipo'],
          idiomas_req: ['Inglés - A2'],
          sueldo_min: 6000,
          sueldo_max: 7000,
          estatus: 'ABIERTA' as const,
        }
      ]
    },
    {
      correo: 'rrhh@mecatronicasureste.mx',
      empresa: {
        nombre_comercial: 'Mecatrónica del Sureste',
        descripcion: 'Diseño e implementación de sistemas de automatización industrial y mantenimiento mecatrónico.',
        razon_social: 'Automatizaciones Industriales del Sureste S. de R.L.',
        rfc: 'AIS210130MN8',
        sitio_web: '',
        enlaces: {},
        estado: 'Quintana Roo',
        municipio: 'Othón P. Blanco',
        nombre: 'Roberto',
        apellidoPaterno: 'Campos',
        apellidoMaterno: '',
        cargo_contacto: 'Jefe de Planta y Reclutamiento',
        telefono_contacto: '9832223344',
        estatus_verificacion: 'PENDIENTE' as const,
        fotos_empresa: [],
      },
      vacantes: []
    },
    {
      correo: 'gerencia@saborcosteno.mx',
      empresa: {
        nombre_comercial: 'El Sabor Costeño',
        descripcion: 'Restaurante familiar especializado en comida típica del Caribe y mariscos.',
        razon_social: 'Alimentos y Bebidas de Chetumal S.A.',
        rfc: 'ABC990909AA0',
        sitio_web: '',
        enlaces: {},
        estado: 'Quintana Roo',
        municipio: 'Othón P. Blanco',
        nombre: 'Gabriela',
        apellidoPaterno: 'Sosa',
        apellidoMaterno: '',
        cargo_contacto: 'Propietaria',
        telefono_contacto: '9835556677',
        estatus_verificacion: 'REQUIERE_CAMBIOS' as const,
        motivo_rechazo: 'El RFC proporcionado no se encuentra registrado ante el SAT. Por favor, suba una constancia de situación fiscal vigente o corrija la clave.',
        fotos_empresa: [],
      },
      vacantes: []
    },
    {
      correo: 'contacto@negociospeninsulares.com',
      empresa: {
        nombre_comercial: 'Negocios Peninsulares',
        descripcion: 'Consultoría en administración, marketing digital y finanzas corporativas.',
        razon_social: '',
        rfc: null,
        sitio_web: '',
        enlaces: {},
        estado: 'Quintana Roo',
        municipio: 'Othón P. Blanco',
        nombre: 'Mauricio',
        apellidoPaterno: 'Pech',
        apellidoMaterno: '',
        cargo_contacto: 'Asesor Administrativo',
        telefono_contacto: '',
        estatus_verificacion: 'SIN_ENVIAR' as const,
        fotos_empresa: [],
      },
      vacantes: []
    }
  ]

  for (const item of empresasData) {
    let user = await prisma.user.findUnique({
      where: { correo: item.correo },
      include: { empresa: true }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          correo: item.correo,
          password_hash: companyPasswordHash,
          rol: 'EMPRESA',
          verifiedAt: new Date(),
          empresa: {
            create: item.empresa
          }
        },
        include: { empresa: true }
      })
      console.log(`✅ Empresa creada y vinculada al usuario: ${item.correo}`)
    } else {
      console.log(`⚠️  El usuario ${item.correo} ya existe.`)
      // Si la empresa no existe en el usuario (por alguna razón), la creamos
      if (!user.empresa) {
        await prisma.empresa.create({
          data: {
            ...item.empresa,
            usuarioId: user.id
          }
        })
        console.log(`✅ Perfil de empresa creado para usuario existente: ${item.correo}`)
      } else {
        // Actualizamos los datos para que coincidan con la propuesta de seed
        await prisma.empresa.update({
          where: { usuarioId: user.id },
          data: item.empresa
        })
        console.log(`🔄 Perfil de empresa actualizado: ${item.correo}`)
      }
    }

    // Recargamos el usuario con su empresa para tener el ID actualizado
    const userConEmpresa = await prisma.user.findUnique({
      where: { id: user.id },
      include: { empresa: true }
    })

    if (userConEmpresa?.empresa && item.vacantes.length > 0) {
      for (const vacanteData of item.vacantes) {
        const existeVacante = await prisma.vacante.findFirst({
          where: {
            empresaId: userConEmpresa.empresa.id,
            titulo: vacanteData.titulo
          }
        })

        if (!existeVacante) {
          await prisma.vacante.create({
            data: {
              ...vacanteData,
              empresaId: userConEmpresa.empresa.id
            }
          })
          console.log(`   └─ ✅ Vacante creada: "${vacanteData.titulo}"`)
        } else {
          console.log(`   └─ ⚠️  La vacante "${vacanteData.titulo}" ya existe para esta empresa.`)
        }
      }
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