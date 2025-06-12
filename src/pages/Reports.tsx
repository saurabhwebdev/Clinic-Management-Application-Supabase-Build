import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Users, Receipt, Loader2, Package } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Define interfaces for data types
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  patient: {
    first_name: string;
    last_name: string;
  };
  currency_symbol: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string | null;
  reorder_level: number | null;
  cost_price: number | null;
  selling_price: number | null;
  supplier: string | null;
  location: string | null;
}

interface ClinicInfo {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  description: string;
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState({
    patients: true,
    appointments: true,
    invoices: true,
    inventory: true,
    clinic: true
  });
  
  // State for actual data
  const [patientData, setPatientData] = useState<Patient[]>([]);
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    clinicName: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "",
    description: ""
  });
  
  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchAppointments();
      fetchInvoices();
      fetchInventory();
      fetchClinicInfo();
    }
  }, [user]);
  
  // Fetch patients from Supabase
  const fetchPatients = async () => {
    try {
      setIsLoading(prev => ({ ...prev, patients: true }));
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, gender, email, phone, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPatientData(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch patient data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, patients: false }));
    }
  };
  
  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    try {
      setIsLoading(prev => ({ ...prev, appointments: true }));
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, 
          date, 
          start_time, 
          end_time, 
          status,
          patient:patients(first_name, last_name)
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to match the Appointment interface
      const formattedData = data?.map(item => {
        // Handle the case where patient might be an array or object
        const patientData = Array.isArray(item.patient) ? item.patient[0] : item.patient;
        
        return {
          id: item.id,
          date: item.date,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status,
          patient: {
            first_name: patientData?.first_name || '',
            last_name: patientData?.last_name || ''
          }
        };
      }) || [];
      
      setAppointmentData(formattedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch appointment data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, appointments: false }));
    }
  };
  
  // Fetch invoices from Supabase
  const fetchInvoices = async () => {
    try {
      setIsLoading(prev => ({ ...prev, invoices: true }));
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id, 
          invoice_number, 
          invoice_date, 
          due_date, 
          status, 
          total_amount,
          currency_symbol,
          patient:patients(first_name, last_name)
        `)
        .eq('user_id', user?.id)
        .order('invoice_date', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the Invoice interface
      const formattedData = data?.map(item => {
        // Handle the case where patient might be an array or object
        const patientData = Array.isArray(item.patient) ? item.patient[0] : item.patient;
        
        return {
          id: item.id,
          invoice_number: item.invoice_number,
          invoice_date: item.invoice_date,
          due_date: item.due_date,
          status: item.status,
          total_amount: item.total_amount,
          currency_symbol: item.currency_symbol,
          patient: {
            first_name: patientData?.first_name || '',
            last_name: patientData?.last_name || ''
          }
        };
      }) || [];
      
      setInvoiceData(formattedData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch invoice data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, invoices: false }));
    }
  };

  // Fetch inventory items from Supabase
  const fetchInventory = async () => {
    try {
      setIsLoading(prev => ({ ...prev, inventory: true }));
      
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, description, category, quantity, unit, reorder_level, cost_price, selling_price, supplier, location')
        .eq('user_id', user?.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setInventoryData(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  // Fetch clinic information from Supabase
  const fetchClinicInfo = async () => {
    try {
      setIsLoading(prev => ({ ...prev, clinic: true }));
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setClinicInfo({
          clinicName: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          openingHours: data.opening_hours || "",
          description: data.description || ""
        });
      }
    } catch (error) {
      console.error('Error fetching clinic information:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch clinic information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, clinic: false }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Add clinic header to PDF
  const addClinicHeader = (doc: jsPDF) => {
    // Add clinic name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicInfo.clinicName || 'Clinic', 14, 15);
    
    // Add clinic details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let y = 20;
    const lineHeight = 5;
    
    if (clinicInfo.address) {
      doc.text(`Address: ${clinicInfo.address}`, 14, y);
      y += lineHeight;
    }
    
    if (clinicInfo.phone) {
      doc.text(`Phone: ${clinicInfo.phone}`, 14, y);
      y += lineHeight;
    }
    
    if (clinicInfo.email) {
      doc.text(`Email: ${clinicInfo.email}`, 14, y);
      y += lineHeight;
    }
    
    // Add divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y + 2, 196, y + 2);
    
    return y + 8; // Return the new Y position after the header
  };

  // Function to generate PDF for patient list
  const generatePatientReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add clinic header
      const startY = addClinicHeader(doc);
      
      // Add title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Report', 14, startY);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, startY + 6);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['ID', 'Name', 'Date of Birth', 'Gender', 'Email', 'Phone']],
        body: patientData.map(patient => [
          patient.id,
          `${patient.first_name} ${patient.last_name}`,
          formatDate(patient.date_of_birth),
          patient.gender || 'N/A',
          patient.email || 'N/A',
          patient.phone || 'N/A'
        ]),
        startY: startY + 10,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save('patient-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate PDF for appointments
  const generateAppointmentReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add clinic header
      const startY = addClinicHeader(doc);
      
      // Add title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointment Report', 14, startY);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, startY + 6);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['ID', 'Patient', 'Date', 'Time', 'Status']],
        body: appointmentData.map(appointment => [
          appointment.id,
          `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          formatDate(appointment.date),
          `${appointment.start_time} - ${appointment.end_time || 'N/A'}`,
          appointment.status
        ]),
        startY: startY + 10,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save('appointment-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate PDF for invoices
  const generateInvoiceReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add clinic header
      const startY = addClinicHeader(doc);
      
      // Add title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Report', 14, startY);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, startY + 6);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['Invoice #', 'Patient', 'Date', 'Due Date', 'Amount', 'Status']],
        body: invoiceData.map(invoice => [
          invoice.invoice_number,
          `${invoice.patient.first_name} ${invoice.patient.last_name}`,
          formatDate(invoice.invoice_date),
          formatDate(invoice.due_date),
          `${invoice.currency_symbol || '$'}${invoice.total_amount.toFixed(2)}`,
          invoice.status
        ]),
        startY: startY + 10,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save('invoice-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate PDF for inventory
  const generateInventoryReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add clinic header
      const startY = addClinicHeader(doc);
      
      // Add title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Report', 14, startY);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, startY + 6);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['Name', 'Category', 'Quantity', 'Unit', 'Location', 'Reorder Level']],
        body: inventoryData.map(item => [
          item.name,
          item.category || 'N/A',
          item.quantity.toString(),
          item.unit || 'N/A',
          item.location || 'N/A',
          item.reorder_level?.toString() || 'N/A'
        ]),
        startY: startY + 10,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        // Add custom styles for rows with low stock
        didParseCell: function(data) {
          const item = inventoryData[data.row.index];
          // Check if this is a data row (not header) and item is low on stock
          if (data.section === 'body' && item && item.reorder_level && item.quantity <= item.reorder_level) {
            data.cell.styles.textColor = [220, 38, 38]; // Red color for low stock items
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
      
      // Add a note about low stock items
      const finalY = (doc as any).lastAutoTable.finalY || startY + 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(220, 38, 38);
      doc.text('* Items in red indicate low stock (quantity at or below reorder level)', 14, finalY + 10);
      
      // Save PDF
      doc.save('inventory-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export clinic reports</p>
        </div>
        
        <Tabs defaultValue="patients" className="w-full">
          <div className="sticky top-0 bg-background z-10 pb-4">
            <TabsList className="w-full overflow-x-auto flex flex-nowrap">
              <TabsTrigger value="patients" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Users size={16} className="hidden sm:inline" />
                <span>Patients</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Calendar size={16} className="hidden sm:inline" />
                <span>Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Receipt size={16} className="hidden sm:inline" />
                <span>Invoices</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Package size={16} className="hidden sm:inline" />
                <span>Inventory</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-10">
          
          {/* Patients Report Tab */}
          <TabsContent value="patients">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users size={16} />
                    Patient List
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 pb-4">
                  {isLoading.patients || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs text-gray-500">{patientData.length} patients</span>
                      <Button 
                        onClick={generatePatientReport} 
                        disabled={isGenerating || patientData.length === 0}
                        size="sm"
                        className="h-8 w-full sm:w-auto"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText size={14} className="mr-1" />
                        )}
                        <span>Export</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Appointments Report Tab */}
          <TabsContent value="appointments">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar size={16} />
                    Appointment List
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 pb-4">
                  {isLoading.appointments || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs text-gray-500">{appointmentData.length} appointments</span>
                      <Button 
                        onClick={generateAppointmentReport} 
                        disabled={isGenerating || appointmentData.length === 0}
                        size="sm"
                        className="h-8 w-full sm:w-auto"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText size={14} className="mr-1" />
                        )}
                        <span>Export</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Invoices Report Tab */}
          <TabsContent value="invoices">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Receipt size={16} />
                    Invoice List
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 pb-4">
                  {isLoading.invoices || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs text-gray-500">{invoiceData.length} invoices</span>
                      <Button 
                        onClick={generateInvoiceReport} 
                        disabled={isGenerating || invoiceData.length === 0}
                        size="sm"
                        className="h-8 w-full sm:w-auto"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText size={14} className="mr-1" />
                        )}
                        <span>Export</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Report Tab */}
          <TabsContent value="inventory">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package size={16} />
                    Inventory List
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 pb-4">
                  {isLoading.inventory || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs text-gray-500">{inventoryData.length} items</span>
                      <Button 
                        onClick={generateInventoryReport} 
                        disabled={isGenerating || inventoryData.length === 0}
                        size="sm"
                        className="h-8 w-full sm:w-auto"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText size={14} className="mr-1" />
                        )}
                        <span>Export</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;