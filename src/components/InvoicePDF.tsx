import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { RegionalData } from '@/components/RegionalSettings';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

// Define types
interface ClinicInfo {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  openingHours?: string;
  description?: string;
}

interface DoctorInfo {
  name: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  signature?: string;
}

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  items: InvoiceItem[];
  currency_code: string;
  currency_symbol: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #333',
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clinicSection: {
    flex: 1,
  },
  doctorSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clinicInfo: {
    fontSize: 10,
    color: '#555',
    marginBottom: 3,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  doctorCredentials: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
    textAlign: 'right',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  patientInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  invoiceInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceInfoColumn: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '25%',
  },
  value: {
    fontSize: 10,
    width: '75%',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
    flexGrow: 0,
  },
  tableRowHeader: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 30,
    flexGrow: 0,
    fontWeight: 'bold',
  },
  tableCol1: {
    width: '5%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tableCol2: {
    width: '45%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tableCol3: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: 'right',
  },
  tableCol4: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: 'right',
  },
  tableCol5: {
    width: '20%',
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: 'right',
  },
  tableCell: {
    fontSize: 9,
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingBottom: 5,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#555',
  },
  signatureContainer: {
    marginTop: 50,
    marginRight: 50,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  signatureImage: {
    width: 150,
    height: 60,
    objectFit: 'contain',
    marginBottom: 5,
  },
  signatureLine: {
    width: 150,
    borderBottom: '1px solid #333',
  },
  signatureText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  doctorInfo: {
    fontSize: 10,
    textAlign: 'right',
  },
  doctorNameSignature: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  doctorQualification: {
    fontSize: 9,
    textAlign: 'right',
    color: '#555',
    marginBottom: 3,
  },
  totalSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    width: 100,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
  },
  statusBadge: {
    padding: 5,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  paidStatus: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  pendingStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  overdueStatus: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  paymentDetailsBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderStyle: 'solid',
    borderRadius: 4,
    backgroundColor: '#f9fafb',
    maxWidth: '50%',
  },
  paymentDetailsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 3,
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  paymentDetailsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '40%',
  },
  paymentDetailsValue: {
    fontSize: 9,
    width: '60%',
  },
  paymentQRCode: {
    width: 80,
    height: 80,
    marginTop: 5,
  },
});

