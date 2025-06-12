import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookingConfirmationState {
  bookingId: string;
  clinicName: string;
  date: string;
  time: string;
  isVirtual?: boolean;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Get booking details from location state
  const bookingDetails = location.state as BookingConfirmationState;
  
  // Redirect to booking page if no booking details are found
  useEffect(() => {
    if (!bookingDetails) {
      navigate(`/book/${slug}`);
    }
  }, [bookingDetails, navigate, slug]);
  
  // If no booking details, show loading or redirect
  if (!bookingDetails) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">{bookingDetails.clinicName}</h1>
          <p className="text-sm opacity-80">Online Appointment Booking</p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Booking Request Submitted</CardTitle>
            <CardDescription>
              Your appointment request has been received
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div>
                <h3 className="text-sm font-medium">Appointment Details</h3>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {bookingDetails.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Time:</span> {bookingDetails.time}
                    </p>
                  </div>
                  {bookingDetails.isVirtual && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Virtual
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm border-t border-border pt-3">
                The clinic will review your request and contact you to confirm your appointment.
                Please note that this is not a confirmed appointment until you receive confirmation from the clinic.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => navigate(`/book/${slug}`)} 
              className="w-full"
              variant="outline"
            >
              Book Another Appointment
            </Button>
            <Button 
              onClick={() => window.close()} 
              className="w-full"
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {bookingDetails.clinicName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BookingConfirmation; 