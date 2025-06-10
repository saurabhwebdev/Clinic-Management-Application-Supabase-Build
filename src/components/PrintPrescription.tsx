import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import PrescriptionPDF from './PrescriptionPDF';

interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  visit_id: string | null;
  prescription_date: string;
  diagnosis: string;
  notes: string;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  items: PrescriptionItem[];
}

interface ClinicInfo {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  openingHours?: string;
  description?: string;
}

interface DoctorInfo {
  fullName: string;
  specialization?: string;
  qualification?: string;
  licenseNumber?: string;
  digitalSignature?: string;
}

interface PrintPrescriptionProps {
  prescription: Prescription;
}

const PrintPrescription = ({ prescription }: PrintPrescriptionProps) => {
  const { user } = useAuth();
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    clinicName: 'Medical Clinic',
    address: '',
    phone: '',
    email: '',
  });
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClinicInfo();
      fetchDoctorInfo();
    }
  }, [user]);

  const fetchClinicInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching clinic info:', error);
        return;
      }

      if (data) {
        setClinicInfo({
          clinicName: data.name || 'Medical Clinic',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          openingHours: data.opening_hours || '',
          description: data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching clinic info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No doctor info found for this user");
        } else {
          console.error('Error fetching doctor info:', error);
        }
        return;
      }

      if (data) {
        console.log("Doctor info retrieved successfully");
        const hasSignature = data.digital_signature && data.digital_signature.length > 0;
        
        setDoctorInfo({
          fullName: data.full_name || '',
          specialization: data.specialization || '',
          qualification: data.qualification || '',
          licenseNumber: data.license_number || '',
          digitalSignature: hasSignature ? data.digital_signature : undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };

  const fileName = `prescription-${prescription.id}-${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <PrescriptionPDF 
          prescription={prescription} 
          clinicInfo={clinicInfo}
          doctorInfo={doctorInfo} 
        />
      }
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading: pdfLoading }) => (
        <Button
          variant="ghost"
          size="icon"
          disabled={loading || pdfLoading}
          className="h-8 w-8"
          title="Print prescription"
        >
          <Printer size={16} />
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PrintPrescription; 