import React, { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';

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

  // Fetch patients using React Query
  const { data: patientData = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, gender, email, phone, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch appointments using React Query
  const { data: appointmentData = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments', user?.id, 'reports'],
    queryFn: async () => {
      if (!user) return [];
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
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      // Transform data to match the Appointment interface
      return (data || []).map(item => {
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
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch invoices using React Query
  const { data: invoiceData = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', user?.id, 'reports'],
    queryFn: async () => {
      if (!user) return [];
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
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false });
      if (error) throw error;
      // Transform data to match the Invoice interface
      return (data || []).map(item => {
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
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch inventory using React Query
  const { data: inventoryData = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ['inventory', user?.id, 'reports'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, description, category, quantity, unit, reorder_level, cost_price, selling_price, supplier, location')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch clinic info using React Query
  const { data: clinicInfo = {
    clinicName: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "",
    description: ""
  }, isLoading: isLoadingClinic } = useQuery({
    queryKey: ['clinicInfo', user?.id],
    queryFn: async () => {
      if (!user) return {
        clinicName: "",
        address: "",
        phone: "",
        email: "",
        openingHours: "",
        description: ""
      };
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        return {
          clinicName: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          openingHours: data.opening_hours || "",
          description: data.description || ""
        };
      }
      return {
        clinicName: "",
        address: "",
        phone: "",
        email: "",
        openingHours: "",
        description: ""
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

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
                  {isLoadingPatients || isLoadingClinic ? (
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
                  {isLoadingAppointments || isLoadingClinic ? (
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
                  {isLoadingInvoices || isLoadingClinic ? (
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
                  {isLoadingInventory || isLoadingClinic ? (
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