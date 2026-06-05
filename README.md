# 🎓 JobBy - Bolsa de Trabajo UT Chetumal

Plataforma de vinculación estudiantil y profesional para la Universidad Tecnológica de Chetumal. Construida con un stack moderno enfocado en rendimiento y escalabilidad.

## 🛠 Tecnologías Utilizadas
* **Framework:** Next.js 15 (App Router)
* **Lenguaje:** TypeScript / Node.js (v24+)
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma 6
* **Estilos:** Tailwind CSS 4
* **Componentes UI:** shadcn/ui + lucide-react

---

## 🚀 Guía de Instalación Rápida para Desarrolladores

Para levantar el proyecto en tu máquina local, sigue estos pasos en orden:

### 1. Requisitos Previos
Asegúrate de tener instalado en tu computadora:
* [Node.js](https://nodejs.org/) (Versión 20 o superior. Recomendado v24+).
* [PostgreSQL](https://www.postgresql.org/) (Debe estar corriendo en tu máquina local o tener una URL en la nube).
* Git.

### 2. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd bolsa-trabajo
npm install
```

*(Nota: Al ejecutar `npm install`, todas las librerías como shadcn, Prisma y Tailwind se instalarán automáticamente. No es necesario configurarlas de cero).*

### 3. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que el `package.json`).
Pega lo siguiente y reemplaza los valores con tus credenciales locales de PostgreSQL:

```env
# Ejemplo: postgresql://USUARIO:CONTRASEÑA@localhost:5432/NOMBRE_BD?schema=public
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/jobby_db?schema=public"
```

### 4. Configurar la Base de Datos (Prisma)
Ejecuta estos 3 comandos estrictamente en este orden para preparar la base de datos:

```bash
# 1. Genera el cliente de Prisma (Actualiza la conexión en node_modules)
npx prisma generate

# 2. Crea las tablas reales en tu base de datos PostgreSQL
npx prisma db push

# 3. Llena la base de datos con información de prueba (Usuarios, Estudiantes, etc.)
npx prisma db seed
```

*Si el seed fue exitoso, verás un mensaje verde en la consola.*

### 5. Iniciar el Servidor de Desarroll
```bash
npm run dev
```

---

## 📂 Estructura del Proyecto
* `/src/app` - Páginas y rutas principales de Next.js (`/login`, `/registro`).
* `/src/actions` - Server Actions (Lógica de backend, ej: `auth.ts`).
* `/src/components/ui` - Componentes reutilizables de shadcn (Botones, Inputs). ¡No los modifiques a menos que quieras cambiar el diseño global!
* `/src/lib` - Utilidades y configuración (ej. `prisma.ts`).
* `/prisma` - Esquema de la base de datos (`schema.prisma`) y script de datos iniciales (`seed.ts`).

---

## 💡 Notas Importantes para el Equipo
* **Cambios en la Base de Datos:** Si alguien del equipo modifica el archivo `schema.prisma`, debes hacer un `git pull` y luego ejecutar `npx prisma db push` y `npx prisma generate` en tu terminal para sincronizar tu entorno.

## Versión 1.0.0
