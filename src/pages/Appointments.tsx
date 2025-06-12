import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO, isToday, isThisWeek, isThisMonth, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon, 
  Clock, 
  Pencil, 
  Trash2, 
  Search, 
  CalendarPlus, 
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

// Define interfaces
interface Appointment {
  id: string;
  patient_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_virtual: boolean;
  meeting_url: string | null;
  meeting_id: string | null;
  patient: {
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots] = useState([
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state for adding/editing appointment
  const [formData, setFormData] = useState({
    patient_id: '',
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'), // Initialize with current date
    start_time: '',
    end_time: '',
    status: 'scheduled',
    notes: '',
    is_virtual: false,
    meeting_id: '',
    meeting_url: '',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);

  // Fetch appointments and patients on component mount
  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchPatients();
    }
  }, [user]);

  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, phone, email)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients from Supabase
  const fetchPatients = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, email')
        .eq('user_id', user.id)
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch patients. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Ensure date is formatted correctly for the database
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log("Setting date to:", formattedDate);
      setFormData((prev) => ({ ...prev, date: formattedDate }));
    }
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (date: string, startTime: string, endTime: string, appointmentId?: string) => {
    return !appointments.some(appointment => 
      appointment.date === date && 
      appointment.id !== appointmentId && // Skip current appointment when editing
      ((startTime >= appointment.start_time && startTime < appointment.end_time) || 
       (endTime > appointment.start_time && endTime <= appointment.end_time) ||
       (startTime <= appointment.start_time && endTime >= appointment.end_time))
    );
  };

  // Calculate end time based on start time (30 min appointments)
  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let newHours = hours;
    let newMinutes = minutes + 30;
    
    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes -= 60;
    }
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // Handle start time change
  const handleStartTimeChange = (value: string) => {
    const endTime = calculateEndTime(value);
    setFormData((prev) => ({ 
      ...prev, 
      start_time: value,
      end_time: endTime
    }));
  };

  // Add new appointment
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      // Validate form data
      console.log("Form data for validation:", formData);
      
      if (!formData.patient_id) {
        toast({
          title: 'Error',
          description: 'Please select a patient.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.title) {
        toast({
          title: 'Error',
          description: 'Please enter an appointment title.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.date) {
        toast({
          title: 'Error',
          description: 'Please select a date.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.start_time) {
        toast({
          title: 'Error',
          description: 'Please select a start time.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.end_time) {
        toast({
          title: 'Error',
          description: 'End time is missing.',
          variant: 'destructive',
        });
        return;
      }
      
      // Check if time slot is available
      if (!isTimeSlotAvailable(formData.date, formData.start_time, formData.end_time)) {
        toast({
          title: 'Error',
          description: 'This time slot is already booked. Please choose another time.',
          variant: 'destructive',
        });
        return;
      }
      
      // Generate meeting ID and URL for virtual appointments
      let meetingId = null;
      let meetingUrl = null;
      
      if (formData.is_virtual) {
        // Create a unique meeting ID based on timestamp and random string
        meetingId = `clinic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        // Create Jitsi meeting URL
        meetingUrl = `https://meet.jit.si/${meetingId}`;
      }
      
      const { data, error } = await supabase.from('appointments').insert({
        user_id: user.id,
        patient_id: formData.patient_id,
        title: formData.title,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        status: formData.status,
        notes: formData.notes || null,
        is_virtual: formData.is_virtual,
        meeting_id: meetingId,
        meeting_url: meetingUrl,
      }).select(`
        *,
        patient:patients(first_name, last_name, phone, email)
      `);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Appointment added successfully',
      });
      
      // Reset form and close dialog
      setFormData({
        patient_id: '',
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'), // Reset with current date
        start_time: '',
        end_time: '',
        status: 'scheduled',
        notes: '',
        is_virtual: false,
        meeting_id: '',
        meeting_url: '',
      });
      setIsAddDialogOpen(false);
      
      // Refresh appointment list
      fetchAppointments();
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Edit appointment
  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentAppointment) return;
      
      // Validate form data
      console.log("Edit form data for validation:", formData);
      
      if (!formData.patient_id) {
        toast({
          title: 'Error',
          description: 'Please select a patient.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.title) {
        toast({
          title: 'Error',
          description: 'Please enter an appointment title.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.date) {
        toast({
          title: 'Error',
          description: 'Please select a date.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.start_time) {
        toast({
          title: 'Error',
          description: 'Please select a start time.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.end_time) {
        toast({
          title: 'Error',
          description: 'End time is missing.',
          variant: 'destructive',
        });
        return;
      }
      
      // Check if time slot is available
      if (!isTimeSlotAvailable(formData.date, formData.start_time, formData.end_time, currentAppointment.id)) {
        toast({
          title: 'Error',
          description: 'This time slot is already booked. Please choose another time.',
          variant: 'destructive',
        });
        return;
      }
      
      // Handle virtual meeting updates
      let meetingId = currentAppointment.meeting_id;
      let meetingUrl = currentAppointment.meeting_url;
      
      // If changing from in-person to virtual, generate new meeting details
      if (formData.is_virtual && !currentAppointment.is_virtual) {
        meetingId = `clinic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        meetingUrl = `https://meet.jit.si/${meetingId}`;
      }
      
      // If changing from virtual to in-person, clear meeting details
      if (!formData.is_virtual && currentAppointment.is_virtual) {
        meetingId = null;
        meetingUrl = null;
      }
      
      const { error } = await supabase
        .from('appointments')
        .update({
          patient_id: formData.patient_id,
          title: formData.title,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.status,
          notes: formData.notes || null,
          is_virtual: formData.is_virtual,
          meeting_id: meetingId,
          meeting_url: meetingUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentAppointment.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });
      
      // Close dialog and refresh list
      setIsEditDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
      
      // Refresh appointment list
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Join virtual meeting
  const joinVirtualMeeting = (meetingUrl: string) => {
    if (!meetingUrl) {
      toast({
        title: 'Error',
        description: 'Meeting URL is not available.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsJoiningMeeting(true);
    
    // Open meeting in a new tab
    window.open(meetingUrl, '_blank');
    
    setTimeout(() => {
      setIsJoiningMeeting(false);
    }, 1000);
  };

  // Open edit dialog and populate form
  const openEditDialog = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    
    setFormData({
      patient_id: appointment.patient_id,
      title: appointment.title,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes || '',
      is_virtual: appointment.is_virtual || false,
      meeting_id: appointment.meeting_id || '',
      meeting_url: appointment.meeting_url || '',
    });
    
    if (appointment.date) {
      setSelectedDate(parseISO(appointment.date));
    }
    
    setIsEditDialogOpen(true);
  };

  // Filter appointments based on tab and search query
  const getFilteredAppointments = () => {
    let filtered = [...appointments];
    
    // Filter by tab
    if (activeTab === 'today') {
      filtered = filtered.filter(appointment => isToday(parseISO(appointment.date)));
    } else if (activeTab === 'upcoming') {
      const today = new Date();
      filtered = filtered.filter(appointment => {
        const appointmentDate = parseISO(appointment.date);
        return appointmentDate >= today && appointment.status === 'scheduled';
      });
    } else if (activeTab === 'week') {
      filtered = filtered.filter(appointment => isThisWeek(parseISO(appointment.date)));
    } else if (activeTab === 'month') {
      filtered = filtered.filter(appointment => isThisMonth(parseISO(appointment.date)));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment => {
        const patientName = `${appointment.patient?.first_name} ${appointment.patient?.last_name}`.toLowerCase();
        return (
          patientName.includes(query) ||
          appointment.title.toLowerCase().includes(query) ||
          (appointment.patient?.phone && appointment.patient.phone.includes(query)) ||
          (appointment.patient?.email && appointment.patient.email.toLowerCase().includes(query))
        );
      });
    }
    
    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format date for display
  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (error) {
      return timeString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate appointment slip PDF
  const generateAppointmentSlip = async (appointment: Appointment) => {
    try {
      setIsExporting(true);
      console.log("Generating appointment slip for:", appointment);
      
      // Fetch clinic information
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (clinicError && clinicError.code !== 'PGRST116') {
        console.error('Error fetching clinic data:', clinicError);
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointment Slip', 105, 15, { align: 'center' });
      
      // Add clinic details if available
      if (clinicData) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(clinicData.name || 'Clinic', 105, 25, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let y = 30;
        const lineHeight = 4;
        
        if (clinicData.address) {
          const addressLines = clinicData.address.split('\n');
          addressLines.forEach(line => {
            doc.text(line.trim(), 105, y, { align: 'center' });
            y += lineHeight;
          });
        }
        
        if (clinicData.phone) {
          doc.text(`Phone: ${clinicData.phone}`, 105, y, { align: 'center' });
          y += lineHeight;
        }
        
        if (clinicData.email) {
          doc.text(`Email: ${clinicData.email}`, 105, y, { align: 'center' });
          y += lineHeight;
        }
        
        // Add opening hours if available
        if (clinicData.opening_hours) {
          doc.text(`Hours: ${clinicData.opening_hours}`, 105, y, { align: 'center' });
          y += lineHeight;
        }
        
        // Add divider
        doc.setDrawColor(200, 200, 200);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;
      } else {
        // Add date without clinic info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 105, 22, { align: 'center' });
        
        // Add divider
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 25, 196, 25);
      }
      
      // Add generated date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 196, 10, { align: 'right' });
      
      // Add appointment details
      const startY = clinicData ? 50 : 35;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointment Details', 14, startY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Create appointment details table
      const tableBody = [
        ['Patient Name', `${appointment.patient.first_name} ${appointment.patient.last_name}`],
        ['Appointment Title', appointment.title],
        ['Date', formatAppointmentDate(appointment.date)],
        ['Time', `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`],
        ['Status', appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)],
        ['Contact', appointment.patient.phone || appointment.patient.email || 'No contact info'],
      ];
      
      // Add virtual appointment details if applicable
      if (appointment.is_virtual) {
        tableBody.push(['Appointment Type', 'Virtual (Video Call)']);
        tableBody.push(['Meeting Link', appointment.meeting_url || 'Not available']);
        
        // Add instructions for joining
        if (appointment.meeting_url) {
          tableBody.push(['Join Instructions', 'Scan the QR code below or click the meeting link to join the virtual appointment.']);
        }
      } else {
        tableBody.push(['Appointment Type', 'In-person']);
      }
      
      // Add notes at the end
      tableBody.push(['Notes', appointment.notes || 'No notes']);
      
      // Add the table
      autoTable(doc, {
        startY: startY + 5,
        head: [['Field', 'Details']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      let currentY = 150; // Default position if we can't get the table end position
      
      // Try to get the end position of the table
      try {
        // @ts-ignore - accessing internal API
        currentY = (doc as any).lastAutoTable.finalY + 20;
      } catch (e) {
        console.warn("Could not get table end position, using default:", currentY);
      }
      
      // Generate and add QR code for virtual meetings
      if (appointment.is_virtual && appointment.meeting_url) {
        try {
          console.log("Generating QR code for virtual meeting:", appointment.meeting_url);
          
          // Generate QR code as data URL
          const qrCodeDataURL = await QRCode.toDataURL(appointment.meeting_url, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 150,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          
          // Add QR code title
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Virtual Meeting QR Code', 105, currentY, { align: 'center' });
          currentY += 10;
          
          // Add QR code image (centered)
          const qrCodeWidth = 80;
          const qrCodeHeight = 80;
          const xPos = (doc.internal.pageSize.getWidth() - qrCodeWidth) / 2;
          doc.addImage(qrCodeDataURL, 'PNG', xPos, currentY, qrCodeWidth, qrCodeHeight);
          currentY += qrCodeHeight + 10;
          
          // Add URL text below QR code
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(appointment.meeting_url, 105, currentY, { align: 'center' });
          currentY += 15;
          
          console.log("QR code added to PDF at position:", currentY);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
      
      // Add footer with instructions
      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      
      if (appointment.is_virtual) {
        doc.text('Please join the virtual meeting 5 minutes before your scheduled appointment time.', 105, footerY, { align: 'center' });
        doc.text('Make sure you have a stable internet connection and your camera/microphone are working.', 105, footerY + 5, { align: 'center' });
      } else {
        doc.text('Please arrive 10 minutes before your scheduled appointment time.', 105, footerY, { align: 'center' });
        doc.text('Bring this slip with you to your appointment.', 105, footerY + 5, { align: 'center' });
      }
      
      // Save PDF
      doc.save(`appointment-${appointment.id}.pdf`);
      console.log("PDF saved successfully");
      
      toast({
        title: 'Success',
        description: 'Appointment slip generated successfully',
      });
    } catch (error) {
      console.error('Error generating appointment slip:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate appointment slip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <CalendarPlus size={16} />
                <span>Schedule New Appointment</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a new appointment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAppointment}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient *</Label>
                    <Select
                      value={formData.patient_id}
                      onValueChange={(value) => handleSelectChange('patient_id', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Appointment Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Regular Checkup, Follow-up, etc."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateChange}
                            initialFocus
                            disabled={(date) => date < addDays(new Date(), -1)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Select
                        value={formData.start_time}
                        onValueChange={handleStartTimeChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      id="is_virtual"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.is_virtual}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_virtual: e.target.checked }))}
                    />
                    <Label htmlFor="is_virtual" className="text-sm font-medium cursor-pointer">
                      Virtual Appointment (Video Call)
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Add any additional notes about this appointment"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Schedule Appointment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>
                {activeTab === 'all' ? 'All Appointments' :
                 activeTab === 'today' ? 'Today\'s Appointments' :
                 activeTab === 'upcoming' ? 'Upcoming Appointments' :
                 activeTab === 'week' ? 'This Week\'s Appointments' :
                 'This Month\'s Appointments'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[240px]"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2 h-9 flex items-center gap-1">
                      <Filter size={14} />
                      <span>Filter</span>
                      <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuLabel>Filter by time</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className={cn(activeTab === 'all' && "bg-accent text-accent-foreground")}
                      onClick={() => setActiveTab('all')}
                    >
                      All Appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn(activeTab === 'today' && "bg-accent text-accent-foreground")}
                      onClick={() => setActiveTab('today')}
                    >
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn(activeTab === 'upcoming' && "bg-accent text-accent-foreground")}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      Upcoming
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn(activeTab === 'week' && "bg-accent text-accent-foreground")}
                      onClick={() => setActiveTab('week')}
                    >
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn(activeTab === 'month' && "bg-accent text-accent-foreground")}
                      onClick={() => setActiveTab('month')}
                    >
                      This Month
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No appointments match your search.' : 'No appointments found.'}
                </p>
                <Button className="flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
                  <CalendarPlus size={16} />
                  <span>Schedule Your First Appointment</span>
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="border-collapse w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="h-9 px-2 text-xs font-medium">Date & Time</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Patient</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Title</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Status</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium w-[80px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((appointment) => (
                        <TableRow key={appointment.id} className="hover:bg-muted/50 border-b border-border/50">
                          <TableCell className="p-2 text-sm">
                            <div className="font-medium">{formatAppointmentDate(appointment.date)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <div className="font-medium">
                              {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.patient?.phone || appointment.patient?.email || 'No contact info'}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <div className="flex items-center">
                              {appointment.title}
                              {appointment.is_virtual && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                                  <Video size={12} />
                                  <span>Virtual</span>
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                              appointment.status === 'scheduled' && "bg-blue-100 text-blue-800",
                              appointment.status === 'completed' && "bg-green-100 text-green-800",
                              appointment.status === 'cancelled' && "bg-red-100 text-red-800",
                              appointment.status === 'no-show' && "bg-yellow-100 text-yellow-800"
                            )}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <div className="flex justify-center gap-1">
                              {appointment.is_virtual && appointment.status === 'scheduled' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => joinVirtualMeeting(appointment.meeting_url)}
                                  className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                                  title="Join virtual appointment"
                                  disabled={isJoiningMeeting}
                                >
                                  {isJoiningMeeting ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                  ) : (
                                    <Video size={16} />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(appointment)}
                                className="h-8 w-8"
                                title="Edit appointment"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete appointment"
                              >
                                <Trash2 size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => generateAppointmentSlip(appointment)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                                title="Export appointment slip"
                                disabled={isExporting}
                              >
                                {isExporting ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                ) : (
                                  <FileText size={16} />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAppointments.length)} of {filteredAppointments.length} appointments
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAppointment}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_patient_id">Patient *</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => handleSelectChange('patient_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_title">Appointment Title *</Label>
                <Input
                  id="edit_title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Select
                    value={formData.start_time}
                    onValueChange={handleStartTimeChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="edit_is_virtual"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.is_virtual}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_virtual: e.target.checked }))}
                />
                <Label htmlFor="edit_is_virtual" className="text-sm font-medium cursor-pointer">
                  Virtual Appointment (Video Call)
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Appointment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Appointments; 