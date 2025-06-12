import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { sendTestEmailApi } from "@/pages/api/send-test-email";

export interface EmailSettingsRef {
  saveEmailSettings: () => Promise<boolean>;
}

interface EmailSettingsProps {
  userId: string;
}

const EmailSettings = forwardRef<EmailSettingsRef, EmailSettingsProps>(({ userId }, ref) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    resendApiKey: '',
    fromEmail: '',
    fromName: '',
    testEmail: ''
  });

  useEffect(() => {
    if (userId) {
      fetchEmailSettings();
    }
  }, [userId]);

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email settings:', error);
        return;
      }
      
      if (data) {
        setEmailSettings({
          enabled: data.enabled || false,
          resendApiKey: data.resend_api_key || '',
          fromEmail: data.from_email || '',
          fromName: data.from_name || '',
          testEmail: ''
        });
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setEmailSettings(prev => ({ ...prev, enabled: checked }));
  };

  const saveEmailSettings = async (): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validate required fields if enabled
      if (emailSettings.enabled) {
        if (!emailSettings.resendApiKey) {
          toast({
            title: "Error",
            description: "Resend API key is required when email is enabled.",
            variant: "destructive",
          });
          return false;
        }
        
        if (!emailSettings.fromEmail) {
          toast({
            title: "Error",
            description: "From email address is required when email is enabled.",
            variant: "destructive",
          });
          return false;
        }
      }
      
      const { error } = await supabase
        .from('email_settings')
        .upsert({
          user_id: userId,
          enabled: emailSettings.enabled,
          resend_api_key: emailSettings.resendApiKey,
          from_email: emailSettings.fromEmail,
          from_name: emailSettings.fromName,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error saving email settings:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!emailSettings.testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address.",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    
    try {
      // Call the function to send test email
      const result = await sendTestEmailApi(
        emailSettings.resendApiKey,
        emailSettings.fromEmail,
        emailSettings.fromName,
        emailSettings.testEmail
      );
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send test email');
      }
      
      toast({
        title: "Test email sent",
        description: "Check your inbox to confirm the email was received.",
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test email. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    saveEmailSettings,
  }));

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Enable email notifications for appointments, invoices, and more.
            </p>
          </div>
          <Switch
            checked={emailSettings.enabled}
            onCheckedChange={handleToggleChange}
          />
        </div>
        
        {emailSettings.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="resendApiKey">Resend API Key</Label>
              <Input
                id="resendApiKey"
                name="resendApiKey"
                type="password"
                placeholder="Enter your Resend API key"
                value={emailSettings.resendApiKey}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Dashboard</a>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  name="fromEmail"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={emailSettings.fromEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name (Optional)</Label>
                <Input
                  id="fromName"
                  name="fromName"
                  placeholder="Your Clinic Name"
                  value={emailSettings.fromName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Test Your Configuration</h3>
              <div className="flex space-x-2">
                <Input
                  id="testEmail"
                  name="testEmail"
                  type="email"
                  placeholder="Enter email to test"
                  value={emailSettings.testEmail}
                  onChange={handleChange}
                  className="max-w-xs"
                />
                <Button 
                  type="button" 
                  onClick={sendTestEmail}
                  disabled={testLoading}
                  variant="outline"
                >
                  {testLoading ? "Sending..." : "Send Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Send a test email to verify your configuration works correctly.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

EmailSettings.displayName = 'EmailSettings';

export default EmailSettings; 