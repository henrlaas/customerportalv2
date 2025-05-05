
interface SendSMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

interface SMSPayload {
  receivers: string[];
  message: string;
}

export class KeySmsService {
  private apiUrl = 'https://api.keysms.no/v1/messages';
  private username = '47818998';
  private apiKey = 'bcf983b30d70bab6341c47853493f892';

  /**
   * Signs the payload using MD5 hash
   */
  private signPayload(payload: SMSPayload): string {
    // In a real implementation, you'd use a proper MD5 hashing function
    // For now, we'll just return a placeholder as browser MD5 requires additional libraries
    // This would need to be properly implemented in a production environment
    console.log('Signing payload:', payload);
    return '';  // This should be: md5(JSON.stringify(payload) + this.apiKey)
  }

  /**
   * Sends an SMS message via KeySMS API
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SendSMSResponse> {
    try {
      // Prepare the payload
      const payload: SMSPayload = {
        receivers: [phoneNumber],
        message: message
      };

      // Calculate signature
      const signature = this.signPayload(payload);
      
      // Prepare form data for the request
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      formData.append('signature', signature);
      formData.append('username', this.username);

      // Make the API call
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'SMS sent successfully',
          data
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to send SMS',
          data
        };
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
}

export const keySmsService = new KeySmsService();
