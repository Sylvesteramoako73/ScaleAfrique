import { logger } from '../../config/logger';

interface SMSPayload {
  to: string | string[];
  message: string;
  from?: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  cost?: string;
  error?: string;
}

export const smsService = {
  async send(payload: SMSPayload): Promise<SMSResult> {
    const apiKey = process.env.AFRICAS_TALKING_API_KEY;
    const username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';

    if (!apiKey) {
      logger.warn('SMS: No AFRICAS_TALKING_API_KEY set — using sandbox simulation');
      const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
      logger.info(`SMS simulation: [${recipients.join(', ')}] — "${payload.message.slice(0, 50)}..."`);
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    try {
      const recipients = Array.isArray(payload.to) ? payload.to.join(',') : payload.to;
      const body = new URLSearchParams({
        username,
        to: recipients,
        message: payload.message,
        ...(payload.from ? { from: payload.from } : {}),
      });

      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`AT API error: ${response.status}`);
      }

      const result = await response.json() as { SMSMessageData?: { Recipients?: Array<{ messageId: string; cost: string; status: string }> } };
      const recipient = result.SMSMessageData?.Recipients?.[0];

      return {
        success: recipient?.status === 'Success',
        messageId: recipient?.messageId,
        cost: recipient?.cost,
      };
    } catch (error) {
      logger.error('SMS send failed', { error });
      return { success: false, error: String(error) };
    }
  },

  async sendBulk(numbers: string[], message: string): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      numbers.map(n => this.send({ to: n, message }))
    );
    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    return { sent, failed: numbers.length - sent };
  },
};
