import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AppointmentHelp = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="appointment-management">Appointment Management</h2>
      <p className="text-gray-600 mb-6">
        The Appointment Management module allows you to schedule, track, and manage all appointments with your patients,
        including both in-person and virtual consultations.
      </p>

      <div className="space-y-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Key features of the Appointment Management module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Appointments page provides a complete system for managing your clinic's schedule, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Scheduling new appointments with patients</li>
              <li>Managing appointment status (scheduled, completed, cancelled, no-show)</li>
              <li>Filtering appointments by time period (today, upcoming, this week, this month)</li>
              <li>Setting up virtual appointments with video conferencing</li>
              <li>Generating appointment slips for patients</li>
              <li>Searching and filtering appointments</li>
            </ul>
          </CardContent>
        </Card>

        {/* Scheduling Appointments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling New Appointments</CardTitle>
            <CardDescription>
              How to create new appointments in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Access the Appointments page</strong> from the main navigation menu.
              </li>
              <li>
                <strong>Click the "Schedule New Appointment" button</strong> at the top of the page.
              </li>
              <li>
                <strong>Fill in the appointment details</strong> in the form that appears:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Patient:</strong> Select the patient from the dropdown menu</li>
                  <li><strong>Appointment Title:</strong> Enter a brief description (e.g., "Regular Checkup", "Follow-up")</li>
                  <li><strong>Date:</strong> Select the appointment date using the calendar</li>
                  <li><strong>Start Time:</strong> Choose the appointment start time</li>
                  <li><strong>Status:</strong> Set the initial status (usually "Scheduled")</li>
                  <li><strong>Virtual Appointment:</strong> Check this box if it's a video consultation</li>
                  <li><strong>Notes:</strong> Add any additional information about the appointment</li>
                </ul>
              </li>
              <li>
                <strong>Click "Schedule Appointment"</strong> to save the new appointment.
              </li>
            </ol>
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> The system automatically checks for time slot conflicts and prevents double-booking. The end time is automatically set to 30 minutes after the start time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Managing Appointments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Managing Existing Appointments</CardTitle>
            <CardDescription>
              How to view, edit, and manage your appointment schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Viewing Appointments</h4>
            <p>
              The main Appointments page displays a table (on desktop) or cards (on mobile) showing your appointments with key information:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Date and time</li>
              <li>Patient name and contact information</li>
              <li>Appointment title</li>
              <li>Status (scheduled, completed, cancelled, no-show)</li>
              <li>Virtual appointment indicator</li>
            </ul>

            <h4 className="font-medium text-lg mt-6">Filtering Appointments</h4>
            <p>
              You can filter appointments by time period using the Filter dropdown:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>All Appointments:</strong> Shows your complete appointment history</li>
              <li><strong>Today:</strong> Shows only today's appointments</li>
              <li><strong>Upcoming:</strong> Shows future scheduled appointments</li>
              <li><strong>This Week:</strong> Shows appointments for the current week</li>
              <li><strong>This Month:</strong> Shows appointments for the current month</li>
            </ul>

            <h4 className="font-medium text-lg mt-6">Searching for Appointments</h4>
            <p>
              Use the search box to quickly find appointments by:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Patient name</li>
              <li>Appointment title</li>
              <li>Patient contact information (phone or email)</li>
            </ul>

            <h4 className="font-medium text-lg mt-6">Editing Appointments</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the appointment in the list</li>
              <li>Click the dropdown menu (three dots) and select "Edit"</li>
              <li>Update the necessary information in the form</li>
              <li>Click "Update Appointment" to save the changes</li>
            </ol>

            <h4 className="font-medium text-lg mt-6">Updating Appointment Status</h4>
            <p>
              To update an appointment's status (e.g., mark as completed):
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click the dropdown menu (three dots) and select "Edit"</li>
              <li>Change the status in the dropdown menu</li>
              <li>Click "Update Appointment" to save the changes</li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Deleting an Appointment</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the appointment in the list</li>
              <li>Click the dropdown menu (three dots) and select "Delete"</li>
              <li>Confirm the deletion when prompted</li>
            </ol>
            <div className="bg-amber-50 p-4 rounded-md mt-2">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> Deleting an appointment is permanent and cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Virtual Appointments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Virtual Appointments</CardTitle>
            <CardDescription>
              How to manage video consultations with patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Creating a Virtual Appointment</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Follow the steps for scheduling a new appointment</li>
              <li>Check the "Virtual Appointment (Video Call)" checkbox</li>
              <li>Complete the rest of the appointment details</li>
              <li>Click "Schedule Appointment" to save</li>
            </ol>
            <p className="mt-2">
              When you create a virtual appointment, the system automatically generates a unique meeting ID and URL for the video consultation.
            </p>

            <h4 className="font-medium text-lg mt-6">Joining a Virtual Appointment</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the virtual appointment in your appointment list (marked with a video icon)</li>
              <li>Click the dropdown menu and select "Join Meeting"</li>
              <li>The meeting will open in a new browser tab</li>
              <li>Allow camera and microphone access when prompted</li>
            </ol>
            <div className="bg-blue-50 p-4 rounded-md mt-2">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Virtual appointments use Jitsi Meet, a secure video conferencing platform. No additional software installation is required for you or your patients.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Slips Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generating Appointment Slips</CardTitle>
            <CardDescription>
              How to create and share appointment details with patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Appointment slips provide patients with a record of their scheduled appointment and can be printed or shared electronically.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the appointment in your list</li>
              <li>Click the dropdown menu (three dots) and select "Export Slip"</li>
              <li>The system will generate a PDF appointment slip</li>
              <li>The PDF will automatically download to your device</li>
            </ol>

            <h4 className="font-medium text-lg mt-6">What's Included in the Appointment Slip</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your clinic details (name, address, contact information)</li>
              <li>Patient name and contact information</li>
              <li>Appointment date and time</li>
              <li>Appointment title and status</li>
              <li>Any notes about the appointment</li>
              <li>For virtual appointments: QR code and link to join the video call</li>
            </ul>
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Appointment slips are useful for patients to remember their appointment details and for reception staff to quickly check in patients.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Section */}
        <Card>
          <CardHeader>
            <CardTitle>Navigating Large Appointment Lists</CardTitle>
            <CardDescription>
              How to use pagination to browse through many appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have many appointments, the system organizes them into pages for easier browsing:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the page numbers at the bottom of the list to jump to specific pages</li>
              <li>Use the left and right arrows to move to the previous or next page</li>
              <li>The system shows 10 appointments per page by default</li>
              <li>The current page number is highlighted</li>
            </ul>
            <p className="mt-2">
              The pagination system also shows you which range of appointments you're currently viewing (e.g., "Showing 1 to 10 of 50 appointments").
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentHelp; 