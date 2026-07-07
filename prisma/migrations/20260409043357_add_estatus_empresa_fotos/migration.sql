-- CreateEnum
CREATE TYPE "EstatusAcademico" AS ENUM ('ACTIVO', 'EGRESADO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "DisponibilidadReubicacion" AS ENUM ('NO_DISPONIBLE', 'DENTRO_DEL_ESTADO', 'NACIONAL', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('ESTADIA', 'MEDIO_TIEMPO', 'TIEMPO_COMPLETO');

-- CreateEnum
CREATE TYPE "ModalidadTrabajo" AS ENUM ('PRESENCIAL', 'HIBRIDO', 'REMOTO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ESTUDIANTE', 'EMPRESA', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstatusEmpresa" AS ENUM ('SIN_ENVIAR', 'PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Universidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "siglas" TEXT NOT NULL,
    "tipo_periodo" TEXT NOT NULL,

    CONSTRAINT "Universidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrera" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ESTUDIANTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "universidadId" INTEGER NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "matricula" TEXT NOT NULL,
    "foto_perfil_url" TEXT,
    "estado" TEXT DEFAULT 'Quintana Roo',
    "municipio" TEXT DEFAULT 'Othón P. Blanco',
    "tipos_contrato" "TipoContrato"[],
    "reubicacion" "DisponibilidadReubicacion" NOT NULL DEFAULT 'NO_DISPONIBLE',
    "bio" TEXT,
    "estatus_academico" "EstatusAcademico" NOT NULL DEFAULT 'ACTIVO',
    "periodo_academico" INTEGER,
    "habilidades" TEXT[],
    "idiomas" TEXT[],
    "enlaces" JSONB,
    "cv_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nombre_comercial" TEXT NOT NULL,
    "descripcion" TEXT,
    "logo_url" TEXT,
    "sitio_web" TEXT,
    "enlaces" JSONB,
    "razon_social" TEXT,
    "rfc" TEXT,
    "estado" TEXT DEFAULT 'Quintana Roo',
    "municipio" TEXT DEFAULT 'Othón P. Blanco',
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "cargo_contacto" TEXT NOT NULL,
    "telefono_contacto" TEXT,
    "fotos_empresa" TEXT[],
    "estatus_verificacion" "EstatusEmpresa" NOT NULL DEFAULT 'SIN_ENVIAR',
    "motivo_rechazo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacante" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo_contrato" "TipoContrato" NOT NULL,
    "modalidad" "ModalidadTrabajo" NOT NULL,
    "estado" TEXT,
    "municipio" TEXT,
    "habilidades_req" TEXT[],
    "sueldo_min" INTEGER,
    "sueldo_max" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_limite" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiencia" (
    "id" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "puesto" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "logros" TEXT[],
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),

    CONSTRAINT "Experiencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "puntos_clave" TEXT[],
    "url_enlace" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducacionExtra" (
    "id" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "año" INTEGER,

    CONSTRAINT "EducacionExtra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_correo_key" ON "User"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_usuarioId_key" ON "Estudiante"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_matricula_key" ON "Estudiante"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_usuarioId_key" ON "Empresa"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_rfc_key" ON "Empresa"("rfc");

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_universidadId_fkey" FOREIGN KEY ("universidadId") REFERENCES "Universidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacante" ADD CONSTRAINT "Vacante_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiencia" ADD CONSTRAINT "Experiencia_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducacionExtra" ADD CONSTRAINT "EducacionExtra_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
