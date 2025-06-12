import emailjs from '@emailjs/browser';
import { supabase } from './supabase';

interface EmailSettings {
  enabled: boolean;
  service_id: string;
  template_id: string;
  public_key: string;
  from_email: string;
  from_name: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  message: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Get email settings for a specific user
 */
export const getEmailSettings = async (userId: string): Promise<EmailSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
};

/**
 * Send an email using EmailJS
 */
export const sendEmail = async (userId: string, options: EmailOptions) => {
  try {
    // Get user's email settings
    const settings = await getEmailSettings(userId);
    
    if (!settings || !settings.enabled || !settings.service_id || !settings.template_id || !settings.public_key) {
      throw new Error('Email settings not configured or disabled');
    }
    
    // Initialize EmailJS with the user's public key
    emailjs.init(settings.public_key);
    
    // Format recipients if array
    const toEmails = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const ccEmails = options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : '';
    const bccEmails = options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : '';
    
    // Prepare template parameters
    const templateParams = {
      to_email: toEmails,
      to_name: '',
      from_name: settings.from_name || 'ClinicFlow',
      from_email: settings.from_email,
      subject: options.subject,
      message: options.message,
      cc: ccEmails,
      bcc: bccEmails,
      reply_to: options.replyTo || settings.from_email
    };
    
    // Send the email
    const response = await emailjs.send(
      settings.service_id,
      settings.template_id,
      templateParams
    );
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

/**
 * Send a test email
 */
export const sendTestEmail = async (
  serviceId: string, 
  templateId: string,
  publicKey: string,
  fromEmail: string, 
  fromName: string | undefined, 
  toEmail: string
) => {
  try {
    // Initialize EmailJS with the provided public key
    emailjs.init(publicKey);
    
    // Prepare template parameters
    const templateParams = {
      to_email: toEmail,
      to_name: 'Test Recipient',
      from_name: fromName || 'ClinicFlow',
      from_email: fromEmail,
      subject: 'Test Email from ClinicFlow',
      message: 'This is a test email from ClinicFlow to verify your email configuration. If you received this email, your EmailJS integration is working correctly!',
      reply_to: fromEmail
    };
    
    // Send the test email
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error };
  }
};

/**
 * Utility function to create email content
 */
export const createEmailContent = (options: {
  title: string;
  content: string;
  clinicName?: string;
  footerText?: string;
}): string => {
  const { title, content, clinicName, footerText } = options;
  
  return `
    <h2>${title}</h2>
    ${content}
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      ${footerText || `This is an automated message from ${clinicName || 'ClinicFlow'}. Please do not reply to this email.`}
    </p>
  `;
}; 