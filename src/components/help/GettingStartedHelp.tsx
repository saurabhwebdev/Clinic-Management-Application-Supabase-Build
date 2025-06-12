import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GettingStartedHelp = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="getting-started">Getting Started with ClinicFlow</h2>
      <p className="text-gray-600 mb-6">
        Welcome to ClinicFlow! This guide will help you set up your account, configure your clinic profile, 
        and understand the basics of navigating the platform.
      </p>

      <div className="space-y-6">
        {/* Account Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Setup</CardTitle>
            <CardDescription>
              Creating and managing your ClinicFlow account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Creating Your Account</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Visit the ClinicFlow signup page by clicking "Sign Up" on the homepage
              </li>
              <li>
                Enter your email address and create a secure password
              </li>
              <li>
                Verify your email address by clicking the link sent to your inbox
              </li>
              <li>
                Complete your profile information when prompted
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Logging In</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Visit the ClinicFlow login page
              </li>
              <li>
                Enter your registered email address and password
              </li>
              <li>
                Click "Sign In" to access your dashboard
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Password Recovery</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                If you forget your password, click the "Forgot Password?" link on the login page
              </li>
              <li>
                Enter your registered email address
              </li>
              <li>
                Check your email for a password reset link
              </li>
              <li>
                Create a new password when prompted
              </li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Use a strong, unique password for your ClinicFlow account to ensure the security of your clinic and patient data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Configuring Your Clinic Profile</CardTitle>
            <CardDescription>
              Setting up your clinic's information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              After creating your account, the first step is to set up your clinic profile. This information will appear on documents like invoices and appointment slips.
            </p>
            
            <h4 className="font-medium text-lg">Accessing the Settings Page</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Click on your profile icon in the top-right corner of the dashboard
              </li>
              <li>
                Select "Settings" from the dropdown menu
              </li>
              <li>
                Navigate to the "Clinic" tab in the settings page
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Essential Clinic Information</h4>
            <p>
              Fill in the following information to complete your clinic profile:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clinic Name:</strong> The official name of your practice</li>
              <li><strong>Address:</strong> Your clinic's physical location</li>
              <li><strong>Phone:</strong> The main contact number for your clinic</li>
              <li><strong>Email:</strong> The primary email address for patient communications</li>
              <li><strong>Opening Hours:</strong> Your clinic's regular operating hours</li>
              <li><strong>Description:</strong> A brief description of your practice and services</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Doctor Details</h4>
            <p>
              Navigate to the "Doctor Details" tab to add your professional information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Full Name:</strong> Your professional name</li>
              <li><strong>Specialization:</strong> Your medical specialty</li>
              <li><strong>Qualification:</strong> Your degrees and certifications</li>
              <li><strong>License Number:</strong> Your medical license number</li>
              <li><strong>Digital Signature:</strong> Upload an image of your signature for documents</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Regional Settings</h4>
            <p>
              Configure your regional preferences in the "Region" tab:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Region:</strong> Select your country/region</li>
              <li><strong>Currency:</strong> The system will automatically set the currency based on your region</li>
              <li><strong>Tax Settings:</strong> Configure tax rates and information for invoices</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Complete your clinic profile before adding patients or scheduling appointments to ensure all your documents display the correct information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Navigation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Understanding the Dashboard</CardTitle>
            <CardDescription>
              Navigating the ClinicFlow interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The dashboard is your central hub for managing all aspects of your clinic. Here's how to navigate the interface:
            </p>
            
            <h4 className="font-medium text-lg">Main Navigation Menu</h4>
            <p>
              The left sidebar contains links to all major sections of the application:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dashboard:</strong> Overview of your clinic's activity and key metrics</li>
              <li><strong>Patients:</strong> Manage patient records and information</li>
              <li><strong>Appointments:</strong> Schedule and manage appointments</li>
              <li><strong>Prescriptions:</strong> Create and manage patient prescriptions</li>
              <li><strong>Invoices:</strong> Generate and track patient invoices</li>
              <li><strong>Inventory:</strong> Manage clinic supplies and medications</li>
              <li><strong>Reports:</strong> View financial and operational reports</li>
              <li><strong>Settings:</strong> Configure your clinic profile and preferences</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Dashboard Overview</h4>
            <p>
              The main dashboard displays key information at a glance:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Today's Appointments:</strong> Quick view of scheduled appointments for the day</li>
              <li><strong>Recent Patients:</strong> List of recently added or updated patient records</li>
              <li><strong>Pending Tasks:</strong> Important tasks requiring your attention</li>
              <li><strong>Financial Summary:</strong> Overview of recent financial activity</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Quick Actions</h4>
            <p>
              Common tasks can be accessed quickly from the dashboard:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Add New Patient:</strong> Create a new patient record</li>
              <li><strong>Schedule Appointment:</strong> Create a new appointment</li>
              <li><strong>Create Invoice:</strong> Generate a new invoice</li>
              <li><strong>Write Prescription:</strong> Create a new prescription</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">User Profile</h4>
            <p>
              Access your user profile and account settings:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click on your profile icon in the top-right corner</li>
              <li>Select "Profile" to update your personal information</li>
              <li>Select "Settings" to access application settings</li>
              <li>Select "Sign Out" to log out of your account</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Spend some time exploring the dashboard to familiarize yourself with the layout and available features before adding patients or scheduling appointments.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Section */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Getting your clinic fully operational
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              After setting up your account and configuring your clinic profile, here are the recommended next steps:
            </p>
            
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Add your patients</strong> to the system using the Patients module
                <p className="text-sm text-gray-600 mt-1">
                  Start building your patient database by adding your existing patients.
                </p>
              </li>
              <li>
                <strong>Set up your appointment schedule</strong> in the Appointments module
                <p className="text-sm text-gray-600 mt-1">
                  Configure your working hours and start scheduling appointments.
                </p>
              </li>
              <li>
                <strong>Configure public booking</strong> if you want to allow patients to book appointments online
                <p className="text-sm text-gray-600 mt-1">
                  This feature can be enabled in the Settings page under the "Public Booking" tab.
                </p>
              </li>
              <li>
                <strong>Set up email notifications</strong> in the Settings page
                <p className="text-sm text-gray-600 mt-1">
                  Configure automated emails for appointment reminders and other communications.
                </p>
              </li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-6">
              <h4 className="font-medium text-base mb-2">Need More Help?</h4>
              <p className="text-sm">
                Explore the other sections of this help center for detailed instructions on using each module:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                <li>Patient Management</li>
                <li>Appointments</li>
                <li>Prescriptions</li>
                <li>Billing & Invoices</li>
                <li>Settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GettingStartedHelp; 