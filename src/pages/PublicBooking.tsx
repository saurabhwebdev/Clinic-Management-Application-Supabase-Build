import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Clock, Video, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  description: string;
  user_id: string;
}

interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Captcha state
  const [captchaValues, setCaptchaValues] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
    isVirtual: false,
  });

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Generate a simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaValues({ num1, num2 });
    setCaptchaAnswer('');
    setCaptchaError(false);
  };

  // Fetch clinic data on component mount
  useEffect(() => {
    fetchClinicData();
  }, [slug]);

  // Update available time slots when date changes
  useEffect(() => {
    if (clinic && date) {
      generateTimeSlots();
    }
  }, [clinic, date]);

  const fetchClinicData = async () => {
    try {
      setLoading(true);
      
      // First find the clinic ID from the slug
      const { data: settingsData, error: settingsError } = await supabase
        .from('public_booking_settings')
        .select('clinic_id, enabled')
        .eq('booking_slug', slug)
        .single();
      
      if (settingsError || !settingsData) {
        console.error('Error fetching clinic from slug:', settingsError);
        setNotFound(true);
        return;
      }
      
      // Check if public booking is enabled
      if (!settingsData.enabled) {
        setNotFound(true);
        return;
      }
      
      // Then fetch the clinic details
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', settingsData.clinic_id)
        .single();
      
      if (clinicError || !clinicData) {
        console.error('Error fetching clinic details:', clinicError);
        setNotFound(true);
        return;
      }
      
      setClinic(clinicData);
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = async () => {
    if (!clinic || !date) return;
    
    // Generate time slots from 8 AM to 7:30 PM in 30-minute intervals
    const slots: TimeSlot[] = [];
    const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
    const minutes = ['00', '30'];
    
    // Format the selected date
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Fetch existing appointments for this date
    const { data: existingAppointments, error } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('user_id', clinic.user_id)
      .eq('date', formattedDate);
    
    if (error) {
      console.error('Error fetching existing appointments:', error);
    }
    
    // Create a set of busy time slots
    const busySlots = new Set<string>();
    existingAppointments?.forEach(appointment => {
      busySlots.add(appointment.start_time);
    });
    
    // Generate all time slots
    hours.forEach(hour => {
      minutes.forEach(minute => {
        const timeValue = `${hour}:${minute}`;
        const displayTime = formatTime(timeValue);
        
        // Check if the slot is available
        const isAvailable = !busySlots.has(timeValue);
        
        // Add the slot
        slots.push({
          value: timeValue,
          label: displayTime,
          available: isAvailable
        });
      });
    });
    
    setTimeSlots(slots);
  };

  const formatTime = (timeString: string) => {
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minute} ${period}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptchaAnswer(e.target.value);
    setCaptchaError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    const expectedAnswer = captchaValues.num1 + captchaValues.num2;
    if (parseInt(captchaAnswer) !== expectedAnswer) {
      setCaptchaError(true);
      generateCaptcha(); // Generate a new captcha
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (!clinic || !date || !selectedTimeSlot) {
        toast({
          title: "Error",
          description: "Please select a date and time for your appointment",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate end time (30 minutes after start time)
      const [hour, minute] = selectedTimeSlot.split(':');
      let endHour = parseInt(hour);
      let endMinute = parseInt(minute) + 30;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      // Generate meeting ID and URL for virtual appointments
      let meetingId = null;
      let meetingUrl = null;
      
      if (formData.isVirtual) {
        // Create a unique meeting ID based on timestamp and random string
        meetingId = `clinic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        // Create Jitsi meeting URL
        meetingUrl = `https://meet.jit.si/${meetingId}`;
      }
      
      // Create the public booking request
      const { data, error } = await supabase
        .from('public_booking_requests')
        .insert({
          clinic_id: clinic.id,
          user_id: clinic.user_id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date: format(date, 'yyyy-MM-dd'),
          start_time: selectedTimeSlot,
          end_time: endTime,
          reason: formData.reason,
          is_virtual: formData.isVirtual,
          meeting_id: meetingId,
          meeting_url: meetingUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select();
      
      if (error) throw error;
      
      // Show success message
      toast({
        title: "Booking request submitted",
        description: "Your appointment request has been submitted. The clinic will contact you to confirm.",
      });
      
      // Redirect to confirmation page
      navigate(`/book/${slug}/confirmation`, { 
        state: { 
          bookingId: data[0].id,
          clinicName: clinic.name,
          date: format(date, 'EEEE, MMMM d, yyyy'),
          time: formatTime(selectedTimeSlot),
          isVirtual: formData.isVirtual
        } 
      });
      
    } catch (error) {
      console.error('Error submitting booking request:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading booking page...</p>
      </div>
    );
  }

  // Show not found state
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Booking Page Not Found</CardTitle>
            <CardDescription>
              The booking page you're looking for doesn't exist or is currently disabled.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">{clinic?.name}</h1>
          <p className="text-sm opacity-80">Online Appointment Booking</p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Clinic info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm">{clinic?.address}</p>
                </div>
                
                {clinic?.phone && (
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm">{clinic.phone}</p>
                  </div>
                )}
                
                {clinic?.email && (
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm">{clinic.email}</p>
                  </div>
                )}
                
                {clinic?.opening_hours && (
                  <div>
                    <h3 className="font-medium">Opening Hours</h3>
                    <p className="text-sm whitespace-pre-line">{clinic.opening_hours}</p>
                  </div>
                )}
                
                {clinic?.description && (
                  <div>
                    <h3 className="font-medium">About</h3>
                    <p className="text-sm">{clinic.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Booking form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>
                  Fill out the form below to request an appointment
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Personal information */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointment details */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Appointment Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => 
                                isBefore(date, new Date()) || 
                                isAfter(date, addDays(new Date(), 30))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Time *</Label>
                        <Select 
                          value={selectedTimeSlot} 
                          onValueChange={setSelectedTimeSlot}
                          disabled={!date || timeSlots.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem 
                                key={slot.value} 
                                value={slot.value}
                                disabled={!slot.available}
                              >
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>{slot.label}</span>
                                  {!slot.available && <span className="ml-2 text-xs text-muted-foreground">(Unavailable)</span>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Textarea
                        id="reason"
                        name="reason"
                        placeholder="Please briefly describe the reason for your visit"
                        value={formData.reason}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-4">
                      <Switch
                        id="isVirtual"
                        checked={formData.isVirtual}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isVirtual: checked }))
                        }
                      />
                      <div>
                        <Label htmlFor="isVirtual" className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-primary" />
                          Virtual Appointment
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Request a video consultation instead of an in-person visit
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Captcha verification */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Verification</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="captcha">
                        Please solve this simple math problem: {captchaValues.num1} + {captchaValues.num2} = ?
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="captcha"
                          type="number"
                          value={captchaAnswer}
                          onChange={handleCaptchaChange}
                          className="max-w-[120px]"
                          required
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={generateCaptcha}
                          className="text-xs"
                        >
                          New Problem
                        </Button>
                      </div>
                      
                      {captchaError && (
                        <Alert variant="destructive" className="py-2 mt-2">
                          <AlertDescription>
                            Incorrect answer. Please try again with the new problem.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        This helps us prevent automated spam submissions
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting || !date || !selectedTimeSlot || !captchaAnswer}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Request Appointment"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {clinic?.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicBooking; 