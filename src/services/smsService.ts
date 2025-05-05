
/**
 * Service for interacting with the Sveve SMS API
 */
export interface SmsResponse {
  response: {
    msgOkCount: number;
    stdSMSCount: number;
    ids: number[];
    fatalError?: string;
    errors?: {
      number: string;
      message: string;
    }[];
  };
}

export interface SmsCreditsResponse {
  response: {
    sms_count: number;
  };
}

export const smsService = {
  // Configuration
  apiUrl: 'https://sveve.no/SMS/SendMessage',
  creditsUrl: 'https://sveve.no/SMS/AccountAdm',
  username: 'box',
  password: '4bbc3a48af044f74',

  // Send SMS
  sendSMS: async (
    to: string,
    message: string,
    from: string = 'Workspace'
  ): Promise<SmsResponse> => {
    try {
      const params = new URLSearchParams({
        user: smsService.username,
        passwd: smsService.password,
        to,
        msg: message,
        from,
        f: 'json',
      });

      const response = await fetch(`${smsService.apiUrl}?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data as SmsResponse;
    } catch (error: any) {
      console.error('Error sending SMS:', error.message);
      throw error;
    }
  },

  // Get remaining SMS credits
  getSmsCredits: async (): Promise<number> => {
    try {
      const params = new URLSearchParams({
        cmd: 'sms_count',
        user: smsService.username,
        passwd: smsService.password,
      });

      const response = await fetch(`${smsService.creditsUrl}?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json() as SmsCreditsResponse;
      return data.response.sms_count;
    } catch (error: any) {
      console.error('Error fetching SMS credits:', error.message);
      throw error;
    }
  },
};
