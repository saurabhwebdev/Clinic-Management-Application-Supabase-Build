import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Check, X, CalendarPlus, Loader2, UserPlus, User, Video, Clock, Calendar, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BookingRequest {
  id: string;
  clinic_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  is_virtual?: boolean;
  meeting_id?: string | null;
  meeting_url?: string | null;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface PendingBookingsProps {
  onRefreshNeeded?: () => void;
}

const PendingBookings = ({ onRefreshNeeded }: PendingBookingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  
  // Dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state for linking/creating patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [newPatientData, setNewPatientData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
  });
  
  // Fetch booking requests and patients on component mount
  useEffect(() => {
    if (user) {
      fetchBookingRequests();
      fetchPatients();
    }
  }, [user]);
  
  // Fetch pending booking requests
  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('public_booking_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setBookingRequests(data || []);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch booking requests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch patients
  const fetchPatients = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone')
        .eq('user_id', user.id)
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };
  
  // Format time for display
  const formatTime = (timeString: string) => {
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minute} ${period}`;
  };
  
  // Open confirmation dialog
  const openConfirmDialog = (request: BookingRequest) => {
    setSelectedRequest(request);
    
    // Pre-fill patient data
    setNewPatientData({
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.email,
      phone: request.phone,
      date_of_birth: '',
      gender: '',
    });
    
    // Try to find matching patient
    const matchingPatient = patients.find(
      patient => 
        (patient.email && patient.email.toLowerCase() === request.email.toLowerCase()) ||
        (patient.phone && patient.phone === request.phone)
    );
    
    if (matchingPatient) {
      setSelectedPatientId(matchingPatient.id);
    } else {
      setSelectedPatientId('');
    }
    
    setIsConfirmDialogOpen(true);
  };
  
  // Open new patient dialog
  const openNewPatientDialog = () => {
    setIsConfirmDialogOpen(false);
    setIsNewPatientDialogOpen(true);
  };
  
  // Handle input change for new patient form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPatientData(prev => ({ ...prev, [name]: value }));
  };
  
  // Create new patient
  const handleCreatePatient = async () => {
    if (!user || !selectedRequest) return;
    
    setIsProcessing(true);
    
    try {
      // Create new patient
      const { data, error } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          first_name: newPatientData.first_name,
          last_name: newPatientData.last_name,
          email: newPatientData.email || null,
          phone: newPatientData.phone || null,
          date_of_birth: newPatientData.date_of_birth || null,
          gender: newPatientData.gender || null,
        })
        .select();
      
      if (error) throw error;
      
      // Set the newly created patient as selected
      setSelectedPatientId(data[0].id);
      
      // Close dialog and return to confirmation dialog
      setIsNewPatientDialogOpen(false);
      setIsConfirmDialogOpen(true);
      
      // Refresh patients list
      fetchPatients();
      
      toast({
        title: 'Success',
        description: 'New patient created successfully.',
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to create patient. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!user || !selectedRequest) return;
    
    if (!selectedPatientId) {
      toast({
        title: 'Error',
        description: 'Please select or create a patient to link with this appointment.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          patient_id: selectedPatientId,
          title: selectedRequest.reason || 'Appointment',
          date: selectedRequest.date,
          start_time: selectedRequest.start_time,
          end_time: selectedRequest.end_time,
          status: 'scheduled',
          notes: `Booked through public booking page. Reason: ${selectedRequest.reason || 'Not specified'}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_virtual: selectedRequest.is_virtual || false,
          meeting_id: selectedRequest.meeting_id || null,
          meeting_url: selectedRequest.meeting_url || null,
        });
      
      if (appointmentError) throw appointmentError;
      
      // Update booking request status
      const { error: updateError } = await supabase
        .from('public_booking_requests')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);
      
      if (updateError) throw updateError;
      
      // Close dialog and refresh data
      setIsConfirmDialogOpen(false);
      fetchBookingRequests();
      
      // Notify parent component to refresh if needed
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
      
      toast({
        title: 'Success',
        description: 'Appointment confirmed successfully.',
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Reject booking
  const handleRejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('public_booking_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Refresh data
      fetchBookingRequests();
      
      toast({
        title: 'Success',
        description: 'Booking request rejected.',
      });
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject booking. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Check if there are any pending bookings
  const hasPendingBookings = bookingRequests.length > 0;
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Booking Requests</span>
            {hasPendingBookings && (
              <Badge variant="destructive" className="ml-2">
                {bookingRequests.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage appointment requests from your public booking page
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !hasPendingBookings ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarPlus className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No pending booking requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[150px] text-xs font-medium p-2">Name</TableHead>
                    <TableHead className="w-[180px] text-xs font-medium p-2">Email</TableHead>
                    <TableHead className="w-[120px] text-xs font-medium p-2">Phone</TableHead>
                    <TableHead className="w-[100px] text-xs font-medium p-2">Date</TableHead>
                    <TableHead className="w-[100px] text-xs font-medium p-2">Time</TableHead>
                    <TableHead className="w-[150px] text-xs font-medium p-2">Reason</TableHead>
                    <TableHead className="w-[100px] text-center text-xs font-medium p-2">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs p-2 whitespace-nowrap">
                        {request.first_name} {request.last_name}
                      </TableCell>
                      <TableCell className="text-xs p-2 whitespace-nowrap">
                        {request.email}
                      </TableCell>
                      <TableCell className="text-xs p-2 whitespace-nowrap">
                        {request.phone}
                      </TableCell>
                      <TableCell className="text-xs p-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{format(parseISO(request.date), 'MM/dd/yy')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs p-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatTime(request.start_time)}</span>
                          {request.is_virtual && (
                            <Video className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs p-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{request.reason || 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-1">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRejectBooking(request.id)}
                            title="Reject"
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                          <Button
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openConfirmDialog(request)}
                            title="Confirm"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        {hasPendingBookings && (
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={fetchBookingRequests}
            >
              Refresh
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Confirm Booking Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Link this booking request to a patient record before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <div className="flex gap-2">
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={openNewPatientDialog}
                  title="Create New Patient"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {selectedRequest && (
              <div className="border rounded-md p-3 bg-muted/50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium">Date</p>
                    <p className="text-sm">{format(parseISO(selectedRequest.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Time</p>
                    <p className="text-sm flex items-center">
                      {formatTime(selectedRequest.start_time)} - {formatTime(selectedRequest.end_time)}
                      {selectedRequest.is_virtual && (
                        <Badge variant="outline" className="ml-2 flex items-center gap-1 text-xs">
                          <Video className="h-3 w-3" />
                          Virtual
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium">Patient</p>
                  <p className="text-sm">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                </div>
                
                {selectedRequest.reason && (
                  <div>
                    <p className="text-xs font-medium">Reason</p>
                    <p className="text-sm">{selectedRequest.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isProcessing || !selectedPatientId}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Patient Dialog */}
      <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Patient</DialogTitle>
            <DialogDescription>
              Add a new patient record to your database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={newPatientData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={newPatientData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newPatientData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newPatientData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={newPatientData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" value={newPatientData.gender} onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } } as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsNewPatientDialogOpen(false);
                setIsConfirmDialogOpen(true);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePatient}
              disabled={isProcessing || !newPatientData.first_name || !newPatientData.last_name}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Create Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingBookings; 