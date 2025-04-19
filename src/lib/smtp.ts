
/**
 * Simulação do serviço SMTP
 * Em um aplicativo real, este código estaria no backend
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

interface SMTPSettings {
  server: string;
  port: number;
  from: string;
}

// Configurações padrão
let smtpSettings: SMTPSettings = {
  server: "10.6.250.1",
  port: 25,
  from: "LamiSys@sinobras.com.br"
};

export function getSmtpSettings(): SMTPSettings {
  return { ...smtpSettings };
}

export function updateSmtpSettings(settings: Partial<SMTPSettings>): void {
  smtpSettings = { ...smtpSettings, ...settings };
  // Em um app real, salvaria no banco de dados
  localStorage.setItem('lamisys-smtp', JSON.stringify(smtpSettings));
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Simulação - em um app real, este código estaria no backend
  console.log(`Enviando email via ${smtpSettings.server}:${smtpSettings.port}`);
  console.log(`De: ${smtpSettings.from}`);
  console.log(`Para: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
  console.log(`Assunto: ${options.subject}`);
  console.log(`Conteúdo: ${options.html}`);
  
  // Simular um atraso de 1 segundo
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular sucesso na maioria das vezes
  const success = Math.random() > 0.1;
  
  if (!success) {
    throw new Error("Falha ao enviar email. Verifique as configurações SMTP.");
  }
  
  return true;
}

// Carregar configurações do localStorage
export function loadSavedSmtpSettings(): void {
  const savedSettings = localStorage.getItem('lamisys-smtp');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      smtpSettings = { ...smtpSettings, ...parsed };
    } catch (error) {
      console.error("Erro ao carregar configurações SMTP:", error);
    }
  }
}

// Enviar email de recuperação de senha
export async function sendPasswordResetEmail(email: string, tempPassword: string): Promise<boolean> {
  const options: EmailOptions = {
    to: email,
    subject: "LamiSys - Recuperação de Senha",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #1E40AF;">LamiSys - Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Sua senha temporária é: <strong>${tempPassword}</strong></p>
        <p>Por motivos de segurança, você será solicitado a alterar esta senha temporária no primeiro acesso.</p>
        <p>Se você não solicitou esta recuperação de senha, por favor ignore este email.</p>
        <p>Atenciosamente,<br>Equipe LamiSys</p>
      </div>
    `
  };
  
  return sendEmail(options);
}

// Enviar email de alarme
export async function sendAlarmEmail(emails: string[], material: any): Promise<boolean> {
  const options: EmailOptions = {
    to: emails,
    subject: `LamiSys - Alarme: ${material.tipoMaterial} - ${material.notaFiscal}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #EF4444;">LamiSys - Alarme Acionado</h2>
        <p>Foi detectado um material que atende aos critérios de alarme:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Campo</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Valor</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Nota Fiscal</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${material.notaFiscal}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Material</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${material.tipoMaterial}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Empresa</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${material.empresa}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Status</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${material.status}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Data de Envio</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${material.dataEnvio}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Para mais detalhes, acesse o sistema LamiSys.</p>
        <p>Atenciosamente,<br>Sistema LamiSys</p>
      </div>
    `
  };
  
  return sendEmail(options);
}
