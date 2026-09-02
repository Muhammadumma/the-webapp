export type ClearanceStatus =
  | 'COMPLETED'
  | 'ACTION_REQUIRED'
  | 'PENDING'
  | 'READY'
  | 'LOCKED';

export type DocumentStatus =
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING_REVIEW'
  | 'NOT_UPLOADED';

export interface StudentUserEntity {
  matricNumber: string;
  fullName: string;
  email: string;
  department: string;
  level: string;
  session: string;
  loginPin: string;
  clearancePin: string;
  registrationDate: string;
  isLoggedIn: boolean;
}

export interface ClearanceStage {
  id: number;
  stageNumber: number;
  title: string;
  department: string;
  description: string;
  status: ClearanceStatus;
  approvalDate?: string | null;
  rejectionReason?: string | null;
  documentName?: string | null;
  documentStatus: DocumentStatus;
  receiptNumber?: string | null;
  paymentDate?: string | null;
  isActionRequired?: boolean;
  actionButtonText?: string | null;
  isExpandedByDefault?: boolean;
  primaryDocumentType?: string | null;
}

export interface ClearanceDocument {
  id: string | number;
  stageId: number;
  stageTitle: string;
  documentType: string;
  fileName: string;
  fileUri?: string | null;
  fileType?: string; // IMAGE, PDF, SCAN
  receiptNumber?: string | null;
  paymentDate?: string | null;
  uploadDate: string;
  status: DocumentStatus;
  rejectionReason?: string | null;
  remarks?: string | null;
}

export interface ActivityItem {
  id: string | number;
  title: string;
  description: string;
  timeAgo: string;
  status: ClearanceStatus;
  stageId: number;
}

export interface ChatMessage {
  id: string | number;
  isFromUser: boolean;
  text: string;
  timestamp: number;
  rejectedDocName?: string | null;
  rejectedReason?: string | null;
  actionButtonText?: string | null;
  actionStageId?: number | null;
  isTyping?: boolean;
}

export interface AlertItem {
  id: string | number;
  title: string;
  description: string;
  timeAgo: string;
  isUrgent: boolean;
  isRead: boolean;
  stageId?: number | null;
}

export interface RequirementPolicy {
  id: string;
  stageId: string;
  name: string;
  description: string;
  required: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  active: boolean;
}

export interface StudentProfile {
  studentId: string;
  fullName: string;
  email: string;
  faculty: string;
  department: string;
  level: string;
  session: string;
  matricNumber: string;
  clearancePin: string;
  role: string;
  isLoggedIn: boolean;
  loginPin: string;
  lastLoginTime: string;
}

export interface StageRequirement {
  stageId: number;
  departmentName: string;
  primaryDocumentLabel: string;
  requiredDocuments: string[];
  guidelines: string;
  defaultReceiptPrefix: string;
}
