import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

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
  fullName: string;
  specialization?: string;
  qualification?: string;
  licenseNumber?: string;
  digitalSignature?: string;
}

interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionData {
  id: string;
  prescription_date: string;
  diagnosis: string;
  notes: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  items: PrescriptionItem[];
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
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
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tableCol3: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tableCol4: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tableCol5: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tableCol6: {
    width: '25%',
    paddingLeft: 5,
    paddingRight: 5,
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
  prescriptionId: {
    fontSize: 9,
    color: '#777',
    textAlign: 'right',
    marginTop: 5,
  },
});

// Create PDF component
const PrescriptionPDF = ({ 
  prescription, 
  clinicInfo,
  doctorInfo
}: { 
  prescription: PrescriptionData, 
  clinicInfo: ClinicInfo,
  doctorInfo?: DoctorInfo
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Clinic Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Clinic Information */}
            <View style={styles.clinicSection}>
              <Text style={styles.clinicName}>{clinicInfo.clinicName || 'Medical Clinic'}</Text>
              <Text style={styles.clinicInfo}>{clinicInfo.address}</Text>
              <Text style={styles.clinicInfo}>Phone: {clinicInfo.phone} | Email: {clinicInfo.email}</Text>
              {clinicInfo.openingHours && (
                <Text style={styles.clinicInfo}>Hours: {clinicInfo.openingHours}</Text>
              )}
            </View>
            
            {/* Doctor Information */}
            {doctorInfo && (
              <View style={styles.doctorSection}>
                <Text style={styles.doctorName}>Dr. {doctorInfo.fullName}</Text>
                {doctorInfo.qualification && (
                  <Text style={styles.doctorCredentials}>{doctorInfo.qualification}</Text>
                )}
                {doctorInfo.specialization && (
                  <Text style={styles.doctorCredentials}>{doctorInfo.specialization}</Text>
                )}
                {doctorInfo.licenseNumber && (
                  <Text style={styles.doctorCredentials}>License: {doctorInfo.licenseNumber}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Prescription Title */}
        <Text style={styles.title}>PRESCRIPTION</Text>

        {/* Patient Information */}
        <View style={styles.patientInfo}>
          <View style={styles.row}>
            <Text style={styles.label}>Patient:</Text>
            <Text style={styles.value}>{prescription.patient.first_name} {prescription.patient.last_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(prescription.prescription_date)}</Text>
          </View>
          {prescription.diagnosis && (
            <View style={styles.row}>
              <Text style={styles.label}>Diagnosis:</Text>
              <Text style={styles.value}>{prescription.diagnosis}</Text>
            </View>
          )}
          <Text style={styles.prescriptionId}>Prescription ID: {prescription.id}</Text>
        </View>

        {/* Medications Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MEDICATIONS</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <View style={styles.tableCol1}>
                <Text style={styles.tableCellHeader}>#</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.tableCellHeader}>Medication</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCellHeader}>Dosage</Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.tableCellHeader}>Frequency</Text>
              </View>
              <View style={styles.tableCol5}>
                <Text style={styles.tableCellHeader}>Duration</Text>
              </View>
              <View style={styles.tableCol6}>
                <Text style={styles.tableCellHeader}>Instructions</Text>
              </View>
            </View>
            
            {/* Table Rows */}
            {prescription.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol1}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.tableCell}>{item.medication_name}</Text>
                </View>
                <View style={styles.tableCol3}>
                  <Text style={styles.tableCell}>{item.dosage}</Text>
                </View>
                <View style={styles.tableCol4}>
                  <Text style={styles.tableCell}>{item.frequency}</Text>
                </View>
                <View style={styles.tableCol5}>
                  <Text style={styles.tableCell}>{item.duration}</Text>
                </View>
                <View style={styles.tableCol6}>
                  <Text style={styles.tableCell}>{item.instructions || '-'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Notes */}
        {prescription.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.value}>{prescription.notes}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatureContainer}>
          {doctorInfo?.digitalSignature ? (
            <Image 
              src={doctorInfo.digitalSignature} 
              style={styles.signatureImage}
            />
          ) : (
            <View style={styles.signatureLine} />
          )}
          
          {doctorInfo ? (
            <>
              <Text style={styles.doctorNameSignature}>Dr. {doctorInfo.fullName}</Text>
              {doctorInfo.qualification && (
                <Text style={styles.doctorQualification}>{doctorInfo.qualification}</Text>
              )}
              {doctorInfo.specialization && (
                <Text style={styles.doctorInfo}>{doctorInfo.specialization}</Text>
              )}
              {doctorInfo.licenseNumber && (
                <Text style={styles.doctorInfo}>License: {doctorInfo.licenseNumber}</Text>
              )}
            </>
          ) : (
            <Text style={styles.signatureText}>Doctor's Signature</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This prescription is valid for 30 days from the date of issue.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionPDF; 