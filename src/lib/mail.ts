import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendPasswordResetEmail(to: string, resetLink: string) {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Sistem Portfolio'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: 'Reset Password Admin Portofolio',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981; text-align: center;">Reset Password</h2>
                <p>Halo,</p>
                <p>Kami menerima permintaan untuk mereset password akun admin Anda. Klik tombol di bawah ini untuk mengatur ulang password Anda:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                </div>
                <p>Atau Anda dapat menyalin tautan berikut ke browser Anda:</p>
                <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
                <br />
                <p style="font-size: 14px; color: #6b7280;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Tautan ini akan kedaluwarsa dalam 1 jam.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Sistem Portfolio. All rights reserved.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendDisable2FAEmail(to: string, confirmLink: string) {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Sistem Portfolio'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: 'Konfirmasi Penonaktifan Google Authenticator (2FA)',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ef4444; text-align: center;">Konfirmasi Penonaktifan 2FA</h2>
                <p>Halo,</p>
                <p>Kami menerima permintaan untuk menonaktifkan fitur Google Authenticator (2FA) di akun admin Anda. Klik tombol di bawah ini untuk mengonfirmasi:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Nonaktifkan 2FA</a>
                </div>
                <p>Atau Anda dapat menyalin tautan berikut ke browser Anda:</p>
                <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${confirmLink}</p>
                <br />
                <p style="font-size: 14px; color: #6b7280;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Akun Anda tetap aman dengan 2FA. Tautan ini kedaluwarsa dalam 15 menit.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Sistem Portfolio. All rights reserved.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}


export async function sendEnable2FAEmail(to: string, confirmLink: string) {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Sistem Portfolio'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: 'Aktivasi Google Authenticator (2FA)',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981; text-align: center;">Aktivasi Google Authenticator</h2>
                <p>Halo,</p>
                <p>Kami menerima permintaan untuk mengaktifkan fitur keamanan Google Authenticator (2FA) di akun admin Anda. Klik tombol di bawah ini untuk melanjutkan setup:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Lanjutkan Setup 2FA</a>
                </div>
                <p>Atau Anda dapat menyalin tautan berikut ke browser Anda:</p>
                <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${confirmLink}</p>
                <br />
                <p style="font-size: 14px; color: #6b7280;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Tautan ini kedaluwarsa dalam 15 menit.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Sistem Portfolio. All rights reserved.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendContactNotificationEmail(adminEmail: string, name: string, email: string, subject: string, message: string) {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Sistem Portfolio'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: adminEmail, // Kirim ke admin login email
        replyTo: email, // Jika admin mereply, akan masuk ke email pengirim
        subject: `Pesan Baru Portofolio: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Pesan Baru dari Form Kontak</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 100px; font-weight: bold; color: #4b5563;">Dari</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #111827;">${name} (<a href="mailto:${email}" style="color: #10b981;">${email}</a>)</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #4b5563;">Subjek</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #111827;">${subject}</td>
                    </tr>
                </table>
                
                <h3 style="margin-top: 25px; color: #4b5563; font-size: 16px;">Isi Pesan:</h3>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; color: #1f2937; white-space: pre-wrap; line-height: 1.5;">${message}</div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="mailto:${email}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Balas Pesan</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">Ini adalah pesan otomatis dari form website portofolio Anda.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}
