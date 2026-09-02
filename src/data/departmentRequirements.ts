import { ClearanceStage, StageRequirement } from '../types/clearance';

export const jigawaPolyDepartments = [
  "Computer Telecommunication Engineering (CTE)",
  "Computer Science",
  "Electrical / Electronic Engineering",
  "Civil Engineering Technology",
  "Mechanical Engineering Technology",
  "Science Laboratory Technology (SLT)",
  "Statistics & Mathematics",
  "Accountancy",
  "Business Administration & Management",
  "Public Administration",
  "Office Technology & Management",
  "Architectural Technology",
  "Building Technology",
  "Quantity Surveying",
  "Mass Communication",
  "Environmental Science",
  "Agricultural Technology",
  "Library & Information Science"
];

export const jigawaPolySchools = [
  "School of Technology & Applied Sciences",
  "School of Engineering Technology",
  "School of Business & Management Studies",
  "School of Environmental Studies",
  "School of General & Remedial Studies"
];

export const departmentRequirements: StageRequirement[] = [
  {
    stageId: 1,
    departmentName: "Directorate of Admissions & Registration",
    primaryDocumentLabel: "JAMB / JSP Admission Letter",
    requiredDocuments: [
      "JAMB Official Admission Letter / JSP Admission Slip",
      "Senior Secondary Certificate (SSCE / WAEC / NECO / NABTEB)",
      "JSP Acceptance Fee Payment E-Receipt",
      "Indigene Certificate & Birth Certificate"
    ],
    guidelines: "All academic credentials and polytechnic admission letters must be verified by the Admissions Directorate before clearance sign-off.",
    defaultReceiptPrefix: "JSP-ADM-"
  },
  {
    stageId: 2,
    departmentName: "Academic Department & School",
    primaryDocumentLabel: "Departmental & ND/HND Project Sign-off",
    requiredDocuments: [
      "Departmental Association Dues Receipt",
      "HOD Clearance Endorsement Form",
      "Final Year ND/HND Project Defense Approval Page",
      "SIWES / Industrial Training Logbook Clearance"
    ],
    guidelines: "Ensure your Project Supervisor, Departmental Clearance Officer, and HOD sign the official departmental clearance certificate.",
    defaultReceiptPrefix: "JSP-DPT-"
  },
  {
    stageId: 3,
    departmentName: "Bursary & Accounts Directorate",
    primaryDocumentLabel: "School Fees & Sundry E-Receipt",
    requiredDocuments: [
      "All Semesters Tuition E-Receipts (Remita RRR / Bank)",
      "Convocation & Clearance Processing Fee Slip",
      "Departmental & Laboratory Levy Receipt"
    ],
    guidelines: "All bank teller receipts and Remita transaction RRR numbers must be clearly legible and reconciled with Bursary records.",
    defaultReceiptPrefix: "JSP-BUR-"
  },
  {
    stageId: 4,
    departmentName: "Polytechnic Central Library, Dutse",
    primaryDocumentLabel: "Library Clearance & Book Return Slip",
    requiredDocuments: [
      "JSP Library Membership / Reader Card",
      "Book Return Slip (0 Books Outstanding)",
      "Library Fee Clearance Slip",
      "E-Library Portal Verification Slip"
    ],
    guidelines: "All borrowed reference books, journals, and project monographs must be returned to the Circulation Desk at the Central Library.",
    defaultReceiptPrefix: "JSP-LIB-"
  },
  {
    stageId: 5,
    departmentName: "Directorate of Sports & Physical Education",
    primaryDocumentLabel: "Sports Kit & Equipment Return Slip",
    requiredDocuments: [
      "Sports Council Clearance Certificate",
      "Polytechnic Games Kit Return Form",
      "Sports Dues Payment Receipt"
    ],
    guidelines: "Surrender all sports tournament gear and verify fitness equipment clearance with the Sports Unit.",
    defaultReceiptPrefix: "JSP-SPT-"
  },
  {
    stageId: 6,
    departmentName: "Dean of Student Affairs (DSA)",
    primaryDocumentLabel: "Hostel & Conduct Clearance Form",
    requiredDocuments: [
      "Hall of Residence Room Clearance Form",
      "Disciplinary Committee Standing Certificate",
      "National Youth Service (NYSC) / Exemption Mobilization Form",
      "JSP Alumni Association Registration Slip"
    ],
    guidelines: "Student Affairs confirms good conduct, hostel damage clearance, and eligibility for NYSC mobilization or exemption certificate.",
    defaultReceiptPrefix: "JSP-DSA-"
  },
  {
    stageId: 7,
    departmentName: "Hall of Residence & Accommodation",
    primaryDocumentLabel: "Hall of Residence Clearance Form",
    requiredDocuments: [
      "Room Key Surrender Receipt",
      "Hostel Damage Assessment Form",
      "Hall Master / Porter Clearance Sign-off"
    ],
    guidelines: "All hostel residents must submit room keys and complete the damage assessment form with the Hall Master before departure.",
    defaultReceiptPrefix: "JSP-HOA-"
  },
  {
    stageId: 8,
    departmentName: "Academic Board & Registry",
    primaryDocumentLabel: "JSP National Diploma / Higher National Diploma Clearance Certificate",
    requiredDocuments: [
      "Consolidated 7-Stage Digital Clearance Seal",
      "Polytechnic ID Card Surrender Receipt",
      "Academic Board Graduation Approval"
    ],
    guidelines: "Upon successful verification of all 7 prerequisite departmental clearances, the Registrar issues the official Jigawa State Polytechnic Clearance Certificate.",
    defaultReceiptPrefix: "JSP-REG-"
  }
];

