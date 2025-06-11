import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import PatientExport from '@/components/PatientExport';

// Define interfaces
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
  created_at: string;
  updated_at: string;
}

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
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id && user) {
      fetchPatientData();
      fetchPatientAppointments();
    }
  }, [id, user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        navigate('/patients');
        toast({
          title: 'Error',
          description: 'Patient not found or you do not have permission to view this patient.',
          variant: 'destructive',
        });
        return;
      }
      
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patient data. Please try again.',
        variant: 'destructive',
      });
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', id)
        .order('date', { ascending: false })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointment history. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

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

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'N/A';
    
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} years`;
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading patient data...</div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Patient not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button variant="outline" onClick={() => navigate('/patients')} className="mb-2">
              ← Back to Patients
            </Button>
            <h1 className="text-3xl font-bold">
              {patient.first_name} {patient.last_name}
            </h1>
          </div>
          <PatientExport patientId={id as string} />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="overview">Patient Overview</TabsTrigger>
            <TabsTrigger value="visits">Visit History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="text-base">{patient.first_name} {patient.last_name}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="text-base">{formatDate(patient.date_of_birth)}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Age</dt>
                      <dd className="text-base">{calculateAge(patient.date_of_birth)}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="text-base">{patient.gender || 'N/A'}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
                      <dd className="text-base">{patient.blood_group || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-base">{patient.email || 'N/A'}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-base">{patient.phone || 'N/A'}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-base">{patient.address || 'N/A'}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                      <dd className="text-base">
                        {patient.emergency_contact_name ? (
                          <>
                            {patient.emergency_contact_name}
                            {patient.emergency_contact_phone && (
                              <span className="text-sm text-gray-500"> ({patient.emergency_contact_phone})</span>
                            )}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Allergies</h3>
                      <p className="mt-2">{patient.allergies || 'No allergies recorded'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Medical History</h3>
                      <p className="mt-2">{patient.medical_history || 'No medical history recorded'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>
                  Record of all scheduled appointments for this patient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No appointments recorded for this patient.</p>
                    <Button onClick={() => navigate('/appointments')} className="mt-4">
                      Schedule an Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              <div>{formatDate(appointment.date)}</div>
                              <div className="text-sm text-gray-500">
                                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.title}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{appointment.notes || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PatientDetail; 