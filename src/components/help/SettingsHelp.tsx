import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsHelp = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="settings-management">Settings Management</h2>
      <p className="text-gray-600 mb-6">
        The Settings module allows you to configure your personal profile, clinic information, doctor details,
        regional preferences, public booking options, and email notifications.
      </p>

      <div className="space-y-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Key features of the Settings module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Settings module provides a comprehensive set of configuration options for your ClinicFlow account. 
              The settings are organized into the following tabs:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Profile:</strong> Your personal account information</li>
              <li><strong>Clinic:</strong> Your clinic's details and contact information</li>
              <li><strong>Doctor Details:</strong> Your professional information and digital signature</li>
              <li><strong>Region:</strong> Regional and currency settings for financial documents</li>
              <li><strong>Public Booking:</strong> Configuration for your patient appointment booking page</li>
              <li><strong>Email:</strong> Email notification preferences and templates</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> It's recommended to complete all settings sections when you first set up your account to ensure all features work correctly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Managing your personal account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Profile tab allows you to manage your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Full Name:</strong> Your complete name as you'd like it to appear in the system</li>
              <li><strong>Email:</strong> Your account email address (cannot be changed)</li>
              <li><strong>Phone:</strong> Your contact phone number</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Updating Your Profile</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Navigate to the Settings page from the main sidebar</li>
              <li>Ensure you're on the "Profile" tab</li>
              <li>Update your information as needed</li>
              <li>Click the "Save Changes" button to apply your changes</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your email address is used for account verification and cannot be changed from this screen. Contact support if you need to change your email address.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Settings</CardTitle>
            <CardDescription>
              Managing your clinic's information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Clinic tab allows you to set up your clinic's details, which will appear on documents and the booking page:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clinic Name:</strong> The official name of your practice or clinic</li>
              <li><strong>Address:</strong> The physical location of your clinic</li>
              <li><strong>Phone:</strong> Your clinic's contact phone number</li>
              <li><strong>Email:</strong> Your clinic's contact email address</li>
              <li><strong>Opening Hours:</strong> Your regular business hours</li>
              <li><strong>Description:</strong> A brief description of your clinic and services</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Why Clinic Information Matters</h4>
            <p>
              Your clinic information appears in several important places:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>On printed prescriptions and invoices</li>
              <li>On the public booking page for patients</li>
              <li>In email communications with patients</li>
              <li>In appointment reminders and confirmations</li>
            </ul>
            
            <div className="bg-amber-50 p-4 rounded-md mt-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Setting up your clinic information is required before you can use features like public booking and document generation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Details</CardTitle>
            <CardDescription>
              Managing your professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Doctor Details tab allows you to enter your professional credentials and upload your digital signature:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Full Name:</strong> Your professional name</li>
              <li><strong>Specialization:</strong> Your medical specialty (e.g., Cardiology, Pediatrics)</li>
              <li><strong>Qualification:</strong> Your medical qualifications (e.g., MBBS, MD)</li>
              <li><strong>License Number:</strong> Your medical license or registration number</li>
              <li><strong>Contact Number:</strong> Your professional contact number</li>
              <li><strong>Email:</strong> Your professional email address</li>
              <li><strong>Professional Bio:</strong> A brief description of your experience and expertise</li>
              <li><strong>Digital Signature:</strong> Your signature for prescriptions and documents</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Adding Your Digital Signature</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Scroll to the Digital Signature section</li>
              <li>Click the file upload area or "Choose File" button</li>
              <li>Select an image file of your signature (PNG or JPEG, max 500KB)</li>
              <li>The signature will be previewed once uploaded</li>
              <li>Click "Save Changes" to store your signature</li>
              <li>To replace your signature, click "Clear Signature" and upload a new one</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For the best results, use a signature with a transparent background (PNG format) and ensure it's clearly visible against a white background.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Region Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Region Settings</CardTitle>
            <CardDescription>
              Setting up your regional and currency preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Region tab allows you to configure regional settings that affect currency formatting and other location-specific features:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Region Selection:</strong> Choose your geographic region</li>
              <li><strong>Currency:</strong> The system will automatically set the appropriate currency based on your region</li>
              <li><strong>Financial Settings:</strong> Additional region-specific financial settings may be available</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Why Regional Settings Matter</h4>
            <p>
              Your regional settings affect several important aspects of ClinicFlow:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Currency formatting on invoices and financial reports</li>
              <li>Date and time formatting throughout the application</li>
              <li>Tax calculations and financial regulations</li>
              <li>Language and localization preferences (where applicable)</li>
            </ul>
            
            <div className="bg-amber-50 p-4 rounded-md mt-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Setting up your region is required before you can create invoices with the correct currency formatting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Public Booking Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Public Booking Settings</CardTitle>
            <CardDescription>
              Configuring your online appointment booking page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Public Booking tab allows you to set up and customize your online appointment booking page for patients:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Booking Page Status:</strong> Enable or disable online booking</li>
              <li><strong>Booking Page URL:</strong> The web address where patients can book appointments</li>
              <li><strong>Available Services:</strong> The types of appointments patients can book</li>
              <li><strong>Available Time Slots:</strong> Configure when patients can schedule appointments</li>
              <li><strong>Booking Instructions:</strong> Custom instructions for patients</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Setting Up Your Booking Page</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>First, ensure your clinic information is complete in the Clinic tab</li>
              <li>Navigate to the Public Booking tab</li>
              <li>Enable the booking page</li>
              <li>Configure your available services and time slots</li>
              <li>Add any special instructions for patients</li>
              <li>Click "Save Settings" to apply your changes</li>
              <li>Use the provided URL to share with your patients</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Share your booking page URL on your clinic's website, social media, and in email communications with patients to make it easy for them to schedule appointments.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configuring email notifications and templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Email tab allows you to configure automated email notifications for various events:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Appointment Confirmations:</strong> Emails sent when appointments are booked</li>
              <li><strong>Appointment Reminders:</strong> Emails sent before scheduled appointments</li>
              <li><strong>Invoice Notifications:</strong> Emails sent when invoices are created or due</li>
              <li><strong>Email Templates:</strong> Customize the content of automated emails</li>
              <li><strong>Notification Preferences:</strong> Choose which events trigger email notifications</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Customizing Email Templates</h4>
            <p>
              You can personalize the content of automated emails to match your clinic's branding and communication style:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Select the email template you want to customize</li>
              <li>Edit the subject line and content</li>
              <li>Use available placeholders to include dynamic information (e.g., patient name, appointment time)</li>
              <li>Preview the template to see how it will look to recipients</li>
              <li>Save your changes</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Regular email communications help reduce no-shows and keep patients informed. Make sure your email settings are configured to send appointment reminders.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Settings Best Practices</CardTitle>
            <CardDescription>
              Tips for optimal configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Complete All Settings</h4>
            <p>
              For the best experience with ClinicFlow, we recommend completing all settings sections:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Start with your Profile and Clinic information</li>
              <li>Complete your Doctor Details, including your digital signature</li>
              <li>Set up your Region preferences for correct currency formatting</li>
              <li>Configure your Public Booking page if you want to offer online scheduling</li>
              <li>Customize your Email settings to automate patient communications</li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Regular Updates</h4>
            <p>
              Keep your settings updated as your practice evolves:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Update your clinic hours if they change</li>
              <li>Refresh your professional information when you gain new qualifications</li>
              <li>Adjust your available booking slots based on your schedule</li>
              <li>Review and update email templates periodically</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Remember:</strong> Your settings affect how ClinicFlow works for you and how your practice appears to patients. Taking time to configure everything properly will enhance your experience and professional image.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsHelp; 