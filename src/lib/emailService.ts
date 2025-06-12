import { Resend } from 'resend';
import { supabase } from './supabase';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Get email settings for a specific user
 */
export const getEmailSettings = async (userId: string) => {
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
 * Send an email using Resend
 */
export const sendEmail = async (userId: string, options: EmailOptions) => {
  try {
    // Get user's email settings
    const settings = await getEmailSettings(userId);
    
    if (!settings || !settings.enabled || !settings.resend_api_key) {
      throw new Error('Email settings not configured or disabled');
    }
    
    // Initialize Resend with the user's API key
    const resend = new Resend(settings.resend_api_key);
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: settings.from_name 
        ? `${settings.from_name} <${settings.from_email}>` 
        : settings.from_email,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

/**
 * Send a test email
 */
export const sendTestEmail = async (
  apiKey: string, 
  fromEmail: string, 
  fromName: string | undefined, 
  toEmail: string
) => {
  try {
    // Initialize Resend with the provided API key
    const resend = new Resend(apiKey);
    
    // Format the from field
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
    
    // Send the test email
    const { data, error } = await resend.emails.send({
      from,
      to: toEmail,
      subject: 'Test Email from ClinicFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">ClinicFlow Email Test</h2>
          <p>This is a test email from ClinicFlow to verify your email configuration.</p>
          <p>If you received this email, your Resend integration is working correctly!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from ClinicFlow. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: 'ClinicFlow Email Test\n\nThis is a test email from ClinicFlow to verify your email configuration.\n\nIf you received this email, your Resend integration is working correctly!',
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error };
  }
};

/**
 * Utility function to create email templates
 */
export const createEmailTemplate = (options: {
  title: string;
  content: string;
  clinicName?: string;
  footerText?: string;
}) => {
  const { title, content, clinicName, footerText } = options;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">${title}</h2>
      ${content}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ${footerText || `This is an automated message from ${clinicName || 'ClinicFlow'}. Please do not reply to this email.`}
        </p>
      </div>
    </div>
  `;
}; 