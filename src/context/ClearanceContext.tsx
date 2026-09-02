import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  ActivityItem,
  AlertItem,
  ChatMessage,
  ClearanceDocument,
  ClearanceStage,
  RequirementPolicy,
  StudentProfile,
  StudentUserEntity
} from '../types/clearance';
import { createCleanJigawaPolyStages, getRequirementForStage } from '../data/departmentRequirements';
import { askGeminiClearanceAssistant } from '../services/geminiService';
import { uploadFileToGitHub, uploadDataUriToGitHub } from '../services/githubStorageService';

interface ClearanceContextType {
  studentProfile: StudentProfile;
  stages: ClearanceStage[];
  documents: ClearanceDocument[];
  activities: ActivityItem[];
  chatMessages: ChatMessage[];
  alerts: AlertItem[];
  selectedTab: number;
  uploadScreenStageId: number | null;
  isAiThinking: boolean;
  isAdminMode: boolean;
  authLoading: boolean;
  requirements: RequirementPolicy[];
  getDynamicRequirementsForStage: (stageId: number) => RequirementPolicy[];
  // Actions
  selectTab: (tab: number) => void;
  openUploadScreen: (stageId?: number) => void;
  closeUploadScreen: () => void;
  submitDocument: (
    stageId: number,
    docName: string,
    receiptNum: string,
    paymentDate: string,
    docType?: string,
    fileUri?: string | null,
    remarks?: string | null,
    pickedFile?: File | null
  ) => Promise<void>;
  deleteDocument: (docId: string | number) => void;
  loginStudent: (email: string, pin: string) => Promise<{ success: boolean; message: string }>;
  registerStudent: (
    matric: string,
    name: string,
    email: string,
    dept: string,
    lvl: string,
    sess: string,
    pin: string
  ) => Promise<{ success: boolean; message: string }>;
  logoutStudent: () => Promise<void>;
  updateStudentProfile: (updated: Partial<StudentProfile>) => void;
  sendChatMessage: (text: string) => Promise<void>;
  markAlertRead: (alertId: string | number) => void;
  toggleAdminMode: () => void;
  adminApproveStage: (stageId: number) => void;
  adminRejectStage: (stageId: number, reason: string) => void;
  resetDemoData: () => void;
}

const ClearanceContext = createContext<ClearanceContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'jsp_clearance_';
const STORAGE_VERSION = 'v4'; // increment when stage order changes

