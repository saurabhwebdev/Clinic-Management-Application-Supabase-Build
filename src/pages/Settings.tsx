import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/SettingsContext";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RegionalSettings, { RegionalSettingsRef } from "@/components/RegionalSettings";
import PublicBookingSettings, { PublicBookingSettingsRef } from "@/components/PublicBookingSettings";
import EmailSettings, { EmailSettingsRef } from "@/components/EmailSettings";

// Define interfaces for type safety
interface Region {
  id: string;
  name: string;
  country: string;
  city: string | null;
  currency_code: string;
  currency_symbol: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { refreshSettingsStatus } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
  });
  
  // Clinic state
  const [clinicData, setClinicData] = useState({
    clinicId: "",
    clinicName: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "",
    description: "",
  });
  
  // Doctor state
  const [doctorData, setDoctorData] = useState({
    fullName: "",
    specialization: "",
    qualification: "",
    licenseNumber: "",
    contactNumber: "",
    email: user?.email || "",
    bio: "",
    digitalSignature: "",
  });
  
  // Region state
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  
  // Reference to the RegionalSettings component
  const regionalSettingsRef = useRef<RegionalSettingsRef>(null);
  
  // Reference to the PublicBookingSettings component
  const publicBookingSettingsRef = useRef<PublicBookingSettingsRef>(null);
  
  // Reference to the EmailSettings component
  const emailSettingsRef = useRef<EmailSettingsRef>(null);
  
  const [loading, setLoading] = useState({
    profile: false,
    clinic: false,
    doctor: false,
    region: false,
    publicBooking: false,
    email: false
  });

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      const loadAllData = async () => {
        setIsInitialLoading(true);
        
        try {
          // First load profile, clinic, doctor data in parallel
          await Promise.all([
            fetchProfileData(),
            fetchClinicData(),
            fetchDoctorData()
          ]);
          
          // Then load regions first, then user region after
          await fetchRegions();
          await fetchUserRegion();
        } catch (error) {
          console.error("Error loading settings data:", error);
        } finally {
          setIsInitialLoading(false);
        }
      };
      
      loadAllData();
    }
  }, [user]);

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile data:', error);
        return;
      }
      
      if (data) {
        setProfileData({
          fullName: data.full_name || "",
          email: user?.email || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Fetch clinic data
  const fetchClinicData = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching clinic data:', error);
        return;
      }
      
      if (data) {
        setClinicData({
          clinicId: data.id || "",
          clinicName: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          openingHours: data.opening_hours || "",
          description: data.description || "",
        });
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
    }
  };

  // Fetch doctor data with retry logic
  const fetchDoctorData = async () => {
    try {
      console.log("Fetching doctor data...");
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No doctor data found for this user");
        } else {
          console.error('Error fetching doctor data:', error);
        }
        return;
      }
      
      console.log("Doctor data fetched successfully");
      
      if (data) {
        console.log("Signature data length:", (data.digital_signature?.length || 0));
        setDoctorData({
          fullName: data.full_name || "",
          specialization: data.specialization || "",
          qualification: data.qualification || "",
          licenseNumber: data.license_number || "",
          contactNumber: data.contact_number || "",
          email: data.email || user?.email || "",
          bio: data.bio || "",
          digitalSignature: data.digital_signature || "",
        });
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };
  
  // Fetch available regions
  const fetchRegions = async () => {
    try {
      console.log("Fetching regions...");
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching regions:', error);
        return;
      }
      
      if (data) {
        console.log('Regions loaded:', data.length, data);
        setRegions(data);
      } else {
        console.log('No regions data returned');
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };
  
  // Fetch user's selected region
  const fetchUserRegion = async () => {
    try {
      const { data, error } = await supabase
        .from('user_regions')
        .select('region_id')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.region_id) {
        setSelectedRegionId(data.region_id);
        
        // Fetch region details
        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select('*')
          .eq('id', data.region_id)
          .single();
        
        if (regionError) throw regionError;
        
        setSelectedRegion(regionData);
      }
    } catch (error) {
      console.error('Error fetching user region:', error);
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle clinic form changes
  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClinicData(prev => ({ ...prev, [name]: value }));
  };

  // Handle doctor form changes
  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctorData(prev => ({ ...prev, [name]: value }));
  };

  // Handle signature change
  const handleSignatureChange = (signatureData: string) => {
    console.log("Signature data received:", signatureData.substring(0, 50) + "...");
    setDoctorData(prev => ({ ...prev, digitalSignature: signatureData }));
  };
  
  // Handle region change
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    const region = regions.find(r => r.id === regionId) || null;
    setSelectedRegion(region);
  };

  // Save profile data
  const saveProfileData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    
    try {
      // Save to Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
      
      // Refresh settings status
      refreshSettingsStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Save clinic data
  const saveClinicData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, clinic: true }));
    
    try {
      // Save to Supabase clinics table
      const { error } = await supabase
        .from('clinics')
        .upsert({
          user_id: user?.id,
          name: clinicData.clinicName,
          address: clinicData.address,
          phone: clinicData.phone,
          email: clinicData.email,
          opening_hours: clinicData.openingHours,
          description: clinicData.description,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: "Clinic settings updated",
        description: "Your clinic information has been saved successfully.",
      });
      
      // Refresh settings status
      refreshSettingsStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update clinic settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating clinic settings:", error);
    } finally {
      setLoading(prev => ({ ...prev, clinic: false }));
    }
  };

  // Save doctor data with better error handling
  const saveDoctorData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, doctor: true }));
    
    try {
      console.log("Saving doctor data with signature length:", doctorData.digitalSignature?.length || 0);
      
      // Prepare doctor data
      const doctorRecord = {
        user_id: user?.id,
        full_name: doctorData.fullName,
        specialization: doctorData.specialization,
        qualification: doctorData.qualification,
        license_number: doctorData.licenseNumber,
        contact_number: doctorData.contactNumber,
        email: doctorData.email,
        bio: doctorData.bio,
        digital_signature: doctorData.digitalSignature,
        updated_at: new Date().toISOString(),
      };
      
      // Save to Supabase doctors table
      const { data, error } = await supabase
        .from('doctors')
        .upsert(doctorRecord)
        .select();
      
      if (error) {
        console.error("Error in upsert operation:", error);
        throw error;
      }
      
      console.log("Doctor data saved successfully:", data);
      
      toast({
        title: "Doctor details updated",
        description: "Your doctor information has been saved successfully.",
      });
      
      // Refresh doctor data to ensure we have the latest
      fetchDoctorData();
      
      // Refresh settings status
      refreshSettingsStatus();
    } catch (error) {
      console.error("Error updating doctor details:", error);
      toast({
        title: "Error",
        description: "Failed to update doctor details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, doctor: false }));
    }
  };
  
  // Save region data and financial settings together
  const saveRegionData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, region: true }));
    
    try {
      if (!selectedRegionId) {
        toast({
          title: "Error",
          description: "Please select a region.",
          variant: "destructive",
        });
        return;
      }
      
      // First check if a record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('user_regions')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      let error;
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Real error, not just "no rows returned"
        throw fetchError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_regions')
          .update({
            region_id: selectedRegionId,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_regions')
          .insert({
            user_id: user?.id,
            region_id: selectedRegionId,
            updated_at: new Date().toISOString(),
          });
          
        error = insertError;
      }
      
      if (error) throw error;
      
      // Save regional financial settings if available
      if (regionalSettingsRef.current) {
        await regionalSettingsRef.current.saveRegionalData();
      }
      
      toast({
        title: "Region settings updated",
        description: "Your region, currency, and financial settings have been saved successfully.",
      });
      
      // Refresh settings status
      refreshSettingsStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update region settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating region settings:", error);
    } finally {
      setLoading(prev => ({ ...prev, region: false }));
    }
  };
  
  // Save public booking settings
  const savePublicBookingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, publicBooking: true }));
    
    try {
      // Get clinic ID
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      
      if (clinicError) {
        if (clinicError.code === 'PGRST116') {
          toast({
            title: "Error",
            description: "Please set up your clinic information first.",
            variant: "destructive",
          });
        } else {
          throw clinicError;
        }
        return;
      }
      
      // Save public booking settings if available
      if (publicBookingSettingsRef.current) {
        const success = await publicBookingSettingsRef.current.savePublicBookingSettings();
        
        if (success) {
          toast({
            title: "Public booking settings updated",
            description: "Your public booking settings have been saved successfully.",
          });
          
          // Refresh settings status
          refreshSettingsStatus();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update public booking settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating public booking settings:", error);
    } finally {
      setLoading(prev => ({ ...prev, publicBooking: false }));
    }
  };
  
  // Save email settings
  const saveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, email: true }));
    
    try {
      // Save email settings if available
      if (emailSettingsRef.current) {
        const success = await emailSettingsRef.current.saveEmailSettings();
        
        if (success) {
          toast({
            title: "Email settings updated",
            description: "Your email configuration has been saved successfully.",
          });
          
          // Refresh settings status
          refreshSettingsStatus();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating email settings:", error);
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  // Clear signature
  const clearSignature = () => {
    setDoctorData(prev => ({ ...prev, digitalSignature: "" }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>
        
        {isInitialLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading settings...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 bg-background z-10 pb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
                <TabsTrigger value="profile" className="text-xs sm:text-sm py-2">Profile</TabsTrigger>
                <TabsTrigger value="clinic" className="text-xs sm:text-sm py-2">Clinic</TabsTrigger>
                <TabsTrigger value="doctor" className="text-xs sm:text-sm py-2">Doctor Details</TabsTrigger>
                <TabsTrigger value="region" className="text-xs sm:text-sm py-2">Region</TabsTrigger>
                <TabsTrigger value="booking" className="text-xs sm:text-sm py-2">Public Booking</TabsTrigger>
                <TabsTrigger value="email" className="text-xs sm:text-sm py-2">Email</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="mt-16">
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your personal information and account settings.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={saveProfileData}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          disabled={true}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading.profile}
                        className="w-full sm:w-auto"
                      >
                        {loading.profile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="clinic">
                <Card>
                  <CardHeader>
                    <CardTitle>Clinic Settings</CardTitle>
                    <CardDescription>
                      Manage your clinic's information and settings.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={saveClinicData}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="clinicName">Clinic Name</Label>
                        <Input
                          id="clinicName"
                          name="clinicName"
                          placeholder="Enter clinic name"
                          value={clinicData.clinicName}
                          onChange={handleClinicChange}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          placeholder="Enter clinic address"
                          value={clinicData.address}
                          onChange={handleClinicChange}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="Enter clinic phone"
                            value={clinicData.phone}
                            onChange={handleClinicChange}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter clinic email"
                            value={clinicData.email}
                            onChange={handleClinicChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openingHours">Opening Hours</Label>
                        <Textarea
                          id="openingHours"
                          name="openingHours"
                          placeholder="E.g., Mon-Fri: 9am-5pm, Sat: 10am-2pm"
                          value={clinicData.openingHours}
                          onChange={handleClinicChange}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Enter a brief description of your clinic"
                          value={clinicData.description}
                          onChange={handleClinicChange}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading.clinic}
                        className="w-full sm:w-auto"
                      >
                        {loading.clinic ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="doctor">
                <Card>
                  <CardHeader>
                    <CardTitle>Doctor Details</CardTitle>
                    <CardDescription>
                      Manage your professional information and digital signature.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={saveDoctorData}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctorFullName">Full Name</Label>
                        <Input
                          id="doctorFullName"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={doctorData.fullName}
                          onChange={handleDoctorChange}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            name="specialization"
                            placeholder="E.g., Cardiology, Pediatrics"
                            value={doctorData.specialization}
                            onChange={handleDoctorChange}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualification">Qualification</Label>
                          <Input
                            id="qualification"
                            name="qualification"
                            placeholder="E.g., MBBS, MD"
                            value={doctorData.qualification}
                            onChange={handleDoctorChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input
                            id="licenseNumber"
                            name="licenseNumber"
                            placeholder="Enter your medical license number"
                            value={doctorData.licenseNumber}
                            onChange={handleDoctorChange}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactNumber">Contact Number</Label>
                          <Input
                            id="contactNumber"
                            name="contactNumber"
                            placeholder="Enter your contact number"
                            value={doctorData.contactNumber}
                            onChange={handleDoctorChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctorEmail">Email</Label>
                        <Input
                          id="doctorEmail"
                          name="email"
                          type="email"
                          placeholder="Enter your professional email"
                          value={doctorData.email}
                          onChange={handleDoctorChange}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder="Enter a brief professional bio"
                          value={doctorData.bio}
                          onChange={handleDoctorChange}
                          rows={3}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signature">Digital Signature</Label>
                        <div className="border rounded-md p-4">
                          <div className="mb-4">
                            {doctorData.digitalSignature ? (
                              <div className="flex flex-col items-center">
                                <img 
                                  src={doctorData.digitalSignature} 
                                  alt="Digital Signature" 
                                  className="max-h-32 border rounded-md p-2 mb-2"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={clearSignature}
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  Clear Signature
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center p-2 sm:p-4 border border-dashed rounded-md">
                                <p className="text-muted-foreground mb-2 text-sm">No signature added yet</p>
                                <Input
                                  id="signatureUpload"
                                  type="file"
                                  accept="image/*"
                                  className="w-full"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Check file size (limit to 500KB to ensure it fits in the database)
                                      if (file.size > 500 * 1024) {
                                        toast({
                                          title: "File too large",
                                          description: "Signature image must be less than 500KB",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        try {
                                          const result = reader.result as string;
                                          console.log("File loaded, size:", result.length);
                                          
                                          // Validate the data URL format
                                          if (!result.startsWith('data:image/')) {
                                            throw new Error('Invalid image format');
                                          }
                                          
                                          handleSignatureChange(result);
                                          
                                          toast({
                                            title: "Signature uploaded",
                                            description: "Don't forget to save your changes",
                                          });
                                        } catch (error) {
                                          console.error("Error processing signature:", error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to process signature image. Please try another image.",
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
                                  }}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Upload a small image file (max 500KB). PNG or JPEG recommended.
                                </p>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload an image of your signature. This will appear on prescriptions and other documents.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading.doctor}
                        className="w-full sm:w-auto"
                      >
                        {loading.doctor ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="region">
                <Card>
                  <CardHeader>
                    <CardTitle>Region Settings</CardTitle>
                    <CardDescription>
                      Select your region and currency for invoices and other financial documents.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={saveRegionData}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={selectedRegionId}
                          onValueChange={handleRegionChange}
                        >
                          <SelectTrigger id="region" className="w-full">
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">No regions available</div>
                            ) : (
                              regions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name} ({region.currency_code} - {region.currency_symbol})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedRegion && (
                        <div className="mt-6 p-3 sm:p-4 bg-muted/50 rounded-md">
                          <h3 className="font-medium mb-2 text-sm sm:text-base">Selected Currency</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs sm:text-sm font-medium">Currency Code:</p>
                              <p className="text-xs sm:text-sm">{selectedRegion.currency_code}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium">Currency Symbol:</p>
                              <p className="text-xs sm:text-sm">{selectedRegion.currency_symbol}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4">
                            This currency will be used for all invoices and financial documents.
                          </p>
                        </div>
                      )}
                      
                      {/* Region-specific financial settings */}
                      {selectedRegionId && user && (
                        <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6">
                          <RegionalSettings 
                            userId={user.id} 
                            regionId={selectedRegionId} 
                            region={selectedRegion}
                            ref={regionalSettingsRef}
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading.region || !selectedRegionId}
                        className="w-full"
                      >
                        {loading.region ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save All Settings"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="booking">
                <Card>
                  <CardHeader>
                    <CardTitle>Public Booking Page</CardTitle>
                    <CardDescription>
                      Configure your public booking page for patients to schedule appointments online.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={savePublicBookingSettings}>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {clinicData.clinicName ? (
                        <PublicBookingSettings
                          userId={user?.id || ''}
                          clinicId={clinicData.clinicId || ''}
                          clinicName={clinicData.clinicName}
                          ref={publicBookingSettingsRef}
                        />
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4">
                          <p className="text-yellow-800 text-sm">
                            Please set up your clinic information in the Clinic tab before configuring public booking.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading.publicBooking || !clinicData.clinicName}
                        className="w-full"
                      >
                        {loading.publicBooking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Settings"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                      Configure email notifications for appointments, invoices, and other communications.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={saveEmailSettings}>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {user?.id ? (
                        <EmailSettings
                          userId={user.id}
                          ref={emailSettingsRef}
                        />
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4">
                          <p className="text-yellow-800 text-sm">
                            Please sign in to configure email settings.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading.email || !user?.id}
                        className="w-full"
                      >
                        {loading.email ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Settings"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Settings;  