export function getRequirementForStage(stageId: number): StageRequirement {
  return departmentRequirements.find(r => r.stageId === stageId) || departmentRequirements[0];
}

export function createCleanJigawaPolyStages(): ClearanceStage[] {
  return [
    {
      id: 1,
      stageNumber: 1,
      title: "Admissions & Registration",
      department: "Directorate of Admissions & Registration",
      description: "Upload your JAMB Admission Letter / JSP Admission slip, O'Level Certificate, and Acceptance Fee receipt.",
      status: "READY",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload Credentials",
      primaryDocumentType: "JAMB / JSP Admission Letter",
      isExpandedByDefault: true
    },
    {
      id: 2,
      stageNumber: 2,
      title: "Faculty / Departmental",
      department: "Academic Department & School",
      description: "Final year ND/HND project defense sign-off, departmental dues payment, and HOD endorsement.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload Project Sign-off",
      primaryDocumentType: "Departmental & ND/HND Project Sign-off"
    },
    {
      id: 3,
      stageNumber: 3,
      title: "Bursary & Accounts",
      department: "Bursary & Accounts Directorate",
      description: "Upload bank teller / Remita e-receipts for all semesters tuition and clearance processing fees.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload School Fees Receipt",
      primaryDocumentType: "School Fees & Sundry E-Receipt"
    },
    {
      id: 4,
      stageNumber: 4,
      title: "Polytechnic Library",
      department: "Polytechnic Central Library, Dutse",
      description: "Return all borrowed library books, journals, and surrender your JSP Reader Card.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload Library Slip",
      primaryDocumentType: "Library Clearance & Book Return Slip"
    },
    {
      id: 5,
      stageNumber: 5,
      title: "Sports & Recreation",
      department: "Directorate of Sports & Physical Education",
      description: "Surrender polytechnic sports kit and verify physical education clearance.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload Sports Slip",
      primaryDocumentType: "Sports Kit & Equipment Return Slip"
    },
    {
      id: 6,
      stageNumber: 6,
      title: "Student Affairs",
      department: "Dean of Student Affairs (DSA)",
      description: "Hostel room key surrender, disciplinary conduct clearance, and NYSC/Exemption mobilization form.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload DSA Form",
      primaryDocumentType: "Hostel & Conduct Clearance Form"
    },
    {
      id: 7,
      stageNumber: 7,
      title: "Hall of Residence",
      department: "Hall of Residence & Accommodation",
      description: "Room key surrender, damage assessment, and Hall Master sign-off.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Upload Hostel Form",
      primaryDocumentType: "Hall of Residence Clearance Form"
    },
    {
      id: 8,
      stageNumber: 8,
      title: "Academic Board & Registry",
      department: "Academic Board & Registry",
      description: "Issuance of official Jigawa State Polytechnic National Diploma (ND) / Higher National Diploma (HND) Certificate.",
      status: "LOCKED",
      documentStatus: "NOT_UPLOADED",
      actionButtonText: "Generate Certificate",
      primaryDocumentType: "JSP National Diploma / Higher National Diploma Clearance Certificate"
    }
  ];
}

