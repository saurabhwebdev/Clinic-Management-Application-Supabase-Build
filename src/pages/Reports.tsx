import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Users, Receipt, TrendingUp, Activity, FileBarChart, Loader2 } from 'lucide-react';
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
    clinic: true
  });
  
  // State for actual data
  const [patientData, setPatientData] = useState<Patient[]>([]);
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([]);
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

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export clinic reports</p>
        </div>
        
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users size={16} />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt size={16} />
              <span>Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Patients Report Tab */}
          <TabsContent value="patients">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={18} />
                    Patient List
                  </CardTitle>
                  <CardDescription>Export a list of all patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    This report includes patient details such as name, date of birth, gender, contact information, and more.
                  </p>
                  {isLoading.patients || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium">Available Data:</p>
                      <p>{patientData.length} patients</p>
                      {clinicInfo.clinicName && (
                        <p className="mt-2 text-blue-600">Clinic information will be included in the report</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generatePatientReport} 
                    disabled={isGenerating || isLoading.patients || isLoading.clinic || patientData.length === 0}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        <span>Export as PDF</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={18} />
                    Patient Activity
                  </CardTitle>
                  <CardDescription>Patient visit frequency report</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report shows patient visit patterns, frequency, and engagement metrics over time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart size={18} />
                    Demographics
                  </CardTitle>
                  <CardDescription>Patient demographic analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report provides insights into patient demographics including age distribution, gender ratio, and location.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Appointments Report Tab */}
          <TabsContent value="appointments">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={18} />
                    Appointment List
                  </CardTitle>
                  <CardDescription>Export a list of all appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    This report includes appointment details such as patient name, date, time, status, and assigned doctor.
                  </p>
                  {isLoading.appointments || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium">Available Data:</p>
                      <p>{appointmentData.length} appointments</p>
                      {clinicInfo.clinicName && (
                        <p className="mt-2 text-blue-600">Clinic information will be included in the report</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generateAppointmentReport} 
                    disabled={isGenerating || isLoading.appointments || isLoading.clinic || appointmentData.length === 0}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        <span>Export as PDF</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} />
                    Appointment Trends
                  </CardTitle>
                  <CardDescription>Appointment scheduling patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report analyzes appointment scheduling patterns, peak hours, and utilization rates.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={18} />
                    No-Show Analysis
                  </CardTitle>
                  <CardDescription>Missed appointment report</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report tracks missed appointments, cancellation rates, and identifies patterns to improve scheduling.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Invoices Report Tab */}
          <TabsContent value="invoices">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt size={18} />
                    Invoice List
                  </CardTitle>
                  <CardDescription>Export a list of all invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    This report includes invoice details such as patient name, date, amount, and payment status.
                  </p>
                  {isLoading.invoices || isLoading.clinic ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium">Available Data:</p>
                      <p>{invoiceData.length} invoices</p>
                      {clinicInfo.clinicName && (
                        <p className="mt-2 text-blue-600">Clinic information will be included in the report</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generateInvoiceReport} 
                    disabled={isGenerating || isLoading.invoices || isLoading.clinic || invoiceData.length === 0}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        <span>Export as PDF</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} />
                    Revenue Analysis
                  </CardTitle>
                  <CardDescription>Financial performance report</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report provides insights into revenue trends, payment patterns, and financial performance.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={18} />
                    Outstanding Balances
                  </CardTitle>
                  <CardDescription>Unpaid invoices report</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report tracks outstanding payments, aging receivables, and payment collection status.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Analytics Report Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} />
                    Clinic Performance
                  </CardTitle>
                  <CardDescription>Overall clinic metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report provides a comprehensive overview of clinic performance, including patient volume, revenue, and growth.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={18} />
                    Staff Productivity
                  </CardTitle>
                  <CardDescription>Staff performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report analyzes staff productivity, patient load, and efficiency metrics for each healthcare provider.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart size={18} />
                    Resource Utilization
                  </CardTitle>
                  <CardDescription>Resource usage analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This report tracks the utilization of clinic resources, equipment, and facilities to optimize operations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center gap-2" disabled>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;