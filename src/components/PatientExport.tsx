import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// No need for declaration as we're importing properly
// declare module 'jspdf' {
//   interface jsPDF {
//     autoTable: (options: any) => jsPDF;
//     getNumberOfPages: () => number;
//   }
// }

interface PatientExportProps {
  patientId: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface PatientVisit {
  id: string;
  visit_date: string;
  reason_for_visit: string | null;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  created_at: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  visit_id: string | null;
  prescription_date: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
  prescription_items: PrescriptionItem[];
}

interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

interface Invoice {
  id: string;
  patient_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface Clinic {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  description: string | null;
}

const PatientExport: React.FC<PatientExportProps> = ({ 
  patientId, 
  buttonVariant = 'outline', 
  buttonSize = 'default',
  className = ''
}) => {
  const { toast } = useToast();

  const fetchPatientData = async () => {
    try {
      // Fetch patient details
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      if (!patient) throw new Error('Patient not found');

      // Fetch clinic details
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', patient.user_id)
        .single();

      if (clinicError && clinicError.code !== 'PGRST116') {
        console.error('Error fetching clinic data:', clinicError);
      }

      // Fetch appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Fetch patient visits
      const { data: visits, error: visitsError } = await supabase
        .from('patient_visits')
        .select('*')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Fetch prescriptions related to patient
      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          prescription_items (*)
        `)
        .eq('patient_id', patientId)
        .order('prescription_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // Fetch invoices related to patient
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      return {
        patient,
        clinic: clinic || null,
        appointments: appointments || [],
        visits: visits || [],
        prescriptions: prescriptions || [],
        invoices: invoices || []
      };
    } catch (error) {
      console.error('Error fetching patient data for export:', error);
      throw error;
    }
  };

  const generatePDF = async () => {
    try {
      toast({
        title: 'Preparing report',
        description: 'Gathering patient data...',
      });

      const data = await fetchPatientData();
      const { patient, clinic, appointments, visits, prescriptions, invoices } = data;

      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;
      
      // Helper function to check if we need a new page
      const checkForNewPage = (requiredSpace: number = 40) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };
      
      // Add clinic header if available
      if (clinic) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(clinic.name || 'Medical Clinic', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (clinic.address) {
          doc.text(clinic.address, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 5;
        }
        
        let contactInfo = [];
        if (clinic.phone) contactInfo.push(`Phone: ${clinic.phone}`);
        if (clinic.email) contactInfo.push(`Email: ${clinic.email}`);
        
        if (contactInfo.length > 0) {
          doc.text(contactInfo.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 10;
        }
        
        // Add separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition, pageWidth - 14, yPosition);
        yPosition += 10;
      }
      
      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Medical Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Add patient info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', 14, yPosition);
      yPosition += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      
      // Format patient data
      const patientInfo = [
        ['Full Name', `${patient.first_name} ${patient.last_name}`],
        ['Date of Birth', patient.date_of_birth ? format(new Date(patient.date_of_birth), 'PP') : 'N/A'],
        ['Gender', patient.gender || 'N/A'],
        ['Blood Group', patient.blood_group || 'N/A'],
        ['Contact', patient.phone || patient.email || 'N/A'],
        ['Address', patient.address || 'N/A'],
        ['Emergency Contact', patient.emergency_contact_name ? 
          `${patient.emergency_contact_name} (${patient.emergency_contact_phone || 'No phone'})` : 'N/A']
      ];
      
      // Add patient info table
      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: patientInfo,
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 130 }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      checkForNewPage();
      
      // Add medical info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical Information', 14, yPosition);
      yPosition += 8;
      
      const medicalInfo = [
        ['Allergies', patient.allergies || 'None reported'],
        ['Medical History', patient.medical_history || 'None reported']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: medicalInfo,
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 130 }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      checkForNewPage();
      
      // Add appointments
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointment History', 14, yPosition);
      yPosition += 8;
      
      if (appointments.length > 0) {
        const appointmentData = appointments.map(app => [
          format(new Date(app.date), 'PP'),
          `${app.start_time?.substring(0, 5) || 'N/A'} - ${app.end_time?.substring(0, 5) || 'N/A'}`,
          app.title || 'N/A',
          app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'N/A',
          app.notes || 'N/A'
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Time', 'Title', 'Status', 'Notes']],
          body: appointmentData,
          theme: 'striped',
          headStyles: { fillColor: [100, 100, 100] },
          styles: { cellPadding: 2, fontSize: 9 }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No appointments recorded', 14, yPosition);
        yPosition += 15;
      }
      
      checkForNewPage();
      
      // Add visits
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Visit History', 14, yPosition);
      yPosition += 8;
      
      if (visits.length > 0) {
        const visitData = visits.map(visit => [
          format(new Date(visit.visit_date), 'PP'),
          visit.reason_for_visit || 'N/A',
          visit.diagnosis || 'N/A',
          visit.treatment || 'N/A',
          visit.notes || 'N/A'
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Reason', 'Diagnosis', 'Treatment', 'Notes']],
          body: visitData,
          theme: 'striped',
          headStyles: { fillColor: [100, 100, 100] },
          styles: { cellPadding: 2, fontSize: 9 }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No visit records found', 14, yPosition);
        yPosition += 15;
      }
      
      checkForNewPage();
      
      // Add prescriptions
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescriptions', 14, yPosition);
      yPosition += 8;
      
      if (prescriptions.length > 0) {
        for (const prescription of prescriptions) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Prescription: ${format(new Date(prescription.prescription_date), 'PP')}`, 14, yPosition);
          yPosition += 6;
          
          if (prescription.diagnosis) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Diagnosis: ${prescription.diagnosis}`, 14, yPosition);
            yPosition += 6;
          }
          
          if (prescription.prescription_items && prescription.prescription_items.length > 0) {
            const medicationData = prescription.prescription_items.map(item => [
              item.medication_name,
              item.dosage,
              item.frequency,
              item.duration,
              item.instructions || 'N/A'
            ]);
            
            autoTable(doc, {
              startY: yPosition,
              head: [['Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
              body: medicationData,
              theme: 'striped',
              headStyles: { fillColor: [100, 100, 100] },
              styles: { cellPadding: 2, fontSize: 9 }
            });
            
            yPosition = (doc as any).lastAutoTable.finalY + 10;
          } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('No medication details available', 14, yPosition);
            yPosition += 10;
          }
          
          // Add notes if available
          if (prescription.notes) {
            doc.setFontSize(10);
            doc.text(`Notes: ${prescription.notes}`, 14, yPosition);
            yPosition += 6;
          }
          
          // Add a separator line between prescriptions
          if (prescriptions.indexOf(prescription) < prescriptions.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.line(14, yPosition, pageWidth - 14, yPosition);
            yPosition += 10;
          }
          
          // Check if we need a new page for the next prescription
          if (yPosition > pageHeight - 40 && prescriptions.indexOf(prescription) < prescriptions.length - 1) {
            doc.addPage();
            yPosition = 20;
          }
        }
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No prescriptions recorded', 14, yPosition);
        yPosition += 15;
      }
      
      checkForNewPage(50);
      
      // Add invoices
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Billing Information', 14, yPosition);
      yPosition += 8;
      
      if (invoices.length > 0) {
        const invoiceData = invoices.map(inv => [
          inv.invoice_number,
          format(new Date(inv.invoice_date), 'PP'),
          format(new Date(inv.due_date), 'PP'),
          `${inv.currency_symbol || '$'}${inv.total_amount.toFixed(2)}`,
          inv.status.charAt(0).toUpperCase() + inv.status.slice(1)
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Invoice #', 'Invoice Date', 'Due Date', 'Amount', 'Status']],
          body: invoiceData,
          theme: 'striped',
          headStyles: { fillColor: [100, 100, 100] },
          styles: { cellPadding: 2, fontSize: 9 }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No billing records found', 14, yPosition);
      }
      
      // Add footer with date
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);
        doc.text(
          `Report generated on ${format(new Date(), 'PPpp')} | Page ${i} of ${pageCount}`,
          pageWidth / 2, 
          pageHeight - 10, 
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`patient_report_${patient.last_name}_${patient.first_name}.pdf`);
      
      toast({
        title: 'Report generated',
        description: 'Patient report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate patient report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      variant={buttonVariant} 
      size={buttonSize}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download size={16} />
      <span>Export Report</span>
    </Button>
  );
};

export default PatientExport; 