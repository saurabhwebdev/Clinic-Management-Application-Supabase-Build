import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// Define interfaces for type safety
interface Region {
  id: string;
  name: string;
  country: string;
  city: string | null;
  currency_code: string;
  currency_symbol: string;
}

interface RegionalData {
  // Common fields
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  swift_code?: string;
  tax_id?: string;
  
  // India specific
  upi_id?: string;
  upi_qr_code?: string;
  gst_number?: string;
  
  // US specific
  routing_number?: string;
  ein?: string;
  
  // UK specific
  sort_code?: string;
  vat_number?: string;
  
  // EU specific
  iban?: string;
  bic?: string;
}

interface RegionalSettingsProps {
  userId: string;
  regionId: string;
  region: Region | null;
}

// Define the ref type
export interface RegionalSettingsRef {
  saveRegionalData: () => Promise<boolean>;
}

const RegionalSettings = forwardRef<RegionalSettingsRef, RegionalSettingsProps>(
  ({ userId, regionId, region }, ref) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [regionalData, setRegionalData] = useState<RegionalData>({});

    // Expose the saveRegionalData method to parent components
    useImperativeHandle(ref, () => ({
      saveRegionalData: async () => {
        return await saveRegionalData();
      }
    }));

    // Fetch regional data when component mounts or region changes
    useEffect(() => {
      if (userId && regionId) {
        fetchRegionalData();
      }
    }, [userId, regionId]);

    const fetchRegionalData = async () => {
      try {
        const { data, error } = await supabase
          .from('regional_settings')
          .select('*')
          .eq('user_id', userId)
          .eq('region_id', regionId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching regional data:', error);
          return;
        }
        
        if (data) {
          setRegionalData(data);
        } else {
          // Reset form if no data found
          setRegionalData({});
        }
      } catch (error) {
        console.error('Error fetching regional data:', error);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setRegionalData(prev => ({ ...prev, [name]: value }));
    };

    const handleQRCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Check file size (limit to 500KB)
        if (file.size > 500 * 1024) {
          toast({
            title: "File too large",
            description: "QR code image must be less than 500KB",
            variant: "destructive",
          });
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const result = reader.result as string;
            
            // Validate the data URL format
            if (!result.startsWith('data:image/')) {
              throw new Error('Invalid image format');
            }
            
            setRegionalData(prev => ({ ...prev, upi_qr_code: result }));
            
            toast({
              title: "QR code uploaded",
              description: "Don't forget to save your changes",
            });
          } catch (error) {
            console.error("Error processing QR code:", error);
            toast({
              title: "Error",
              description: "Failed to process QR code image. Please try another image.",
              variant: "destructive",
            });
          }
        };
        
        reader.onerror = () => {
          toast({
            title: "Error",
            description: "Failed to read the image file. Please try again.",
            variant: "destructive",
          });
        };
        
        reader.readAsDataURL(file);
      }
    };

    const clearQRCode = () => {
      setRegionalData(prev => ({ ...prev, upi_qr_code: "" }));
    };

    const saveRegionalData = async () => {
      setLoading(true);
      
      try {
        // First check if a record exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from('regional_settings')
          .select('id')
          .eq('user_id', userId)
          .eq('region_id', regionId)
          .single();
        
        let error;
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          // Real error, not just "no rows returned"
          throw fetchError;
        }
        
        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('regional_settings')
            .update({
              ...regionalData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRecord.id);
            
          error = updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('regional_settings')
            .insert({
              user_id: userId,
              region_id: regionId,
              ...regionalData,
              updated_at: new Date().toISOString(),
            });
            
          error = insertError;
        }
        
        if (error) throw error;
        
        toast({
          title: "Financial settings updated",
          description: "Your regional financial information has been saved successfully.",
        });
        
        return true;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update financial settings. Please try again.",
          variant: "destructive",
        });
        console.error("Error updating regional settings:", error);
        return false;
      } finally {
        setLoading(false);
      }
    };

    // Render fields based on country
    const renderCountrySpecificFields = () => {
      if (!region) return null;

      switch (region.country) {
        case 'India':
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  placeholder="Enter bank name"
                  value={regionalData.bank_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    placeholder="Enter account number"
                    value={regionalData.account_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc_code">IFSC Code</Label>
                  <Input
                    id="ifsc_code"
                    name="ifsc_code"
                    placeholder="Enter IFSC code"
                    value={regionalData.ifsc_code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upi_id">UPI ID</Label>
                  <Input
                    id="upi_id"
                    name="upi_id"
                    placeholder="Enter UPI ID"
                    value={regionalData.upi_id || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    name="gst_number"
                    placeholder="Enter GST number"
                    value={regionalData.gst_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upi_qr_code">UPI QR Code</Label>
                <div className="border rounded-md p-4">
                  <div className="mb-4">
                    {regionalData.upi_qr_code ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={regionalData.upi_qr_code} 
                          alt="UPI QR Code" 
                          className="max-h-32 border rounded-md p-2 mb-2"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={clearQRCode}
                          size="sm"
                        >
                          Clear QR Code
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-4 border border-dashed rounded-md">
                        <p className="text-muted-foreground mb-2">No QR code added yet</p>
                        <Input
                          id="qrCodeUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleQRCodeUpload}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload a small image file (max 500KB). PNG or JPEG recommended.
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your UPI QR code. This will appear on invoices for easy payments.
                  </p>
                </div>
              </div>
            </>
          );
        
        case 'United States':
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  placeholder="Enter bank name"
                  value={regionalData.bank_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    placeholder="Enter account number"
                    value={regionalData.account_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routing_number">Routing Number</Label>
                  <Input
                    id="routing_number"
                    name="routing_number"
                    placeholder="Enter routing number"
                    value={regionalData.routing_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ein">EIN (Tax ID)</Label>
                <Input
                  id="ein"
                  name="ein"
                  placeholder="Enter EIN"
                  value={regionalData.ein || ""}
                  onChange={handleInputChange}
                />
              </div>
            </>
          );
        
        case 'United Kingdom':
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  placeholder="Enter bank name"
                  value={regionalData.bank_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    placeholder="Enter account number"
                    value={regionalData.account_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_code">Sort Code</Label>
                  <Input
                    id="sort_code"
                    name="sort_code"
                    placeholder="Enter sort code"
                    value={regionalData.sort_code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  placeholder="Enter VAT number"
                  value={regionalData.vat_number || ""}
                  onChange={handleInputChange}
                />
              </div>
            </>
          );
        
        // For EU countries
        case 'Germany':
        case 'France':
        case 'Spain':
        case 'Italy':
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  placeholder="Enter bank name"
                  value={regionalData.bank_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  placeholder="Enter IBAN"
                  value={regionalData.iban || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bic">BIC/SWIFT Code</Label>
                <Input
                  id="bic"
                  name="bic"
                  placeholder="Enter BIC/SWIFT code"
                  value={regionalData.bic || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  placeholder="Enter VAT number"
                  value={regionalData.vat_number || ""}
                  onChange={handleInputChange}
                />
              </div>
            </>
          );
        
        // Default fields for other countries
        default:
          return (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  placeholder="Enter bank name"
                  value={regionalData.bank_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    placeholder="Enter account number"
                    value={regionalData.account_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swift_code">SWIFT Code</Label>
                  <Input
                    id="swift_code"
                    name="swift_code"
                    placeholder="Enter SWIFT code"
                    value={regionalData.swift_code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  placeholder="Enter tax ID"
                  value={regionalData.tax_id || ""}
                  onChange={handleInputChange}
                />
              </div>
            </>
          );
      }
    };

    if (!region) {
      return (
        <div className="text-center p-4">
          <p>Please select a region to configure financial settings.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Financial Settings for {region.name}</h3>
          <p className="text-sm text-muted-foreground">
            Configure your financial information for {region.country}. This information will be used on invoices and other financial documents.
          </p>
        </div>
        
        {renderCountrySpecificFields()}
      </div>
    );
  }
);

RegionalSettings.displayName = 'RegionalSettings';

export default RegionalSettings;
export { type RegionalData }; 