// Clear stale localStorage data if storage version changed
const storedVersion = localStorage.getItem(`${STORAGE_KEY_PREFIX}version`);
if (storedVersion !== STORAGE_VERSION) {
  ['stages', 'documents', 'activities', 'alerts', 'chat', 'profile'].forEach(k => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${k}`);
  });
  localStorage.setItem(`${STORAGE_KEY_PREFIX}version`, STORAGE_VERSION);
}

const getStageKey = (stageId: number): string => {
  switch (stageId) {
    case 1: return 'admission';
    case 2: return 'faculty';
    case 3: return 'bursary';
    case 4: return 'library';
    case 5: return 'sports';
    case 6: return 'student_affairs';
    case 7: return 'accommodation';
    case 8: return 'graduation';
    default: return 'admission';
  }
};

export const ClearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stages, setStages] = useState<ClearanceStage[]>(() => {
    const canonical = createCleanJigawaPolyStages();
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stages`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return canonical.map((cleanStage) => {
            const st = parsed.find((s: any) => s.id === cleanStage.id || s.stageNumber === cleanStage.id);
            return st
              ? {
                  ...cleanStage,
                  status: st.status || cleanStage.status,
                  documentStatus: st.documentStatus || cleanStage.documentStatus,
                  approvalDate: st.approvalDate,
                  rejectionReason: st.rejectionReason,
                  documentName: st.documentName,
                  receiptNumber: st.receiptNumber,
                  paymentDate: st.paymentDate,
                  isActionRequired: st.isActionRequired,
                  actionButtonText: st.actionButtonText || cleanStage.actionButtonText,
                }
              : cleanStage;
          });
        }
      } catch (e) {
        console.warn('Stages parse warning:', e);
      }
    }
    return canonical;
  });

  const [documents, setDocuments] = useState<ClearanceDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}documents`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}alerts`);
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}chat`);
    return saved ? JSON.parse(saved) : [];
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
    return saved ? JSON.parse(saved) : {
      studentId: "",
      fullName: "",
      email: "",
      faculty: "",
      department: "",
      level: "",
      session: "",
      matricNumber: "",
      clearancePin: "",
      role: "student",
      isLoggedIn: false,
      loginPin: "",
      lastLoginTime: ""
    };
  });

  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [uploadScreenStageId, setUploadScreenStageId] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<RequirementPolicy[]>([]);

  const getDynamicRequirementsForStage = (stageId: number): RequirementPolicy[] => {
    const key = getStageKey(stageId);
    return requirements.filter(
      (r) => (r.stageId === key || r.stageId === String(stageId)) && r.active
    );
  };

  // Helper to safely write clearance state into Firestore
  const syncClearanceToFirestore = async (
    currentUid?: string,
    currentMatric?: string,
    updatedStages?: ClearanceStage[],
    updatedDocs?: ClearanceDocument[],
    updatedActivities?: ActivityItem[],
    updatedAlerts?: AlertItem[],
    updatedProfile?: Partial<StudentProfile>
  ) => {
    const uid = currentUid || auth.currentUser?.uid || studentProfile.studentId || studentProfile.matricNumber;
    const matric = currentMatric || studentProfile.matricNumber || "";
    if (!uid && !matric) return;

    try {
      const docKey = uid || matric.replace(/\//g, '_');
      const payload: any = {
        uid: uid || "",
        matricNumber: matric,
        fullName: updatedProfile?.fullName || studentProfile.fullName,
        department: updatedProfile?.department || studentProfile.department,
        level: updatedProfile?.level || studentProfile.level,
        session: updatedProfile?.session || studentProfile.session,
        clearancePin: updatedProfile?.clearancePin || studentProfile.clearancePin,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      };

      if (updatedStages) {
        payload.stages = updatedStages;
        payload.completedCount = updatedStages.filter(s => s.status === 'COMPLETED').length;
        payload.isFullyCleared = payload.completedCount === updatedStages.length;
      }
      if (updatedDocs) {
        // Strip out huge data URIs in records document to keep under Firestore 1MB doc limit
        payload.documents = updatedDocs.map(d => ({
          ...d,
          fileUri: d.fileUri && d.fileUri.length > 50000 ? '[Stored in document record]' : d.fileUri
        }));
      }
      if (updatedActivities) payload.activities = updatedActivities;
      if (updatedAlerts) payload.alerts = updatedAlerts;

      await setDoc(doc(db, "jsp_clearance_records", docKey), payload, { merge: true });
      await setDoc(doc(db, "jsp_students", docKey), payload, { merge: true });
      
      if (matric && matric.replace(/\//g, '_') !== docKey) {
        await setDoc(doc(db, "jsp_students", matric.replace(/\//g, '_')), payload, { merge: true });
      }
    } catch (err) {
      console.warn("Firestore syncClearanceToFirestore warning:", err);
    }
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}stages`, JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}alerts`, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}chat`, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(studentProfile));
  }, [studentProfile]);

  // Listen to Firebase Auth state and real-time Firestore synchronization
  useEffect(() => {
    let unsubscribeRecord: (() => void) | null = null;
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeDocs: (() => void) | null = null;
    let unsubscribeSubmissions: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "jsp_students", firebaseUser.uid);
          const recordDocRef = doc(db, "jsp_clearance_records", firebaseUser.uid);
          const docsQuery = query(collection(db, "jsp_documents"), where("studentUid", "==", firebaseUser.uid));

          // Real-time listener on student user profile
          unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
            if (userSnap.exists()) {
              const data = userSnap.data();
              setStudentProfile(prev => ({
                ...prev,
                studentId: data.matricNumber || firebaseUser.uid.slice(0, 10),
                fullName: data.fullName || firebaseUser.displayName || prev.fullName || "",
                email: data.email || firebaseUser.email || prev.email,
                faculty: data.faculty || prev.faculty || "School of Technology & Applied Sciences",
                department: data.department || prev.department || "",
                level: data.level || prev.level || "ND I",
                session: data.session || prev.session || "2024/2025 Academic Session",
                matricNumber: data.matricNumber || prev.matricNumber || "",
                clearancePin: data.clearancePin || prev.clearancePin || "",
                role: "student",
                isLoggedIn: true,
                loginPin: "******",
                lastLoginTime: "Just now"
              }));
            }
          });

          // Real-time listener on clearance stages and records
          unsubscribeRecord = onSnapshot(recordDocRef, (recordSnap) => {
            if (recordSnap.exists()) {
              const recData = recordSnap.data();
              if (recData.stages && Array.isArray(recData.stages)) {
                const canonical = createCleanJigawaPolyStages();
                const normalized = canonical.map((cleanStage) => {
                  const saved = recData.stages.find(
                    (s: any) => s.id === cleanStage.id || s.stageNumber === cleanStage.id
                  );
                  return saved
                    ? {
                        ...cleanStage,
                        status: saved.status || cleanStage.status,
                        documentStatus: saved.documentStatus || cleanStage.documentStatus,
                        approvalDate: saved.approvalDate,
                        rejectionReason: saved.rejectionReason,
                        documentName: saved.documentName,
                        receiptNumber: saved.receiptNumber,
                        paymentDate: saved.paymentDate,
                        isActionRequired: saved.isActionRequired,
                        actionButtonText: saved.actionButtonText || cleanStage.actionButtonText,
                      }
                    : cleanStage;
                });
                setStages(normalized);
              }
              if (recData.documents && Array.isArray(recData.documents)) {
                setDocuments(recData.documents);
              }
              if (recData.activities && Array.isArray(recData.activities)) {
                setActivities(recData.activities);
              }
              if (recData.alerts && Array.isArray(recData.alerts)) {
                setAlerts(recData.alerts);
              }
            }
          });

          // Real-time listener on individual submitted documents
          unsubscribeDocs = onSnapshot(docsQuery, (docsSnap) => {
            if (!docsSnap.empty) {
              const loadedDocs: ClearanceDocument[] = docsSnap.docs.map(d => {
                const docData = d.data();
                return {
                  id: docData.id || d.id,
                  stageId: docData.stageId || 1,
                  stageTitle: docData.stageTitle || `Stage ${docData.stageId || 1}`,
                  documentType: docData.documentType || docData.docType || "PDF Document",
                  fileName: docData.fileName || docData.docName || "Submitted Document",
                  uploadDate: docData.uploadDate || new Date().toISOString(),
                  receiptNumber: docData.receiptNumber || "",
                  paymentDate: docData.paymentDate || "",
                  status: (docData.status === "APPROVED" ? "APPROVED" : docData.status === "REJECTED" ? "REJECTED" : "PENDING_REVIEW") as any,
                  fileUri: docData.fileUri || null,
                  remarks: docData.remarks || "Uploaded via Portal"
                };
              });
              setDocuments(loadedDocs);
            }
          });

          // Real-time listener on admin submissions collection for instant review reflection
          const submissionsQuery = query(collection(db, "submissions"), where("studentId", "==", firebaseUser.uid));
          unsubscribeSubmissions = onSnapshot(submissionsQuery, (subSnap) => {
            if (subSnap.empty) return;

            const stageMap: Record<string, number> = {
              admission: 1,
              faculty: 2,
              bursary: 3,
              library: 4,
              sports: 5,
              student_affairs: 6,
              accommodation: 7,
              graduation: 8
            };

            // Collect all reviewed statuses from submissions
            const approvedStages = new Set<number>();
            const rejectedStages = new Map<number, string>();

            subSnap.docs.forEach((d) => {
              const sub = d.data();
              const matchedStageId = stageMap[sub.stageId] || 1;
              if (sub.status === 'approved') {
                approvedStages.add(matchedStageId);
              } else if (sub.status === 'rejected') {
                rejectedStages.set(matchedStageId, sub.rejectionReason || sub.reviewComment || 'Document requires re-submission');
              }
            });

            // Apply all stage status changes in a single pass
            setStages(prevStages => prevStages.map(s => {
              if (approvedStages.has(s.id)) {
                return {
                  ...s,
                  status: 'COMPLETED' as const,
                  documentStatus: 'APPROVED' as const,
                  rejectionReason: null,
                  isActionRequired: false,
                  approvalDate: 'Verified by Officer'
                };
              }
              if (rejectedStages.has(s.id)) {
                return {
                  ...s,
                  status: 'ACTION_REQUIRED' as const,
                  documentStatus: 'REJECTED' as const,
                  rejectionReason: rejectedStages.get(s.id)!,
                  isActionRequired: true,
                  actionButtonText: 'Re-upload Now'
                };
              }
              // Unlock the next stage after the highest approved stage
              const prevStageId = s.id - 1;
              if (prevStageId > 0 && approvedStages.has(prevStageId) && s.status === 'LOCKED') {
                return { ...s, status: 'READY' as const, actionButtonText: 'Start Clearance' };
              }
              return s;
            }));

            // Push deduplicated alerts for newly approved stages (one per stage)
            setAlerts(prevAlerts => {
              let updated = [...prevAlerts];
              approvedStages.forEach(stageId => {
                const alreadyExists = updated.some(a =>
                  (a as any).stageId === stageId && a.title?.includes('Approved')
                );
                if (!alreadyExists) {
                  const stageName = Object.entries(stageMap).find(([, v]) => v === stageId)?.[0] || `Stage ${stageId}`;
                  updated = [
                    {
                      id: `approval_${stageId}_${Date.now()}`,
                      title: `Stage ${stageId} Clearance Approved`,
                      message: `Your submission for Stage ${stageId} (${stageName.replace('_', ' ')}) has been verified and approved.`,
                      type: 'success' as const,
                      read: false,
                      urgent: false,
                      stageId,
                      createdAt: new Date().toISOString()
                    } as any,
                    ...updated.filter(a => !((a as any).stageId === stageId && a.title?.includes('Approved')))
                  ];
                }
              });
              rejectedStages.forEach((reason, stageId) => {
                const alreadyExists = updated.some(a =>
                  (a as any).stageId === stageId && a.title?.includes('Rejected')
                );
                if (!alreadyExists) {
                  updated = [
                    {
                      id: `rejection_${stageId}_${Date.now()}`,
                      title: `Stage ${stageId}: Action Required`,
                      message: reason,
                      type: 'error' as const,
                      read: false,
                      urgent: true,
                      stageId,
                      createdAt: new Date().toISOString()
                    } as any,
                    ...updated
                  ];
                }
              });
              return updated;
            });
          });

        } catch (e) {
          console.warn("Firestore auth sync info:", e);
        }
      } else {
        if (unsubscribeRecord) {
          unsubscribeRecord();
          unsubscribeRecord = null;
        }
        if (unsubscribeUser) {
          unsubscribeUser();
          unsubscribeUser = null;
        }
        if (unsubscribeDocs) {
          unsubscribeDocs();
          unsubscribeDocs = null;
        }
        if (unsubscribeSubmissions) {
          unsubscribeSubmissions();
          unsubscribeSubmissions = null;
        }
      }
    });

    // Global requirements listener (live sync with Admin Stage Document Requirements Policy)
    const unsubscribeRequirements = onSnapshot(
      collection(db, 'requirements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<RequirementPolicy, 'id'>),
          }));
          setRequirements(loaded);
        }
      },
      (err) => {
        console.warn('Requirements listener notice:', err);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeRequirements();
      if (unsubscribeRecord) unsubscribeRecord();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeDocs) unsubscribeDocs();
      if (unsubscribeSubmissions) unsubscribeSubmissions();
    };
  }, []);

  const selectTab = (tab: number) => {
    setSelectedTab(tab);
    setUploadScreenStageId(null);
  };

  const openUploadScreen = (stageId: number = 1) => {
    setUploadScreenStageId(stageId);
  };

  const closeUploadScreen = () => {
    setUploadScreenStageId(null);
  };

  const submitDocument = async (
    stageId: number,
    docName: string,
    receiptNum: string,
    paymentDate: string,
    docType?: string,
    fileUri?: string | null,
    remarks?: string | null,
    pickedFile?: File | null
  ) => {
    const currentStage = stages.find(s => s.id === stageId) || stages[0];
    const req = getRequirementForStage(stageId);
    const selectedDocType = docType || req.primaryDocumentLabel;
    const documentId = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const uid = auth.currentUser?.uid || studentProfile.studentId || 'guest';
    const stageKey = getStageKey(stageId);

    // ── STEP 1: Upload file to GitHub (preferred) or keep data URI (camera) ──
    let resolvedFileUri: string | null = fileUri || null;
    let githubPath: string | null = null;

    try {
      if (pickedFile) {
        // Real File object → push to GitHub repo
        const result = await uploadFileToGitHub(pickedFile, uid, stageKey);
        resolvedFileUri = result.downloadUrl;
        githubPath = result.path;
        console.log('✅ File uploaded to GitHub:', result.downloadUrl);
      } else if (fileUri && fileUri.startsWith('data:')) {
        // Camera data URI → push to GitHub repo
        const ext = fileUri.split(';')[0].split('/')[1] || 'jpg';
        const cameraFileName = `Camera_${Date.now()}.${ext}`;
        const result = await uploadDataUriToGitHub(fileUri, cameraFileName, uid, stageKey);
        resolvedFileUri = result.downloadUrl;
        githubPath = result.path;
        console.log('✅ Camera image uploaded to GitHub:', result.downloadUrl);
      }
    } catch (uploadErr: any) {
      console.error('GitHub upload error:', uploadErr);
      // Throw so the UI can show an error — do not silently swallow
      throw new Error(`File upload failed: ${uploadErr.message || 'GitHub API error'}. Please try again.`);
    }

    const newDoc: ClearanceDocument = {
      id: documentId,
      stageId,
      stageTitle: currentStage.title,
      documentType: selectedDocType,
      fileName: docName,
      fileUri: resolvedFileUri,
      receiptNumber: receiptNum || `${req.defaultReceiptPrefix}${Math.floor(1000 + Math.random() * 9000)}`,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      uploadDate: "Just now",
      status: "PENDING_REVIEW",
      remarks: remarks || "Uploaded via JSP Digital Portal"
    };

    const nextDocuments = [newDoc, ...documents];
    setDocuments(nextDocuments);

    const nextStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          status: "PENDING" as const,
          documentName: docName,
          documentStatus: "PENDING_REVIEW" as const,
          receiptNumber: newDoc.receiptNumber,
          paymentDate: newDoc.paymentDate,
          rejectionReason: null,
          isActionRequired: false,
          actionButtonText: "Under Review",
          approvalDate: "Submitted today"
        };
      }
      return s;
    });
    setStages(nextStages);

    const nextActivities: ActivityItem[] = [
      {
        id: Date.now(),
        title: `${currentStage.title} - ${selectedDocType} Uploaded`,
        description: `File '${docName}' (Ref: ${newDoc.receiptNumber}) submitted for clearance audit.`,
        timeAgo: "Just now",
        status: "PENDING",
        stageId
      },
      ...activities
    ];
    setActivities(nextActivities);

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        isFromUser: false,
        text: `Your document **${docName}** (${selectedDocType}) for **${currentStage.title}** has been securely submitted! JSP Clearance Officers will audit your submission (Ref: \`${newDoc.receiptNumber}\`).`,
        timestamp: Date.now()
      }
    ]);

    setUploadScreenStageId(null);

    // Save individual document record to Firestore collections for real-time admin review
    try {
      const uid = auth.currentUser?.uid || studentProfile.studentId || studentProfile.matricNumber || 'guest';
      const stageKey = getStageKey(stageId);
      const fileExt = docName.split('.').pop()?.toLowerCase() || 'pdf';
      const fileSize = pickedFile ? pickedFile.size : fileUri ? Math.round(fileUri.length * 0.75) : 250000;

      // 1. Primary document record with GitHub Raw Download URL
      const firestoreDocPayload = {
        id: documentId,
        studentUid: uid,
        matricNumber: studentProfile.matricNumber || '',
        studentName: studentProfile.fullName || '',
        department: studentProfile.department || '',
        stageId,
        stageTitle: currentStage.title,
        documentType: selectedDocType,
        fileName: docName,
        fileType: fileExt,
        fileSize,
        receiptNumber: newDoc.receiptNumber,
        paymentDate: newDoc.paymentDate,
        uploadDate: new Date().toISOString(),
        status: "PENDING_REVIEW",
        remarks: newDoc.remarks,
        fileUri: resolvedFileUri,
        hasAttachment: !!resolvedFileUri,
        createdAt: Date.now()
      };
      await setDoc(doc(db, "jsp_documents", String(documentId)), firestoreDocPayload, { merge: true });

      // 2. Cross-compatible submission record for Admin review DB
      const submissionRecord = {
        id: String(documentId),
        studentId: uid,
        studentName: studentProfile.fullName || 'Student',
        matricNumber: studentProfile.matricNumber || '',
        departmentName: studentProfile.department || 'Computer Science',
        requirementId: `req_${stageKey}_${stageId}`,
        requirementName: selectedDocType,
        stageId: stageKey,
        stageName: currentStage.title,
        fileUrl: resolvedFileUri || '',
        fileName: docName,
        fileType: fileExt,
        fileSize,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "submissions", String(documentId)), submissionRecord, { merge: true });

      // 3. Sync student record for Admin DB
      const studentAdminRecord = {
        id: uid,
        studentId: studentProfile.matricNumber || uid,
        fullName: studentProfile.fullName || 'Student',
        matricNumber: studentProfile.matricNumber || '',
        email: studentProfile.email || '',
        departmentId: 'dept_1',
        departmentName: studentProfile.department || 'Computer Science',
        level: studentProfile.level || 'ND I',
        session: studentProfile.session || '2024/2025 Academic Session',
        clearanceStatus: 'in_progress',
        active: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "students", uid), studentAdminRecord, { merge: true });

      // 4. Send alert to Admin notifications DB
      const adminNotifId = `notif_${Date.now()}`;
      const adminNotif = {
        id: adminNotifId,
        studentId: uid,
        title: `New Clearance Upload: ${currentStage.title}`,
        message: `${studentProfile.fullName} (${studentProfile.matricNumber}) uploaded ${selectedDocType} for review.`,
        type: 'submission',
        read: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "notifications", adminNotifId), adminNotif, { merge: true });

      console.log("Document successfully written to Firestore 'jsp_documents' and 'submissions':", documentId);
    } catch (fireErr) {
      console.warn("Firestore document write error:", fireErr);
    }

    // Sync all progress records to Firestore
    syncClearanceToFirestore(
      auth.currentUser?.uid || studentProfile.studentId,
      studentProfile.matricNumber,
      nextStages,
      nextDocuments,
      nextActivities,
      alerts
    );
  };

  const deleteDocument = async (docId: string | number) => {
    const nextDocs = documents.filter(d => d.id !== docId);
    setDocuments(nextDocs);

    try {
      await deleteDoc(doc(db, "jsp_documents", String(docId)));
    } catch (e) {
      console.warn("Firestore delete document warning:", e);
    }

    syncClearanceToFirestore(
      auth.currentUser?.uid || studentProfile.studentId,
      studentProfile.matricNumber,
      stages,
      nextDocs,
      activities,
      alerts
    );
  };

  const getFirebaseAuthErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is improperly formatted.';
      case 'auth/user-not-found':
        return 'No registered account found with this email. Please register first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in provider is disabled in Firebase Console. Please enable Email/Password under Authentication > Sign-in method.';
      case 'auth/network-request-failed':
        return 'Network request failed. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Access is temporarily disabled. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled by an administrator.';
      default:
        return error?.message || 'Firebase authentication failed. Please check your credentials.';
    }
  };

  const loginStudent = async (email: string, pin: string): Promise<{ success: boolean; message: string }> => {
    setAuthLoading(true);
    const trimmedEmail = email.trim();
    const trimmedPin = pin.trim();

    if (!trimmedEmail || !trimmedPin) {
      setAuthLoading(false);
      return { success: false, message: "Please enter your Email and Password." };
    }

    try {
      const emailToUse = trimmedEmail.includes("@") ? trimmedEmail : `${trimmedEmail}@jigawapoly.edu.ng`;
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, trimmedPin);
      const user = userCredential.user;

      // Check Firestore record
      let loadedProfile: StudentProfile | null = null;
      try {
        const userDocRef = doc(db, "jsp_students", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          loadedProfile = {
            studentId: data.matricNumber || user.uid.slice(0, 10),
            fullName: data.fullName || user.displayName || "Student",
            email: data.email || user.email || emailToUse,
            faculty: data.faculty || "School of Technology & Applied Sciences",
            department: data.department || "Computer Science",
            level: data.level || "ND II",
            session: data.session || "2024/2025 Academic Session",
            matricNumber: data.matricNumber || "ND/CTE/M/24/0001",
            clearancePin: data.clearancePin || `JSP-CLR-${Math.floor(1000 + Math.random() * 9000)}`,
            role: "student",
            isLoggedIn: true,
            loginPin: trimmedPin,
            lastLoginTime: "Just now"
          };

          if (data.stages && Array.isArray(data.stages)) setStages(data.stages);
          if (data.documents && Array.isArray(data.documents)) setDocuments(data.documents);
          if (data.activities && Array.isArray(data.activities)) setActivities(data.activities);
          if (data.alerts && Array.isArray(data.alerts)) setAlerts(data.alerts);
        }
      } catch (fErr) {
        console.warn("Firestore fetch on login warning:", fErr);
      }

      const defaultName = user.displayName || (trimmedEmail.includes("@") ? trimmedEmail.split("@")[0].replace(/[._]/g, ' ').toUpperCase() : "Student");

      const profileObj: StudentProfile = loadedProfile || {
        studentId: user.uid.slice(0, 10),
        fullName: defaultName,
        email: user.email || emailToUse,
        faculty: "School of Technology & Applied Sciences",
        department: "Computer Science",
        level: "ND II",
        session: "2024/2025 Academic Session",
        matricNumber: "ND/CTE/M/24/0001",
        clearancePin: `JSP-CLR-${Math.floor(1000 + Math.random() * 9000)}`,
        role: "student",
        isLoggedIn: true,
        loginPin: trimmedPin,
        lastLoginTime: "Just now"
      };

      setStudentProfile(profileObj);
      setAuthLoading(false);
      return { success: true, message: `Welcome back, ${profileObj.fullName}!` };
    } catch (firebaseErr: any) {
      console.error("Firebase sign in error:", firebaseErr);
      setAuthLoading(false);
      return { success: false, message: getFirebaseAuthErrorMessage(firebaseErr) };
    }
  };

  const registerStudent = async (
    matric: string,
    name: string,
    email: string,
    dept: string,
    lvl: string,
    sess: string,
    pin: string
  ): Promise<{ success: boolean; message: string }> => {
    setAuthLoading(true);
    const trimmedMatric = matric.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPin = pin.trim();

    if (!trimmedMatric || !trimmedName || !trimmedEmail || !trimmedPin) {
      setAuthLoading(false);
      return { success: false, message: "Please fill in all required fields." };
    }

    if (trimmedPin.length < 6) {
      setAuthLoading(false);
      return { success: false, message: "Password must be at least 6 characters." };
    }

    const cleanStages = createCleanJigawaPolyStages();
    const initialActivities: ActivityItem[] = [
      {
        id: Date.now(),
        title: "Clearance Ledger Registered",
        description: `Clearance ledger initialized for ${trimmedName} (${trimmedMatric}) at Jigawa State Polytechnic Dutse.`,
        timeAgo: "Just now",
        status: "READY",
        stageId: 1
      }
    ];
    const initialAlerts: AlertItem[] = [
      {
        id: Date.now(),
        title: "Stage 1: Admission Credentials Required",
        description: "Please upload your JAMB Admission Letter / JSP Admission slip and acceptance receipt to begin clearance.",
        timeAgo: "Just now",
        isUrgent: true,
        isRead: false,
        stageId: 1
      }
    ];

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPin);
      const user = userCredential.user;

      await updateProfile(user, { displayName: trimmedName });

      const randPin = `JSP-CLR-${Math.floor(1000 + Math.random() * 9000)}`;
      const studentData = {
        uid: user.uid,
        matricNumber: trimmedMatric,
        fullName: trimmedName,
        email: trimmedEmail,
        faculty: "School of Technology & Applied Sciences",
        department: dept,
        level: lvl,
        session: sess,
        clearancePin: randPin,
        registrationDate: new Date().toISOString(),
        serverTimestamp: Date.now(),
        stages: cleanStages,
        documents: [],
        activities: initialActivities,
        alerts: initialAlerts,
        completedCount: 0,
        isFullyCleared: false
      };

      // Write to both uid doc and matric doc in Firestore
      await setDoc(doc(db, "jsp_students", user.uid), studentData);
      await setDoc(doc(db, "jsp_students", trimmedMatric.replace(/\//g, '_')), studentData);
      await setDoc(doc(db, "jsp_clearance_records", user.uid), studentData);

      const profileObj: StudentProfile = {
        studentId: trimmedMatric,
        fullName: trimmedName,
        email: trimmedEmail,
        faculty: "School of Technology & Applied Sciences",
        department: dept,
        level: lvl,
        session: sess,
        matricNumber: trimmedMatric,
        clearancePin: randPin,
        role: "student",
        isLoggedIn: true,
        loginPin: trimmedPin,
        lastLoginTime: "Just now"
      };

      setStudentProfile(profileObj);
      setStages(cleanStages);
      setDocuments([]);
      setActivities(initialActivities);
      setAlerts(initialAlerts);
      setAuthLoading(false);
      return { success: true, message: `Registration successful! Clearance initialized for ${trimmedName}.` };
    } catch (firebaseErr: any) {
      console.error("Firebase registration error:", firebaseErr);
      setAuthLoading(false);
      return { success: false, message: getFirebaseAuthErrorMessage(firebaseErr) };
    }
  };

  const logoutStudent = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}stages`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}documents`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}activities`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}alerts`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}chat`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}profile`);
    setStages(createCleanJigawaPolyStages());
    setDocuments([]);
    setActivities([]);
    setAlerts([]);
    setChatMessages([]);
    setStudentProfile({
      studentId: "",
      fullName: "",
      email: "",
      faculty: "",
      department: "",
      level: "",
      session: "",
      matricNumber: "",
      clearancePin: "",
      role: "student",
      isLoggedIn: false,
      loginPin: "",
      lastLoginTime: ""
    });
    setSelectedTab(0);
    setUploadScreenStageId(null);
  };

  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile(prev => {
      const next = { ...prev, ...updated };
      syncClearanceToFirestore(
        auth.currentUser?.uid || next.studentId,
        next.matricNumber,
        stages,
        documents,
        activities,
        alerts,
        next
      );
      return next;
    });
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      isFromUser: true,
      text: text.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const responseText = await askGeminiClearanceAssistant(text, stages, studentProfile);
      const hasUploadAction =
        responseText.toLowerCase().includes('upload') ||
        responseText.toLowerCase().includes('re-upload') ||
        text.toLowerCase().includes('upload') ||
        text.toLowerCase().includes('bursary');

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          isFromUser: false,
          text: responseText,
          timestamp: Date.now(),
          actionButtonText: hasUploadAction ? "Upload Document" : null,
          actionStageId: hasUploadAction ? 1 : null
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const markAlertRead = (alertId: string | number) => {
    setAlerts(prev => {
      const next = prev.map(a => a.id === alertId ? { ...a, isRead: true } : a);
      syncClearanceToFirestore(
        auth.currentUser?.uid || studentProfile.studentId,
        studentProfile.matricNumber,
        stages,
        documents,
        activities,
        next
      );
      return next;
    });
  };

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
  };

  const adminApproveStage = async (stageId: number) => {
    const current = stages.find(s => s.id === stageId);
    if (!current) return;

    const nextStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          status: "COMPLETED" as const,
          documentStatus: "APPROVED" as const,
          rejectionReason: null,
          isActionRequired: false,
          approvalDate: "Today, Verified"
        };
      }
      if (s.id === stageId + 1 && s.status === 'LOCKED') {
        return {
          ...s,
          status: "PENDING" as const,
          actionButtonText: "Start Clearance"
        };
      }
      return s;
    });
    setStages(nextStages);

    const nextActivities: ActivityItem[] = [
      {
        id: Date.now(),
        title: `${current.title} Clearance Approved`,
        description: `Jigawa State Polytechnic Officer approved all uploaded credentials. Stage 100% verified.`,
        timeAgo: "Just now",
        status: "COMPLETED",
        stageId
      },
      ...activities
    ];
    setActivities(nextActivities);

    const nextAlerts: AlertItem[] = [
      {
        id: Date.now(),
        title: `${current.title} Approved`,
        description: `Congratulations! Your clearance for ${current.title} is now verified and signed off.`,
        timeAgo: "Just now",
        isUrgent: false,
        isRead: false,
        stageId
      },
      ...alerts
    ];
    setAlerts(nextAlerts);

    // Update document status in documents list
    const nextDocs = documents.map(d => d.stageId === stageId ? { ...d, status: "APPROVED" as const } : d);
    setDocuments(nextDocs);

    // Also update in Firestore jsp_documents collection
    const targetDoc = documents.find(d => d.stageId === stageId);
    if (targetDoc) {
      try {
        await setDoc(doc(db, "jsp_documents", String(targetDoc.id)), {
          status: "APPROVED",
          approvalDate: new Date().toISOString(),
          approvedBy: "Clearance Officer"
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore admin approve doc error:", e);
      }
    }

    syncClearanceToFirestore(
      auth.currentUser?.uid || studentProfile.studentId,
      studentProfile.matricNumber,
      nextStages,
      nextDocs,
      nextActivities,
      nextAlerts
    );
  };

  const adminRejectStage = async (stageId: number, reason: string) => {
    const current = stages.find(s => s.id === stageId);
    if (!current) return;

    const nextStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          status: "ACTION_REQUIRED" as const,
          documentStatus: "REJECTED" as const,
          rejectionReason: reason || "Document unreadable or invalid credentials.",
          isActionRequired: true,
          actionButtonText: "Re-upload Now"
        };
      }
      return s;
    });
    setStages(nextStages);

    const nextActivities: ActivityItem[] = [
      {
        id: Date.now(),
        title: `${current.title} Action Required`,
        description: reason,
        timeAgo: "Just now",
        status: "ACTION_REQUIRED",
        stageId
      },
      ...activities
    ];
    setActivities(nextActivities);

    const nextAlerts: AlertItem[] = [
      {
        id: Date.now(),
        title: `Action Required: ${current.title}`,
        description: reason,
        timeAgo: "Just now",
        isUrgent: true,
        isRead: false,
        stageId
      },
      ...alerts
    ];
    setAlerts(nextAlerts);

    const nextDocs = documents.map(d => d.stageId === stageId ? { ...d, status: "REJECTED" as const, rejectionReason: reason } : d);
    setDocuments(nextDocs);

    const targetDoc = documents.find(d => d.stageId === stageId);
    if (targetDoc) {
      try {
        await setDoc(doc(db, "jsp_documents", String(targetDoc.id)), {
          status: "REJECTED",
          rejectionReason: reason,
          rejectedDate: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore admin reject doc error:", e);
      }
    }

    syncClearanceToFirestore(
      auth.currentUser?.uid || studentProfile.studentId,
      studentProfile.matricNumber,
      nextStages,
      nextDocs,
      nextActivities,
      nextAlerts
    );
  };

  const resetDemoData = () => {
    const cleanStages = createCleanJigawaPolyStages();
    setStages(cleanStages);
    setDocuments([]);
    const defaultActivities: ActivityItem[] = [
      {
        id: 1,
        title: "Clearance Registry Initialized",
        description: `Account active for ${studentProfile.fullName} at Jigawa State Polytechnic Dutse.`,
        timeAgo: "Just now",
        status: "READY",
        stageId: 1
      }
    ];
    setActivities(defaultActivities);

    const defaultAlerts: AlertItem[] = [
      {
        id: 1,
        title: "Stage 1: Admission Credentials Required",
        description: "Please upload your JAMB Admission Letter / JSP Admission slip and acceptance receipt to begin clearance.",
        timeAgo: "Just now",
        isUrgent: true,
        isRead: false,
        stageId: 1
      }
    ];
    setAlerts(defaultAlerts);

    setChatMessages([
      {
        id: 1,
        isFromUser: false,
        text: `Welcome **${studentProfile.fullName}** to the Jigawa State Polytechnic Dutse Clearance Portal!\n\nYour profile has been connected for **${studentProfile.department}** (${studentProfile.level}). Start with Stage 1 (Directorate of Admissions & Registration).`,
        timestamp: Date.now(),
        actionButtonText: "Upload Stage 1",
        actionStageId: 1
      }
    ]);

    syncClearanceToFirestore(
      auth.currentUser?.uid || studentProfile.studentId,
      studentProfile.matricNumber,
      cleanStages,
      [],
      defaultActivities,
      defaultAlerts
    );
  };

  return (
    <ClearanceContext.Provider
      value={{
        studentProfile,
        stages,
        documents,
        activities,
        chatMessages,
        alerts,
        selectedTab,
        uploadScreenStageId,
        isAiThinking,
        isAdminMode,
        authLoading,
        requirements,
        getDynamicRequirementsForStage,
        selectTab,
        openUploadScreen,
        closeUploadScreen,
        submitDocument,
        deleteDocument,
        loginStudent,
        registerStudent,
        logoutStudent,
        updateStudentProfile,
        sendChatMessage,
        markAlertRead,
        toggleAdminMode,
        adminApproveStage,
        adminRejectStage,
        resetDemoData
      }}
    >
      {children}
    </ClearanceContext.Provider>
  );
};

export const useClearance = (): ClearanceContextType => {
  const context = useContext(ClearanceContext);
  if (!context) {
    throw new Error("useClearance must be used within a ClearanceProvider");
  }
  return context;
};

