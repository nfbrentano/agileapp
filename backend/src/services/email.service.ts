import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
    const resetUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"AgileManager" <noreply@agilemanager.com>',
        to: email,
        subject: 'Redefinição de Senha - AgileManager',
        html: `
      <h1>Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para prosseguir:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este link é válido por 1 hora.</p>
    `,
    });
};
