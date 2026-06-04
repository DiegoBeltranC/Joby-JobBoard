"use server"

import { prisma } from "@/lib/prisma"
import { generateSecureToken, hashToken } from "@/lib/utils/crypto"
import { sendEmail } from "@/lib/mail"
import bcrypt from "bcryptjs"

const TOKEN_EXPIRY_MINUTES = 15;
const RATE_LIMIT_MINUTES = 2; // Minutos a esperar para solicitar otro correo

/**
 * Solicita el restablecimiento de la contraseña para un correo dado.
 */
export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Por favor introduce un correo válido." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Buscar si el usuario existe incluyendo sus perfiles para personalizar el email
    const user = await prisma.user.findUnique({
      where: { correo: normalizedEmail },
      include: {
        estudiante: true,
        empresa: true,
        admin: true
      }
    });

    // Mitigación: evitamos enumeración de correos.
    // Si no existe, simulamos tiempo de cómputo para mitigar ataques de timing y retornamos éxito genérico.
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { success: true, message: "Si el correo está registrado, recibirás un enlace de recuperación." };
    }

    // Verificar si ya existe una solicitud reciente de recuperación
    const existingRequest = await prisma.passwordResetToken.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingRequest) {
      const msPassed = Date.now() - existingRequest.createdAt.getTime();
      const minutesPassed = msPassed / (1000 * 60);

      if (minutesPassed < RATE_LIMIT_MINUTES) {
        return { 
          error: `Has solicitado un enlace recientemente. Por favor espera ${Math.ceil(RATE_LIMIT_MINUTES - minutesPassed)} minuto(s) antes de intentar de nuevo.` 
        };
      }
    }

    // Generar token y hash
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Guardar en la base de datos (Upsert)
    await prisma.passwordResetToken.upsert({
      where: { email: normalizedEmail },
      update: {
        tokenHash,
        expiresAt,
        createdAt: new Date()
      },
      create: {
        email: normalizedEmail,
        tokenHash,
        expiresAt
      }
    });

    // Construir enlace de recuperación
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/recuperar-contrasena/confirmar?token=${rawToken}`;

    // Configurar correo adaptado al rol del usuario
    let nombre = "";
    let mailType: "SUCCESS" | "INFO" = "SUCCESS"; // SUCCESS = Teal (Estudiantes/Admin), INFO = Indigo (Empresas)
    let mailSubject = "Recupera tu contraseña - Joby";
    let mailTitle = "Restablece tu contraseña";
    let mailMessage = "";

    if (user.rol === "EMPRESA") {
      nombre = user.empresa?.nombre || "";
      mailType = "INFO";
      mailSubject = "Recuperación de contraseña empresarial - Joby";
      mailTitle = "Acceso Empresarial";
      mailMessage = `Estimado(a) ${nombre || "Reclutador"},\n\nDetectamos una solicitud para restablecer la contraseña de tu cuenta de empresa en Joby.\n\nPara continuar y establecer una nueva contraseña de acceso, haz clic en el botón de abajo. Este enlace es válido por ${TOKEN_EXPIRY_MINUTES} minutos y solo puede ser usado una vez.`;
    } else if (user.rol === "ESTUDIANTE") {
      nombre = user.estudiante?.nombre || "";
      mailType = "SUCCESS";
      mailSubject = "Recupera tu contraseña - Joby";
      mailTitle = "Restablece tu contraseña";
      mailMessage = `Hola ${nombre || "Estudiante"},\n\nRecibimos una solicitud para restablecer la contraseña de tu cuenta institucional en Joby.\n\nPara continuar con el restablecimiento, haz clic en el botón de abajo. Este enlace es válido por ${TOKEN_EXPIRY_MINUTES} minutos y solo puede ser usado una vez.`;
    } else {
      nombre = user.admin?.nombre || "";
      mailType = "SUCCESS";
      mailSubject = "Recuperación de contraseña administrativa - Joby";
      mailTitle = "Restablecer contraseña de administrador";
      mailMessage = `Hola ${nombre || "Administrador"},\n\nSe ha solicitado un restablecimiento de contraseña para tu cuenta de administrador de Joby.\n\nPara continuar, haz clic en el botón de abajo. Este enlace es válido por ${TOKEN_EXPIRY_MINUTES} minutos.`;
    }

    // Enviar el correo usando Resend con la personalización de diseño y color correspondiente
    const mailResponse = await sendEmail({
      to: normalizedEmail,
      subject: mailSubject,
      title: mailTitle,
      message: mailMessage,
      buttonText: "Restablecer Contraseña",
      buttonUrl: resetUrl,
      type: mailType
    });

    if (!mailResponse.success) {
      console.error("Error al enviar email de recuperación:", mailResponse.error);
      return { error: "Hubo un problema al enviar el correo. Por favor, intenta más tarde." };
    }

    return { success: true, message: "Si el correo está registrado, recibirás un enlace de recuperación." };
  } catch (error) {
    console.error("Error en requestPasswordResetAction:", error);
    return { error: "Ocurrió un error en el servidor. Intenta de nuevo más tarde." };
  }
}

/**
 * Procesa el cambio de contraseña utilizando un token válido.
 */
export async function resetPasswordAction(token: string, passwordNueva: string) {
  if (!token) return { error: "Token inválido o ausente." };
  if (!passwordNueva || passwordNueva.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const hashedQueryToken = hashToken(token);

    // Buscar el token en la BD
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashedQueryToken }
    });

    if (!resetRecord) {
      return { error: "El enlace es inválido o ya ha sido utilizado." };
    }

    // Validar vigencia
    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }).catch(() => {});
      return { error: "El enlace ha expirado. Por favor, solicita uno nuevo." };
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(passwordNueva, salt);

    // Transacción atómica: Actualizar contraseña del usuario y eliminar el token usado
    await prisma.$transaction([
      prisma.user.update({
        where: { correo: resetRecord.email },
        data: { password_hash: newPasswordHash }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetRecord.id }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error en resetPasswordAction:", error);
    return { error: "Error al actualizar la contraseña. Por favor, intenta de nuevo." };
  }
}
