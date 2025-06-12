import { sendTestEmail } from '@/lib/emailService';

// This is a client-side function that will be called from the EmailSettings component
export async function sendTestEmailApi(
  apiKey: string,
  fromEmail: string,
  fromName: string | undefined,
  toEmail: string
) {
  try {
    // Validate required fields
    if (!apiKey || !fromEmail || !toEmail) {
      return { 
        success: false,
        message: 'Missing required fields: apiKey, fromEmail, and toEmail are required'
      };
    }

    // Send test email directly using the emailService
    const result = await sendTestEmail(apiKey, fromEmail, fromName, toEmail);

    if (result.success) {
      return { 
        success: true,
        message: 'Test email sent successfully',
        data: result.data
      };
    } else {
      return { 
        success: false,
        message: 'Failed to send test email',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return { 
      success: false,
      message: 'Internal error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 