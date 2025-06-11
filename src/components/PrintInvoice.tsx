import React, { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import InvoicePDF from './InvoicePDF';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Download, Printer } from 'lucide-react';
import { RegionalData } from './RegionalSettings';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  patient_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  items: InvoiceItem[];
  currency_code: string;
  currency_symbol: string;
  region_id?: string;
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
  name: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  signature?: string;
}

interface PrintInvoiceProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

const PrintInvoice = ({ invoice, isOpen, onClose }: PrintInvoiceProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
  });
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo>({
    name: '',
    qualification: '',
    specialization: '',
    registrationNumber: '',
  });
  const [regionalData, setRegionalData] = useState<RegionalData | undefined>(undefined);

  useEffect(() => {
    if (isOpen && user) {
      fetchClinicAndDoctorInfo();
      if (invoice.region_id) {
        fetchRegionalData(invoice.region_id);
      }
    }
  }, [isOpen, user, invoice.region_id]);

  const fetchRegionalData = async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('regional_settings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('region_id', regionId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching regional data:', error);
        return;
      }
      
      if (data) {
        setRegionalData(data);
      }
    } catch (error) {
      console.error('Error fetching regional data:', error);
    }
  };

  const fetchClinicAndDoctorInfo = async () => {
    try {
      setLoading(true);
      
      // Fetch clinic data
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (clinicError && clinicError.code !== 'PGRST116') {
        console.error('Error fetching clinic data:', clinicError);
      }

      // Fetch doctor data
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (doctorError && doctorError.code !== 'PGRST116') {
        console.error('Error fetching doctor data:', doctorError);
      }

      // Update clinic info
      if (clinicData) {
        setClinicInfo({
          clinicName: clinicData.name || '',
          address: clinicData.address || '',
          phone: clinicData.phone || '',
          email: clinicData.email || '',
          openingHours: clinicData.opening_hours || '',
          description: clinicData.description || '',
        });
      }

      // Update doctor info
      if (doctorData) {
        setDoctorInfo({
          name: doctorData.full_name || '',
          qualification: doctorData.qualification || '',
          specialization: doctorData.specialization || '',
          registrationNumber: doctorData.license_number || '',
          signature: doctorData.digital_signature || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Invoice Preview</h2>
            <div className="flex space-x-2">
              <PDFDownloadLink
                document={<InvoicePDF invoice={invoice} clinicInfo={clinicInfo} doctorInfo={doctorInfo} regionalData={regionalData} />}
                fileName={`invoice-${invoice.id}.pdf`}
                className="inline-flex"
              >
                {({ loading: pdfLoading }) => (
                  <Button variant="outline" disabled={pdfLoading || loading}>
                    {pdfLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download PDF
                  </Button>
                )}
              </PDFDownloadLink>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading preview...</span>
          </div>
        ) : (
          <div className="p-4">
            <PDFViewer width="100%" height="600px" className="border">
              <InvoicePDF invoice={invoice} clinicInfo={clinicInfo} doctorInfo={doctorInfo} regionalData={regionalData} />
            </PDFViewer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrintInvoice; 