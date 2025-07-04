import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SettingsStatus {
  profileComplete: boolean;
  clinicComplete: boolean;
  doctorComplete: boolean;
  regionComplete: boolean;
  allComplete: boolean;
}

// Function to check if all required settings are complete
export const checkSettingsStatus = async (userId: string): Promise<SettingsStatus> => {
  try {
    // Check profile settings
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .single();
    
    const profileComplete = !profileError && profileData?.full_name;
    
    // Check clinic settings
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .select('name, address, phone')
      .eq('user_id', userId)
      .single();
    
    const clinicComplete = !clinicError && clinicData?.name && clinicData?.address;
    
    // Check doctor settings
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('full_name, specialization, license_number')
      .eq('user_id', userId)
      .single();
    
    const doctorComplete = !doctorError && doctorData?.full_name && doctorData?.specialization;
    
    // Check region settings
    const { data: regionData, error: regionError } = await supabase
      .from('user_regions')
      .select('region_id')
      .eq('user_id', userId)
      .single();
    
    const regionComplete = !regionError && regionData?.region_id;
    
    // Update settings status
    const allComplete = profileComplete && clinicComplete && doctorComplete && regionComplete;
    
    return {
      profileComplete,
      clinicComplete,
      doctorComplete,
      regionComplete,
      allComplete
    };
    
  } catch (error) {
    console.error('Error checking settings status:', error);
    return {
      profileComplete: false,
      clinicComplete: false,
      doctorComplete: false,
      regionComplete: false,
      allComplete: false
    };
  }
};
