import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PatientHelp = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="patient-management">Patient Management</h2>
      <p className="text-gray-600 mb-6">
        The Patient Management module allows you to maintain a comprehensive database of all your patients, 
        including their personal information, medical history, and contact details.
      </p>

      <div className="space-y-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Key features of the Patient Management module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Patients page provides a complete system for managing your patient records, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Viewing a list of all patients with essential information</li>
              <li>Adding new patients with comprehensive medical details</li>
              <li>Editing existing patient information</li>
              <li>Searching for specific patients</li>
              <li>Exporting patient records</li>
              <li>Accessing detailed patient profiles</li>
            </ul>
          </CardContent>
        </Card>

        {/* Adding Patients Section */}
        <Card>
          <CardHeader>
            <CardTitle>Adding a New Patient</CardTitle>
            <CardDescription>
              How to register a new patient in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Access the Patients page</strong> from the main navigation menu.
              </li>
              <li>
                <strong>Click the "Add New Patient" button</strong> at the top right of the page.
              </li>
              <li>
                <strong>Fill in the patient details</strong> in the form that appears:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Required fields:</strong> First Name, Last Name</li>
                  <li><strong>Optional fields:</strong> Date of Birth, Gender, Email, Phone, Address</li>
                  <li><strong>Medical information:</strong> Blood Group, Allergies, Medical History</li>
                  <li><strong>Emergency contacts:</strong> Name and Phone number of emergency contact</li>
                </ul>
              </li>
              <li>
                <strong>Click "Add Patient"</strong> to save the new patient record.
              </li>
            </ol>
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Adding complete patient information during registration will make it easier to manage their records later. However, you can always update their information at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Managing Patients Section */}
        <Card>
          <CardHeader>
            <CardTitle>Managing Existing Patients</CardTitle>
            <CardDescription>
              How to view, edit, and manage patient records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Viewing Patient List</h4>
            <p>
              The main Patients page displays a table (on desktop) or cards (on mobile) showing your patients with key information:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Patient name</li>
              <li>Date of birth</li>
              <li>Gender</li>
              <li>Contact information (phone and email)</li>
            </ul>

            <h4 className="font-medium text-lg mt-6">Searching for Patients</h4>
            <p>
              Use the search box at the top of the patient list to quickly find patients by:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name (first or last name)</li>
              <li>Email address</li>
              <li>Phone number</li>
            </ul>

            <h4 className="font-medium text-lg mt-6">Editing Patient Information</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the patient in the list</li>
              <li>Click the edit icon (pencil) or select "Edit Patient" from the dropdown menu</li>
              <li>Update the necessary information in the form</li>
              <li>Click "Update Patient" to save the changes</li>
            </ol>

            <h4 className="font-medium text-lg mt-6">Deleting a Patient</h4>
            <p>
              To delete a patient record:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the patient in the list</li>
              <li>Click the dropdown menu (three vertical dots)</li>
              <li>Select "Delete Patient"</li>
              <li>Confirm the deletion when prompted</li>
            </ol>
            <div className="bg-amber-50 p-4 rounded-md mt-2">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> Deleting a patient record is permanent and cannot be undone. All associated data will be lost.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Accessing Patient Details</CardTitle>
            <CardDescription>
              How to view and work with detailed patient profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              For more detailed information and actions related to a specific patient:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click on the patient's name in the patient list</li>
              <li>This will take you to the Patient Detail page where you can:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>View complete patient information</li>
                  <li>See the patient's appointment history</li>
                  <li>View and manage prescriptions</li>
                  <li>Access billing and invoice information</li>
                  <li>Add clinical notes</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Exporting Patient Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>Exporting Patient Data</CardTitle>
            <CardDescription>
              How to export patient information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To export a patient's data:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the patient in the list</li>
              <li>Click the dropdown menu (three vertical dots)</li>
              <li>Select the export option</li>
              <li>The patient's information will be exported in a structured format</li>
            </ol>
            <div className="bg-blue-50 p-4 rounded-md mt-2">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Exported patient data is useful for referrals, transferring to other systems, or keeping offline records.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Section */}
        <Card>
          <CardHeader>
            <CardTitle>Navigating Large Patient Lists</CardTitle>
            <CardDescription>
              How to use pagination to browse through many patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have many patients, the system organizes them into pages for easier browsing:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the page numbers at the bottom of the list to jump to specific pages</li>
              <li>Use the left and right arrows to move to the previous or next page</li>
              <li>The system shows 10 patients per page by default</li>
              <li>The current page number is highlighted</li>
            </ul>
            <p className="mt-2">
              The pagination system also shows you which range of patients you're currently viewing (e.g., "Showing 1 to 10 of 50 patients").
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientHelp; 