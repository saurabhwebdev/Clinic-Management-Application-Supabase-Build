import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InvoiceHelp = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="invoice-management">Invoice Management</h2>
      <p className="text-gray-600 mb-6">
        The Invoice Management module allows you to create, track, and manage invoices for your patients,
        ensuring accurate billing records and professional financial documents.
      </p>

      <div className="space-y-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Key features of the Invoice Management module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Invoice Management module streamlines the process of creating and managing invoices for your patients. 
              With this module, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create detailed invoices with multiple line items</li>
              <li>Track payment status (pending, paid, overdue)</li>
              <li>Apply taxes and discounts to invoices</li>
              <li>Generate printable invoice documents</li>
              <li>Maintain a complete history of invoices for each patient</li>
              <li>Search and filter invoices by patient name, status, or date</li>
              <li>Support multiple currencies based on your region settings</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure to set up your region in Settings to ensure correct currency formatting on your invoices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Creating Invoices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Creating Invoices</CardTitle>
            <CardDescription>
              How to create new invoices for patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Creating a New Invoice</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Navigate to the Invoices page from the main sidebar
              </li>
              <li>
                Click the <strong>New Invoice</strong> button in the top-right corner
              </li>
              <li>
                Select a patient from the dropdown menu
              </li>
              <li>
                Set the invoice date (defaults to current date) and due date
              </li>
              <li>
                Select the payment status (pending, paid, or overdue)
              </li>
              <li>
                Add any additional notes for the invoice
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Adding Items to an Invoice</h4>
            <p>
              Each invoice can include multiple items with specific details:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                For each item, enter the following details:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Description:</strong> The name or description of the service/product</li>
                  <li><strong>Quantity:</strong> The number of units</li>
                  <li><strong>Unit Price:</strong> The price per unit</li>
                  <li><strong>Amount:</strong> This will be calculated automatically (Quantity × Unit Price)</li>
                </ul>
              </li>
              <li>
                To add additional items, click the <strong>Add Item</strong> button
              </li>
              <li>
                To remove an item, click the remove button next to the item entry
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Applying Tax and Discount</h4>
            <p>
              You can apply tax and discount to the invoice:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                For tax, select the tax type (percentage or fixed amount) and enter the value
              </li>
              <li>
                For discount, select the discount type (percentage or fixed amount) and enter the value
              </li>
              <li>
                The system will automatically calculate the subtotal, tax amount, discount amount, and total
              </li>
              <li>
                Once all details are entered, click <strong>Create Invoice</strong> to save
              </li>
            </ol>
            
            <div className="bg-amber-50 p-4 rounded-md mt-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Verify all invoice details, especially the amounts and calculations, before saving to ensure accurate billing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Managing Invoices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Managing Invoices</CardTitle>
            <CardDescription>
              How to view, edit, and delete invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium text-lg">Viewing Invoices</h4>
            <p>
              The Invoices page displays a list of all invoices you've created, with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Date:</strong> When the invoice was issued</li>
              <li><strong>Patient:</strong> The patient's name</li>
              <li><strong>Status:</strong> Payment status (pending, paid, or overdue)</li>
              <li><strong>Due Date:</strong> When payment is due</li>
              <li><strong>Total:</strong> The total amount</li>
            </ul>
            
            <h4 className="font-medium text-lg mt-6">Editing an Invoice</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Find the invoice you want to edit in the list
              </li>
              <li>
                Click the edit button (pencil icon) in the Actions column
              </li>
              <li>
                Update the invoice details as needed
              </li>
              <li>
                Click <strong>Update Invoice</strong> to save your changes
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Deleting an Invoice</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Find the invoice you want to delete in the list
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
                <strong>Warning:</strong> Deleting an invoice cannot be undone. Consider keeping invoice records for accounting and tax purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Printing Invoices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Printing Invoices</CardTitle>
            <CardDescription>
              How to generate and print invoice documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ClinicFlow allows you to generate professional invoice documents that can be printed or saved as PDF files:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Find the invoice you want to print in the list
              </li>
              <li>
                Click the print button (file plus icon) in the Actions column
              </li>
              <li>
                A print preview will open showing the formatted invoice
              </li>
              <li>
                Click <strong>Print</strong> to send the invoice to your printer
              </li>
              <li>
                Alternatively, you can save the invoice as a PDF by selecting "Save as PDF" in your browser's print dialog
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Invoice Document Format</h4>
            <p>
              The printed invoice includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your clinic's name, address, and contact information</li>
              <li>Patient's name and details</li>
              <li>Invoice number and date</li>
              <li>Due date</li>
              <li>List of items with description, quantity, unit price, and amount</li>
              <li>Subtotal, tax, discount, and total amount</li>
              <li>Payment status</li>
              <li>Notes (if any)</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure your clinic details are configured in the Settings page for them to appear on printed invoices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Searching and Filtering Section */}
        <Card>
          <CardHeader>
            <CardTitle>Searching and Filtering</CardTitle>
            <CardDescription>
              How to find specific invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              As your invoice database grows, you can use the search feature to quickly find specific invoices:
            </p>
            
            <h4 className="font-medium text-lg">Using the Search Bar</h4>
            <p>
              The search bar at the top of the Invoices page allows you to search by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Patient name</li>
              <li>Invoice status</li>
              <li>Invoice date</li>
            </ul>
            <p className="mt-2">
              Simply type your search term and the list will automatically filter to show matching invoices.
            </p>
            
            <h4 className="font-medium text-lg mt-6">Pagination</h4>
            <p>
              For practices with many invoices:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Invoices are displayed in pages, with 10 invoices per page by default</li>
              <li>Use the pagination controls at the bottom of the list to navigate between pages</li>
              <li>You can see the current range of invoices being displayed (e.g., "Showing 1 to 10 of 50 invoices")</li>
            </ul>
          </CardContent>
        </Card>

        {/* Currency and Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Currency and Regional Settings</CardTitle>
            <CardDescription>
              How currency formatting works in invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ClinicFlow supports multiple currencies based on your regional settings:
            </p>
            
            <h4 className="font-medium text-lg">Setting Up Your Region</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Navigate to the Settings page
              </li>
              <li>
                Select your region from the available options
              </li>
              <li>
                The system will automatically use the appropriate currency symbol and formatting for your invoices
              </li>
            </ol>
            
            <h4 className="font-medium text-lg mt-6">Supported Currency Formats</h4>
            <p>
              The system supports various currency formats, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>USD ($) - United States Dollar</li>
              <li>EUR (€) - Euro</li>
              <li>GBP (£) - British Pound</li>
              <li>INR (₹) - Indian Rupee</li>
              <li>And many more based on the available regions</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you don't see your preferred currency, please contact support to request its addition.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceHelp; 