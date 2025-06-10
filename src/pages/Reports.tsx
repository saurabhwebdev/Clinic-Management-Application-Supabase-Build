import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Users, Receipt, TrendingUp, Activity, FileBarChart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const Reports = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data for reports
  const patientData = [
    { id: 1, name: 'John Doe', age: 45, gender: 'Male', visits: 3, lastVisit: '2023-05-15' },
    { id: 2, name: 'Jane Smith', age: 32, gender: 'Female', visits: 5, lastVisit: '2023-05-10' },
    { id: 3, name: 'Robert Johnson', age: 58, gender: 'Male', visits: 2, lastVisit: '2023-05-05' },
    { id: 4, name: 'Emily Davis', age: 27, gender: 'Female', visits: 1, lastVisit: '2023-05-01' },
    { id: 5, name: 'Michael Brown', age: 41, gender: 'Male', visits: 4, lastVisit: '2023-04-28' },
  ];

  const appointmentData = [
    { id: 1, patient: 'John Doe', date: '2023-05-20', time: '09:00 AM', status: 'Scheduled', doctor: 'Dr. Smith' },
    { id: 2, patient: 'Jane Smith', date: '2023-05-21', time: '10:30 AM', status: 'Scheduled', doctor: 'Dr. Johnson' },
    { id: 3, patient: 'Robert Johnson', date: '2023-05-19', time: '02:00 PM', status: 'Completed', doctor: 'Dr. Williams' },
    { id: 4, patient: 'Emily Davis', date: '2023-05-22', time: '11:15 AM', status: 'Scheduled', doctor: 'Dr. Smith' },
    { id: 5, patient: 'Michael Brown', date: '2023-05-18', time: '03:30 PM', status: 'Cancelled', doctor: 'Dr. Johnson' },
  ];

  const invoiceData = [
    { id: 'INV-001', patient: 'John Doe', date: '2023-05-15', amount: 150.00, status: 'Paid' },
    { id: 'INV-002', patient: 'Jane Smith', date: '2023-05-10', amount: 200.00, status: 'Pending' },
    { id: 'INV-003', patient: 'Robert Johnson', date: '2023-05-05', amount: 175.00, status: 'Paid' },
    { id: 'INV-004', patient: 'Emily Davis', date: '2023-05-01', amount: 125.00, status: 'Overdue' },
    { id: 'INV-005', patient: 'Michael Brown', date: '2023-04-28', amount: 300.00, status: 'Paid' },
  ];

  // Function to generate PDF for patient list
  const generatePatientReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Patient Report', 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['ID', 'Name', 'Age', 'Gender', 'Total Visits', 'Last Visit']],
        body: patientData.map(patient => [
          patient.id,
          patient.name,
          patient.age,
          patient.gender,
          patient.visits,
          patient.lastVisit
        ]),
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save('patient-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate PDF for appointments
  const generateAppointmentReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Appointment Report', 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['ID', 'Patient', 'Date', 'Time', 'Status', 'Doctor']],
        body: appointmentData.map(appointment => [
          appointment.id,
          appointment.patient,
          appointment.date,
          appointment.time,
          appointment.status,
          appointment.doctor
        ]),
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save('appointment-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate PDF for invoices
  const generateInvoiceReport = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Invoice Report', 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [['Invoice ID', 'Patient', 'Date', 'Amount', 'Status']],
        body: invoiceData.map(invoice => [
          invoice.id,
          invoice.patient,
          invoice.date,
          `$${invoice.amount.toFixed(2)}`,
          invoice.status
        ]),
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save('invoice-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
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
                  <p className="text-sm text-gray-500">
                    This report includes patient details such as name, age, gender, visit count, and last visit date.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generatePatientReport} 
                    disabled={isGenerating}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? 'Generating...' : (
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
                  <Button className="w-full flex items-center gap-2">
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
                  <Button className="w-full flex items-center gap-2">
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
                  <p className="text-sm text-gray-500">
                    This report includes appointment details such as patient name, date, time, status, and assigned doctor.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generateAppointmentReport} 
                    disabled={isGenerating}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? 'Generating...' : (
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
                  <Button className="w-full flex items-center gap-2">
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
                  <Button className="w-full flex items-center gap-2">
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
                  <p className="text-sm text-gray-500">
                    This report includes invoice details such as patient name, date, amount, and payment status.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generateInvoiceReport} 
                    disabled={isGenerating}
                    className="w-full flex items-center gap-2"
                  >
                    {isGenerating ? 'Generating...' : (
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
                  <Button className="w-full flex items-center gap-2">
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
                  <Button className="w-full flex items-center gap-2">
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
                  <Button className="w-full flex items-center gap-2">
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
                  <Button className="w-full flex items-center gap-2">
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
                  <Button className="w-full flex items-center gap-2">
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