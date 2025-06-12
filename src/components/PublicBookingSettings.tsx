import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

interface PublicBookingSettingsProps {
  userId: string;
  clinicId: string;
  clinicName: string;
}

export interface PublicBookingSettingsRef {
  savePublicBookingSettings: () => Promise<boolean>;
}

const PublicBookingSettings = forwardRef<PublicBookingSettingsRef, PublicBookingSettingsProps>(
  ({ userId, clinicId, clinicName }, ref) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [publicBookingEnabled, setPublicBookingEnabled] = useState(false);
    const [bookingSlug, setBookingSlug] = useState('');
    const [originalSlug, setOriginalSlug] = useState('');
    const [slugAvailable, setSlugAvailable] = useState(true);
    const [copied, setCopied] = useState(false);
    const [checkingSlug, setCheckingSlug] = useState(false);

    // Base URL for public booking page
    const baseUrl = window.location.origin;
    const publicBookingUrl = `${baseUrl}/book/${bookingSlug}`;

    // Expose the save method to parent components
    useImperativeHandle(ref, () => ({
      savePublicBookingSettings: async () => {
        return await saveSettings();
      }
    }));

    // Fetch settings when component mounts
    useEffect(() => {
      if (userId && clinicId && clinicId.trim() !== '') {
        fetchSettings();
      }
    }, [userId, clinicId]);

    // Generate a slug based on clinic name if none exists
    useEffect(() => {
      if (!bookingSlug && clinicName && !loading) {
        const generatedSlug = clinicName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        setBookingSlug(generatedSlug);
        checkSlugAvailability(generatedSlug);
      }
    }, [clinicName, loading]);

    // Check slug availability when it changes
    useEffect(() => {
      if (bookingSlug && bookingSlug !== originalSlug) {
        const timer = setTimeout(() => {
          checkSlugAvailability(bookingSlug);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [bookingSlug]);

    const fetchSettings = async () => {
      if (!clinicId || clinicId.trim() === '') {
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('public_booking_settings')
          .select('*')
          .eq('clinic_id', clinicId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching public booking settings:', error);
          return;
        }
        
        if (data) {
          setPublicBookingEnabled(data.enabled);
          setBookingSlug(data.booking_slug);
          setOriginalSlug(data.booking_slug);
        } else {
          // Default settings if none exist
          setPublicBookingEnabled(false);
          // Slug will be generated from clinic name in useEffect
        }
      } catch (error) {
        console.error('Error fetching public booking settings:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkSlugAvailability = async (slug: string) => {
      if (!slug || !clinicId) return;
      
      try {
        setCheckingSlug(true);
        
        // Check if slug is already in use by another clinic
        let query = supabase
          .from('public_booking_settings')
          .select('clinic_id')
          .eq('booking_slug', slug);
        
        // Only add the neq filter if we have a valid clinicId
        if (clinicId) {
          query = query.neq('clinic_id', clinicId); // Exclude current clinic
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error checking slug availability:', error);
          return;
        }
        
        setSlugAvailable(data.length === 0);
      } catch (error) {
        console.error('Error checking slug availability:', error);
      } finally {
        setCheckingSlug(false);
      }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow lowercase letters, numbers, and hyphens
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');
      
      setBookingSlug(slug);
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(publicBookingUrl);
      setCopied(true);
      
      toast({
        title: "Copied!",
        description: "Booking link copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    };

    const saveSettings = async () => {
      if (!clinicId || clinicId.trim() === '') {
        toast({
          title: "Error",
          description: "Clinic ID is missing. Please set up your clinic information first.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!slugAvailable && bookingSlug !== originalSlug) {
        toast({
          title: "Error",
          description: "The booking URL is already in use. Please choose another one.",
          variant: "destructive",
        });
        return false;
      }
      
      setLoading(true);
      
      try {
        // First check if a record exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from('public_booking_settings')
          .select('id')
          .eq('clinic_id', clinicId)
          .single();
        
        let error;
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          // Real error, not just "no rows returned"
          throw fetchError;
        }
        
        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('public_booking_settings')
            .update({
              enabled: publicBookingEnabled,
              booking_slug: bookingSlug,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRecord.id);
            
          error = updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('public_booking_settings')
            .insert({
              clinic_id: clinicId,
              user_id: userId,
              enabled: publicBookingEnabled,
              booking_slug: bookingSlug,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
          error = insertError;
        }
        
        if (error) throw error;
        
        // Update original slug to match current slug
        setOriginalSlug(bookingSlug);
        
        return true;
      } catch (error) {
        console.error('Error saving public booking settings:', error);
        toast({
          title: "Error",
          description: "Failed to save public booking settings. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="public-booking">Enable Public Booking</Label>
            <p className="text-sm text-muted-foreground">
              Allow patients to book appointments without logging in
            </p>
          </div>
          <Switch
            id="public-booking"
            checked={publicBookingEnabled}
            onCheckedChange={setPublicBookingEnabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="booking-slug">Booking URL</Label>
          <div className="flex gap-2">
            <Input
              id="booking-slug"
              value={bookingSlug}
              onChange={handleSlugChange}
              placeholder="your-clinic-name"
              disabled={loading || checkingSlug}
              className={!slugAvailable && bookingSlug !== originalSlug ? "border-red-500" : ""}
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={copyToClipboard}
              disabled={!publicBookingEnabled || !bookingSlug}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {!slugAvailable && bookingSlug !== originalSlug && (
            <p className="text-sm text-red-500">
              This URL is already in use. Please choose another one.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Your public booking page: {publicBookingEnabled ? (
              <a href={publicBookingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {publicBookingUrl}
              </a>
            ) : (
              <span className="opacity-50">{publicBookingUrl}</span>
            )}
          </p>
        </div>
        
        {publicBookingEnabled && (
          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium mb-2">How it works</h4>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Patients can book appointments without creating an account</li>
              <li>New bookings will appear in your dashboard as "pending"</li>
              <li>You'll need to confirm bookings and link them to patient records</li>
              <li>New patients will be added to your database when you confirm their booking</li>
            </ul>
          </Card>
        )}
      </div>
    );
  }
);

PublicBookingSettings.displayName = "PublicBookingSettings";

export default PublicBookingSettings; 