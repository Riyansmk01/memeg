import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, any>
}

export class EmailService {
  static async sendEmail(data: EmailData) {
    try {
      const msg = {
        to: data.to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@esawitku.com',
          name: 'eSawitKu',
        },
        subject: data.subject,
        html: data.html,
        text: data.text,
        templateId: data.templateId,
        dynamicTemplateData: data.dynamicTemplateData,
      }

      await sgMail.send(msg)
      
      return {
        success: true,
        messageId: 'sent',
      }
    } catch (error) {
      console.error('SendGrid email error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Selamat Datang di eSawitKu!</h1>
        <p>Halo ${userName},</p>
        <p>Terima kasih telah bergabung dengan eSawitKu. Akun Anda telah berhasil dibuat dan siap digunakan.</p>
        <p>Anda dapat mulai mengelola perkebunan kelapa sawit Anda dengan fitur-fitur berikut:</p>
        <ul>
          <li>📊 Dashboard analitik</li>
          <li>🌱 Manajemen kebun</li>
          <li>👥 Manajemen pekerja</li>
          <li>📈 Laporan panen</li>
        </ul>
        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
        <p>Salam,<br>Tim eSawitKu</p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: 'Selamat Datang di eSawitKu!',
      html,
    })
  }

  static async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Reset Password eSawitKu</h1>
        <p>Anda telah meminta untuk mereset password akun eSawitKu Anda.</p>
        <p>Klik tombol di bawah ini untuk mereset password:</p>
        <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <p>Salam,<br>Tim eSawitKu</p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: 'Reset Password eSawitKu',
      html,
    })
  }

  static async sendInvoiceEmail(userEmail: string, invoiceData: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Invoice eSawitKu</h1>
        <p>Terima kasih atas pembayaran Anda!</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detail Invoice</h3>
          <p><strong>No. Invoice:</strong> ${invoiceData.invoiceNumber}</p>
          <p><strong>Tanggal:</strong> ${invoiceData.date}</p>
          <p><strong>Paket:</strong> ${invoiceData.plan}</p>
          <p><strong>Jumlah:</strong> Rp ${invoiceData.amount.toLocaleString()}</p>
          <p><strong>Status:</strong> ${invoiceData.status}</p>
        </div>
        <p>Invoice ini dapat diunduh dari dashboard Anda.</p>
        <p>Salam,<br>Tim eSawitKu</p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: `Invoice eSawitKu - ${invoiceData.invoiceNumber}`,
      html,
    })
  }
}
