import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface MailOptions {
    to: string
    subject: string
    title: string
    message: string
    buttonText?: string
    buttonUrl?: string
    type?: "SUCCESS" | "WARNING" | "DANGER" | "INFO"
    subtitle?: string
    otpCode?: string
    extraFooterNote?: string
}

export async function sendEmail({
    to,
    subject,
    title,
    message,
    buttonText,
    buttonUrl,
    type = "INFO",
    subtitle,
    otpCode,
    extraFooterNote
}: MailOptions) {
    const colors = {
        SUCCESS: { bg: "#0d9488", text: "#ccfbf1", accent: "#0f766e" }, // Teal
        WARNING: { bg: "#d97706", text: "#fef3c7", accent: "#92400e" }, // Amber
        DANGER: { bg: "#dc2626", text: "#fee2e2", accent: "#991b1b" },  // Red
        INFO: { bg: "#4f46e5", text: "#e0e7ff", accent: "#3730a3" },    // Indigo/Violet
    }

    const color = colors[type] || colors.INFO
    const headerSubtitle = subtitle || "Bolsa de Trabajo UT Chetumal"

    try {
        const { data, error } = await resend.emails.send({
            from: "Joby <no-reply@jobychetumal.online>",
            to,
            subject,
            html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <!-- Main Card -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color:${color.bg}; padding:30px 0;">
                      <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:bold; letter-spacing:1px; font-style:italic;">Joby</h1>
                      <p style="color:${color.text}; margin:5px 0 0 0; font-size:14px; font-weight:500;">${headerSubtitle}</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px; text-align:center;">
                      <h2 style="color:#1f2937; font-size:24px; margin:0 0 20px; font-weight:bold;">${title}</h2>
                      <p style="color:#4b5563; font-size:16px; line-height:1.6; margin:0 0 30px; white-space: pre-line;">
                        ${message}
                      </p>

                      ${otpCode ? `
                        <!-- OTP Box -->
                        <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto; background-color:#f8fafc; border:2px dashed ${color.bg}; border-radius:12px;">
                          <tr>
                            <td align="center" style="padding: 20px 40px;">
                              <span style="font-size:38px; font-weight:900; color:${color.accent}; letter-spacing:10px;">${otpCode}</span>
                            </td>
                          </tr>
                        </table>
                      ` : ""}

                      ${buttonUrl && buttonText ? `
                        <div style="margin-top: 30px;">
                            <a href="${buttonUrl}" style="background-color:${color.bg}; color:#ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                ${buttonText}
                            </a>
                        </div>
                      ` : ""}

                      ${otpCode ? `
                        <p style="color:#64748b; font-size:14px; margin:20px 0 0 0;">
                          Este código es válido por <strong>15 minutos</strong>.
                        </p>
                      ` : ""}
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f8fafc; padding:20px 30px; text-align:center; border-top:1px solid #e2e8f0;">
                      <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
                        ${extraFooterNote ? `${extraFooterNote}<br/><br/>` : "Este es un correo transaccional generado automáticamente por Joby UTCH.<br/><br/>"}
                        &copy; ${new Date().getFullYear()} Joby. Plataforma Oficial UT Chetumal.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
            `,
        })

        if (error) {
            console.error("Resend Error:", error)
            return { success: false, error: error.message }
        }

        return { success: true, id: data?.id }
    } catch (err: any) {
        console.error("Mail Dispatch Error:", err)
        return { success: false, error: err.message }
    }
}

