import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PrescriptionHelp = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="prescription-management">Prescription Management</h2>
      <p className="text-gray-600 mb-6">
        The Prescription Management module allows you to create, track, and manage digital prescriptions for your patients,
        ensuring accurate medication records and professional prescription documents.
      </p>

      <div className="space-y-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Key features of the Prescription Management module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Prescription Management module streamlines the process of creating and managing prescriptions for your patients. 
              With this module, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create detailed digital prescriptions with multiple medications</li>
              <li>Link prescriptions to specific patient visits</li>
              <li>Include diagnosis information and treatment notes</li>
              <li>Generate printable prescription documents</li>
              <li>Maintain a complete history of prescriptions for each patient</li>
              <li>Search and filter prescriptions by patient name, diagnosis, or medication</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For recurring medications, you can easily duplicate a previous prescription and modify it as needed, saving time when creating similar prescriptions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Creating Prescriptions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Creating Prescriptions</CardTitle>
            <CardDescription>
              How to create new prescriptions for patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Creating a New Prescription</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Navigate to the Prescriptions page from the main sidebar
              </li>
              <li>
                Click the <strong>New Prescription</strong> button in the top-right corner
              </li>
              <li>
                Select a patient from the dropdown menu
              </li>
              <li>
                Optionally, select a related patient visit if the prescription is tied to a specific consultation
              </li>
              <li>
                Enter the prescription date (defaults to current date)
              </li>
              <li>
                Enter the diagnosis that necessitates the medication
              </li>
              <li>
                Add any additional notes about the treatment plan
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Adding Medications to a Prescription</h4>
            <p>
              Each prescription can include multiple medications with specific instructions:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                For each medication, enter the following details:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Medication Name:</strong> The name of the prescribed drug</li>
                  <li><strong>Dosage:</strong> The amount to be taken (e.g., "500mg")</li>
                  <li><strong>Frequency:</strong> How often to take the medication (e.g., "Twice daily")</li>
                  <li><strong>Duration:</strong> How long to take the medication (e.g., "7 days")</li>
                  <li><strong>Instructions:</strong> Special instructions for taking the medication (e.g., "Take with food")</li>
                </ul>
              </li>
              <li>
                To add additional medications, click the <strong>Add Medication</strong> button
              </li>
              <li>
                To remove a medication, click the remove button (trash icon) next to the medication entry
              </li>
              <li>
                Once all medications and details are entered, click <strong>Save</strong> to create the prescription
              </li>
            </ol>
            
            <div className="bg-amber-50 p-4 rounded-md mt-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Always verify medication names, dosages, and instructions carefully before saving a prescription to ensure patient safety.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Managing Prescriptions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Managing Prescriptions</CardTitle>
            <CardDescription>
              How to view, edit, and delete prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Viewing Prescriptions</h4>
            <p>
              The Prescriptions page displays a list of all prescriptions you've created, with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Date:</strong> When the prescription was issued</li>
              <li><strong>Patient:</strong> The patient's name</li>
              <li><strong>Diagnosis:</strong> The condition being treated</li>
              <li><strong>Medications:</strong> A list of prescribed medications</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Editing a Prescription</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Find the prescription you want to edit in the list
              </li>
              <li>
                Click the edit button (pencil icon) in the Actions column
              </li>
              <li>
                Update the prescription details as needed
              </li>
              <li>
                Click <strong>Save</strong> to update the prescription
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Deleting a Prescription</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Find the prescription you want to delete in the list
              </li>
              <li>
                Click the delete button (trash icon) in the Actions column
              </li>
              <li>
                Confirm the deletion when prompted
              </li>
            </ol>
            
            <div className="bg-red-50 p-4 rounded-md mt-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting a prescription cannot be undone. Consider keeping prescription records for compliance with medical record retention requirements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Printing Prescriptions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Printing Prescriptions</CardTitle>
            <CardDescription>
              How to generate and print prescription documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ClinicFlow allows you to generate professional prescription documents that can be printed or saved as PDF files:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Find the prescription you want to print in the list
              </li>
              <li>
                Click the print button (printer icon) in the Actions column
              </li>
              <li>
                A print preview will open showing the formatted prescription
              </li>
              <li>
                Click <strong>Print</strong> to send the prescription to your printer
              </li>
              <li>
                Alternatively, you can save the prescription as a PDF by selecting "Save as PDF" in your browser's print dialog
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Prescription Document Format</h4>
            <p>
              The printed prescription includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your clinic's name, address, and contact information</li>
              <li>Your name, qualification, and license number</li>
              <li>Patient's name and details</li>
              <li>Prescription date</li>
              <li>Diagnosis</li>
              <li>List of medications with dosage, frequency, and instructions</li>
              <li>Your digital signature (if configured in Settings)</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure your clinic details and digital signature are configured in the Settings page for them to appear on printed prescriptions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Searching and Filtering Section */}
        <Card>
          <CardHeader>
            <CardTitle>Searching and Filtering</CardTitle>
            <CardDescription>
              How to find specific prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              As your prescription database grows, you can use the search and filter features to quickly find specific prescriptions:
            </p>
            
            <h4 className="font-medium text-lg">Using the Search Bar</h4>
            <p>
              The search bar at the top of the Prescriptions page allows you to search by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Patient name</li>
              <li>Diagnosis</li>
              <li>Medication name</li>
            </ul>
            <p className="mt-2">
              Simply type your search term and the list will automatically filter to show matching prescriptions.
            </p>
            
            <h4 className="font-medium text-lg mt-6">Navigating Large Lists</h4>
            <p>
              For practices with many prescriptions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prescriptions are displayed in pages, with the most recent prescriptions shown first</li>
              <li>Use the pagination controls at the bottom of the list to navigate between pages</li>
              <li>You can adjust the number of prescriptions shown per page</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For a more detailed view of a patient's prescription history, you can also access their prescriptions from their patient profile page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>
              Tips for effective prescription management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Be specific with medication instructions</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Include clear directions about how and when to take medications to ensure patient compliance.
                </p>
              </li>
              <li>
                <strong>Document the diagnosis</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Always include the diagnosis for which the medication is prescribed, which helps with insurance claims and medical record keeping.
                </p>
              </li>
              <li>
                <strong>Check for drug interactions</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Before prescribing multiple medications, check for potential interactions between drugs.
                </p>
              </li>
              <li>
                <strong>Review prescription history</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Check the patient's previous prescriptions to avoid duplications or contradictions in treatment.
                </p>
              </li>
              <li>
                <strong>Use standardized abbreviations</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Use standard medical abbreviations for dosage and frequency to avoid confusion.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrescriptionHelp; 