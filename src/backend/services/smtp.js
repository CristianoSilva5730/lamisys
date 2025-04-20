
const nodemailer = require('nodemailer');
const db = require('../database');

class SMTPService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const config = db.getSMTPConfig();
    if (!config) return;

    this.transporter = nodemailer.createTransport({
      host: config.server,
      port: config.port,
      secure: config.port === 465,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(options) {
    if (!this.transporter) {
      this.initializeTransporter();
    }

    if (!this.transporter) {
      throw new Error('SMTP não configurado');
    }

    const config = db.getSMTPConfig();
    const mailOptions = {
      from: config.fromEmail,
      ...options
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to, tempPassword) {
    return this.sendEmail({
      to,
      subject: 'Recuperação de Senha - LamiSys',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Recuperação de Senha - LamiSys</h2>
          <p>Sua senha temporária é: <strong>${tempPassword}</strong></p>
          <p>Por favor, altere esta senha no seu próximo acesso.</p>
        </div>
      `
    });
  }

  async sendAlarmNotification(to, alarmData) {
    return this.sendEmail({
      to,
      subject: `Alarme: ${alarmData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Notificação de Alarme - LamiSys</h2>
          <p>O alarme "${alarmData.name}" foi acionado.</p>
          <p>Detalhes: ${alarmData.details || 'Não especificado'}</p>
        </div>
      `
    });
  }
}

module.exports = new SMTPService();
