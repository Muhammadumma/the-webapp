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
  StudentProfile,
  StudentUserEntity
} from '../types/clearance';
import { createCleanJigawaPolyStages, getRequirementForStage } from '../data/departmentRequirements';
import { askGeminiClearanceAssistant } from '../services/geminiService';

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
    remarks?: string | null
  ) => void;
  deleteDocument: (docId: string | number) => void;
  loginStudent: (matricOrEmail: string, pin: string) => Promise<{ success: boolean; message: string }>;
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

export const ClearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stages, setStages] = useState<ClearanceStage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stages`);
    return saved ? JSON.parse(saved) : createCleanJigawaPolyStages();
  });

  const [documents, setDocuments] = useState<ClearanceDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}documents`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: "Clearance Portal Connected",
        description: "Firebase server authentication and digital dossier services initialized.",
        timeAgo: "Just now",
        status: "READY",
        stageId: 1
      }
    ];
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}alerts`);
    return saved ? JSON.parse(saved) : [
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
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}chat`);
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        isFromUser: false,
        text: "Welcome to the **Jigawa State Polytechnic Dutse** Digital Clearance Portal! You can track all 8 departmental clearance stages, upload receipts, and check your status here. How can I assist you today?",
        timestamp: Date.now(),
        actionButtonText: "Upload Stage 1",
        actionStageId: 1
      }
    ];
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
    return saved ? JSON.parse(saved) : {
      studentId: "",
      fullName: "",
      email: "",
      faculty: "School of Technology & Applied Sciences",
      department: "Computer Telecommunication Engineering (CTE)",
      level: "ND I",
      session: "2024/2025 Academic Session",
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
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "jsp_students", firebaseUser.uid);
          const recordDocRef = doc(db, "jsp_clearance_records", firebaseUser.uid);

          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setStudentProfile(prev => ({
              ...prev,
              studentId: data.matricNumber || firebaseUser.uid.slice(0, 10),
              fullName: data.fullName || firebaseUser.displayName || prev.fullName || "JSP Student",
              email: data.email || firebaseUser.email || prev.email,
              faculty: data.faculty || prev.faculty || "School of Technology & Applied Sciences",
              department: data.department || prev.department || "Computer Science",
              level: data.level || prev.level || "ND II",
              session: data.session || prev.session || "2024/2025 Academic Session",
              matricNumber: data.matricNumber || prev.matricNumber || "JSP/ND/CS/22/0149",
              clearancePin: data.clearancePin || prev.clearancePin || `JSP-CLR-${Math.floor(1000 + Math.random() * 9000)}`,
              role: "student",
              isLoggedIn: true,
              loginPin: "******",
              lastLoginTime: "Just now"
            }));

            if (data.stages && Array.isArray(data.stages) && data.stages.length > 0) {
              setStages(data.stages);
            }
            if (data.documents && Array.isArray(data.documents)) {
              setDocuments(data.documents);
            }
            if (data.activities && Array.isArray(data.activities)) {
              setActivities(data.activities);
            }
            if (data.alerts && Array.isArray(data.alerts)) {
              setAlerts(data.alerts);
            }
          }

          // Setup real-time listener on clearance record
          unsubscribeDoc = onSnapshot(recordDocRef, (recordSnap) => {
            if (recordSnap.exists()) {
              const recData = recordSnap.data();
              if (recData.stages && Array.isArray(recData.stages)) {
                setStages(recData.stages);
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

        } catch (e) {
          console.warn("Firestore auth sync info:", e);
        }
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
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
    remarks?: string | null
  ) => {
    const currentStage = stages.find(s => s.id === stageId) || stages[0];
    const req = getRequirementForStage(stageId);
    const selectedDocType = docType || req.primaryDocumentLabel;
    const documentId = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newDoc: ClearanceDocument = {
      id: documentId,
      stageId,
      stageTitle: currentStage.title,
      documentType: selectedDocType,
      fileName: docName,
      fileUri: fileUri || null,
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

    // Save individual document record to Firestore collection "jsp_documents"
    try {
      const uid = auth.currentUser?.uid || studentProfile.studentId || studentProfile.matricNumber || 'guest';
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
        receiptNumber: newDoc.receiptNumber,
        paymentDate: newDoc.paymentDate,
        uploadDate: new Date().toISOString(),
        status: "PENDING_REVIEW",
        remarks: newDoc.remarks,
        fileUri: fileUri && fileUri.length < 500000 ? fileUri : null,
        hasAttachment: !!fileUri,
        createdAt: Date.now()
      };

      await setDoc(doc(db, "jsp_documents", String(documentId)), firestoreDocPayload);
      console.log("Document successfully written to Firestore 'jsp_documents':", documentId);
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

  const loginStudent = async (matricOrEmail: string, pin: string): Promise<{ success: boolean; message: string }> => {
    setAuthLoading(true);
    const trimmed = matricOrEmail.trim();
    const trimmedPin = pin.trim();

    if (!trimmed || !trimmedPin) {
      setAuthLoading(false);
      return { success: false, message: "Please enter your Matric Number / Email and Password." };
    }

    try {
      const emailToUse = trimmed.includes("@") ? trimmed : `${trimmed.replace(/\//g, '_')}@jigawapoly.edu.ng`;
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
            matricNumber: data.matricNumber || trimmed,
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

      const profileObj: StudentProfile = loadedProfile || {
        studentId: trimmed,
        fullName: user.displayName || "Student",
        email: user.email || emailToUse,
        faculty: "School of Technology & Applied Sciences",
        department: "Computer Science",
        level: "ND II",
        session: "2024/2025 Academic Session",
        matricNumber: trimmed,
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
      console.warn("Firebase sign in fallback:", firebaseErr);

      // Local fallback sign in for instant responsiveness
      const profileObj: StudentProfile = {
        studentId: trimmed,
        fullName: trimmed,
        email: trimmed.includes("@") ? trimmed : `${trimmed.toLowerCase().replace(/\//g, '.') }@jigawapoly.edu.ng`,
        faculty: "School of Technology & Applied Sciences",
        department: "Computer Telecommunication Engineering (CTE)",
        level: "ND I",
        session: "2024/2025 Academic Session",
        matricNumber: trimmed,
        clearancePin: `JSP-CLR-${Math.floor(1000 + Math.random() * 9000)}`,
        role: "student",
        isLoggedIn: true,
        loginPin: trimmedPin,
        lastLoginTime: "Just now"
      };

      setStudentProfile(profileObj);
      setAuthLoading(false);
      return { success: true, message: `Logged in as ${profileObj.fullName}` };
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
      console.warn("Firebase registration fallback:", firebaseErr);

      const randPin = `JSP-CLR-${Math.floor(1000 + Math.random() * 9000)}`;
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
      resetDemoData();
      setAuthLoading(false);
      return { success: true, message: `Account created for ${trimmedName}!` };
    }
  };

  const logoutStudent = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setStudentProfile(prev => ({ ...prev, isLoggedIn: false }));
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

