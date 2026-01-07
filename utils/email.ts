
export interface SentMail {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  type: 'leave' | 'attendance' | 'system' | 'performance';
}

class EmailService {
  private history: SentMail[] = [];

  sendEmail(to: string, subject: string, body: string, type: SentMail['type']): SentMail {
    const newMail: SentMail = {
      id: Math.random().toString(36).substr(2, 9),
      to,
      subject,
      body,
      timestamp: new Date().toLocaleTimeString(),
      type
    };

    this.history = [newMail, ...this.history].slice(0, 50);
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    return newMail;
  }

  getHistory() {
    return this.history;
  }
}

export const emailService = new EmailService();
