/**
 * documentTemplateService.ts
 * Generates structured document templates from student data.
 * No file uploads — all data is stored as JSON in Firestore.
 * The Admin app reads this JSON and renders a paper-like document.
 */

export interface TemplateData {
  templateType: string;          // e.g. "BURSARY_RECEIPT"
  documentTitle: string;         // e.g. "School Fees Payment Receipt"
  institutionName: string;       // "Jigawa State Polytechnic, Dutse"
  departmentName: string;        // Clearance department
  issuedTo: {
    fullName: string;
    matricNumber: string;
    department: string;
    level: string;
    session: string;
    email?: string;
  };
  documentDetails: {
    referenceNumber: string;
    issueDate: string;
    documentType: string;
    remarks: string;
  };
  stageFields: Record<string, string>; // Stage-specific labeled fields
  stageId: number;
  generatedAt: string;           // ISO timestamp
}

type StageTemplateConfig = {
  templateType: string;
  documentTitle: string;
  departmentName: string;
  getStageFields: (data: {
    fullName: string;
    matricNumber: string;
    department: string;
    level: string;
    session: string;
    receiptNumber: string;
    paymentDate: string;
    documentType: string;
    remarks: string;
  }) => Record<string, string>;
};

const STAGE_TEMPLATE_MAP: Record<number, StageTemplateConfig> = {
  1: {
    templateType: 'ADMISSION_VERIFICATION',
    documentTitle: 'Admission Verification Letter',
    departmentName: 'Directorate of Admissions & Registration',
    getStageFields: ({ matricNumber, department, level, session, receiptNumber, paymentDate, documentType }) => ({
      'Programme': department,
      'Mode of Entry': 'UTME / Direct Entry',
      'Level': level,
      'Academic Session': session,
      'Admission Type': documentType,
      'Verification Reference': receiptNumber,
      'Verification Date': paymentDate,
      'Status': 'VERIFIED BY ADMISSIONS OFFICE',
    }),
  },
  2: {
    templateType: 'DEPARTMENTAL_SIGNOFF',
    documentTitle: 'Departmental Sign-off & Clearance Form',
    departmentName: 'Academic Department & School',
    getStageFields: ({ department, level, session, receiptNumber, paymentDate, documentType }) => ({
      'Department': department,
      'Programme Level': level,
      'Session': session,
      'Document Submitted': documentType,
      'HOD Sign-off Ref': receiptNumber,
      'Sign-off Date': paymentDate,
      'Project Defense': 'CLEARED',
      'SIWES / IT Log': 'CLEARED',
    }),
  },
  3: {
    templateType: 'BURSARY_RECEIPT',
    documentTitle: 'School Fees & Bursary Clearance Receipt',
    departmentName: 'Bursary & Accounts Directorate',
    getStageFields: ({ department, level, session, receiptNumber, paymentDate, documentType }) => ({
      'Programme': department,
      'Level': level,
      'Academic Session': session,
      'Payment Category': documentType,
      'Remita / RRR Reference': receiptNumber,
      'Payment Date': paymentDate,
      'Tuition Status': 'FULLY PAID',
      'Clearance Levy': 'PAID',
    }),
  },
  4: {
    templateType: 'LIBRARY_CLEARANCE',
    documentTitle: 'Library Clearance Certificate',
    departmentName: 'Polytechnic Central Library, Dutse',
    getStageFields: ({ department, level, session, receiptNumber, paymentDate, documentType }) => ({
      'Programme': department,
      'Level': level,
      'Session': session,
      'Item Cleared': documentType,
      'Library Ref No': receiptNumber,
      'Clearance Date': paymentDate,
      'Books Outstanding': 'NIL',
      'Library Dues': 'SETTLED',
    }),
  },
  5: {
    templateType: 'SPORTS_CLEARANCE',
    documentTitle: 'Sports & Recreation Unit Clearance Slip',
    departmentName: 'Directorate of Sports & Physical Education',
    getStageFields: ({ department, level, receiptNumber, paymentDate, documentType }) => ({
      'Programme': department,
      'Level': level,
      'Equipment Returned': documentType,
      'Sports Ref No': receiptNumber,
      'Return Date': paymentDate,
      'Gym / Pitch Dues': 'SETTLED',
      'Kit Condition': 'RETURNED IN GOOD CONDITION',
    }),
  },
  6: {
    templateType: 'STUDENT_AFFAIRS_CLEARANCE',
    documentTitle: 'Student Affairs Clearance Certificate',
    departmentName: 'Dean of Student Affairs (DSA)',
    getStageFields: ({ department, level, session, receiptNumber, paymentDate, documentType }) => ({
      'Programme': department,
      'Level': level,
      'Session': session,
      'Document Type': documentType,
      'DSA Reference No': receiptNumber,
      'Clearance Date': paymentDate,
      'Disciplinary Record': 'CLEAN — NO OUTSTANDING CASE',
      'NYSC Eligibility': 'CONFIRMED',
    }),
  },
  7: {
    templateType: 'ACCOMMODATION_CLEARANCE',
    documentTitle: 'Hall of Residence Clearance Slip',
    departmentName: 'Hall of Residence & Accommodation',
    getStageFields: ({ level, receiptNumber, paymentDate, documentType }) => ({
      'Level': level,
      'Hostel Block': 'On Record',
      'Document': documentType,
      'Room Key Ref': receiptNumber,
      'Surrender Date': paymentDate,
      'Damage Assessment': 'NIL',
      'Hall Master Sign-off': 'CLEARED',
    }),
  },
  8: {
    templateType: 'ACADEMIC_BOARD_CERTIFICATE',
    documentTitle: 'Academic Board Final Clearance Certificate',
    departmentName: 'Academic Board & Registry',
    getStageFields: ({ department, level, session, receiptNumber, paymentDate }) => ({
      'Programme': department,
      'Award': level.includes('HND') ? 'Higher National Diploma (HND)' : 'National Diploma (ND)',
      'Session': session,
      'Graduation Ref': receiptNumber,
      'Clearance Date': paymentDate,
      'All 7 Stages': 'CLEARED',
      'Convocation Status': 'ELIGIBLE',
      'Certificate Status': 'APPROVED FOR ISSUANCE',
    }),
  },
};

/**
 * Generates a structured template document from student profile data.
 * This replaces file uploads entirely.
 */
export function generateTemplateData(params: {
  stageId: number;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string;
  session: string;
  email?: string;
  receiptNumber: string;
  paymentDate: string;
  documentType: string;
  remarks: string;
}): TemplateData {
  const config = STAGE_TEMPLATE_MAP[params.stageId] || STAGE_TEMPLATE_MAP[1];

  const stageFields = config.getStageFields({
    fullName: params.fullName,
    matricNumber: params.matricNumber,
    department: params.department,
    level: params.level,
    session: params.session,
    receiptNumber: params.receiptNumber,
    paymentDate: params.paymentDate,
    documentType: params.documentType,
    remarks: params.remarks,
  });

  return {
    templateType: config.templateType,
    documentTitle: config.documentTitle,
    institutionName: 'Jigawa State Polytechnic, Dutse',
    departmentName: config.departmentName,
    issuedTo: {
      fullName: params.fullName,
      matricNumber: params.matricNumber,
      department: params.department,
      level: params.level,
      session: params.session,
      email: params.email,
    },
    documentDetails: {
      referenceNumber: params.receiptNumber,
      issueDate: params.paymentDate,
      documentType: params.documentType,
      remarks: params.remarks || 'Submitted via JSP Digital Clearance Portal',
    },
    stageFields,
    stageId: params.stageId,
    generatedAt: new Date().toISOString(),
  };
}