const InvoicePDF = ({ 
  invoice, 
  clinicInfo, 
  doctorInfo,
  regionalData
}: { 
  invoice: InvoiceData, 
  clinicInfo: ClinicInfo,
  doctorInfo: DoctorInfo,
  regionalData?: RegionalData
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    // Format based on currency code
    switch (invoice.currency_code) {
      case 'INR':
        // For Indian Rupee, use INR prefix
        return `INR ${amount.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        })}`;
      
      case 'USD':
        return `$ ${amount.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        })}`;
        
      case 'EUR':
        return `€ ${amount.toLocaleString('de-DE', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        })}`;
        
      case 'GBP':
        return `£ ${amount.toLocaleString('en-GB', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        })}`;
        
      default:
        // For other currencies, use the code as prefix
        const prefix = invoice.currency_symbol || invoice.currency_code;
        return `${prefix} ${amount.toFixed(2)}`;
    }
  };

  const getStatusStyle = () => {
    switch (invoice.status.toLowerCase()) {
      case 'paid':
        return styles.paidStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'overdue':
        return styles.overdueStatus;
      default:
        return styles.pendingStatus;
    }
  };

  // Render payment details based on country
  const renderPaymentDetails = () => {
    if (!regionalData) return null;

    // Common payment fields
    const commonFields = [
      { label: 'Bank Name', value: regionalData.bank_name },
      { label: 'Account Number', value: regionalData.account_number },
    ];

    // Country-specific fields
    let countrySpecificFields = [];
    
    if (invoice.currency_code === 'INR') {
      countrySpecificFields = [
        { label: 'IFSC Code', value: regionalData.ifsc_code },
        { label: 'UPI ID', value: regionalData.upi_id },
        { label: 'GST Number', value: regionalData.gst_number },
      ];
    } else if (invoice.currency_code === 'USD') {
      countrySpecificFields = [
        { label: 'Routing Number', value: regionalData.routing_number },
        { label: 'EIN', value: regionalData.ein },
      ];
    } else if (invoice.currency_code === 'GBP') {
      countrySpecificFields = [
        { label: 'Sort Code', value: regionalData.sort_code },
        { label: 'VAT Number', value: regionalData.vat_number },
      ];
    } else if (invoice.currency_code === 'EUR') {
      countrySpecificFields = [
        { label: 'IBAN', value: regionalData.iban },
        { label: 'BIC/SWIFT', value: regionalData.bic },
        { label: 'VAT Number', value: regionalData.vat_number },
      ];
    } else {
      countrySpecificFields = [
        { label: 'SWIFT Code', value: regionalData.swift_code },
        { label: 'Tax ID', value: regionalData.tax_id },
      ];
    }

    // Filter out empty fields
    const allFields = [...commonFields, ...countrySpecificFields]
      .filter(field => field.value);

    if (allFields.length === 0) return null;

    return (
      <View style={styles.paymentDetailsBox}>
        <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
        {allFields.map((field, index) => (
          <View key={index} style={styles.paymentDetailsRow}>
            <Text style={styles.paymentDetailsLabel}>{field.label}:</Text>
            <Text style={styles.paymentDetailsValue}>{field.value}</Text>
          </View>
        ))}
        {regionalData.upi_qr_code && invoice.currency_code === 'INR' && (
          <View style={{ alignItems: 'center', marginTop: 5 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 3 }}>Scan to Pay</Text>
            <Image src={regionalData.upi_qr_code} style={styles.paymentQRCode} />
          </View>
        )}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with clinic info */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.clinicSection}>
              <Text style={styles.clinicName}>{clinicInfo.clinicName}</Text>
              <Text style={styles.clinicInfo}>{clinicInfo.address}</Text>
              <Text style={styles.clinicInfo}>Phone: {clinicInfo.phone}</Text>
              <Text style={styles.clinicInfo}>Email: {clinicInfo.email}</Text>
              {clinicInfo.openingHours && (
                <Text style={styles.clinicInfo}>Hours: {clinicInfo.openingHours}</Text>
              )}
            </View>
            <View style={styles.doctorSection}>
              <Text style={styles.doctorName}>{doctorInfo.name}</Text>
              <Text style={styles.doctorCredentials}>{doctorInfo.qualification}</Text>
              <Text style={styles.doctorCredentials}>{doctorInfo.specialization}</Text>
              <Text style={styles.doctorCredentials}>Reg No: {doctorInfo.registrationNumber}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View>
          <Text style={styles.title}>INVOICE</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceInfoColumn}>
            <View style={styles.row}>
              <Text style={styles.label}>Patient:</Text>
              <Text style={styles.value}>
                {invoice.patient.first_name} {invoice.patient.last_name}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice #:</Text>
              <Text style={styles.value}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(invoice.invoice_date)}</Text>
            </View>
          </View>
          <View style={styles.invoiceInfoColumn}>
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(invoice.due_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={[styles.statusBadge, getStatusStyle()]}>
                <Text>{invoice.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Invoice Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEMS</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <View style={styles.tableCol1}>
                <Text style={styles.tableCellHeader}>#</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.tableCellHeader}>Description</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCellHeader}>Qty</Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.tableCellHeader}>Unit Price</Text>
              </View>
              <View style={styles.tableCol5}>
                <Text style={styles.tableCellHeader}>Amount</Text>
              </View>
            </View>

            {/* Table Rows */}
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol1}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                </View>
                <View style={styles.tableCol3}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.tableCol4}>
                  <Text style={styles.tableCell}>{formatCurrency(item.unit_price)}</Text>
                </View>
                <View style={styles.tableCol5}>
                  <Text style={styles.tableCell}>{formatCurrency(item.amount)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.tax_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.discount_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(invoice.total_amount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.value}>{invoice.notes}</Text>
          </View>
        )}

        {/* Payment Details Box */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <View style={{ flex: 1 }}>
            {renderPaymentDetails()}
          </View>
          
          {/* Signature */}
          <View style={styles.signatureContainer}>
            {doctorInfo.signature ? (
              <Image src={doctorInfo.signature} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.doctorNameSignature}>{doctorInfo.name}</Text>
            <Text style={styles.doctorQualification}>{doctorInfo.qualification}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 