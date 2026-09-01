import { ClearanceStage, StudentProfile } from '../types/clearance';

export async function askGeminiClearanceAssistant(
  userPrompt: string,
  stages: ClearanceStage[],
  profile: StudentProfile
): Promise<string> {
  const completed = stages.filter(s => s.status === 'COMPLETED').map(s => s.title);
  const actionRequired = stages.filter(s => s.status === 'ACTION_REQUIRED').map(s => `${s.title}: ${s.rejectionReason || 'Action needed'}`);
  const pending = stages.filter(s => s.status === 'PENDING').map(s => s.title);
  const locked = stages.filter(s => s.status === 'LOCKED').map(s => s.title);

  const completedCount = completed.length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  // Quick contextual intelligent responses
  const lower = userPrompt.toLowerCase();

  if (lower.includes('bursary') || lower.includes('fees') || lower.includes('remita') || lower.includes('rrr') || lower.includes('reject')) {
    return `### Bursary & Tuition Clearance Help\n\n` +
      `For **Bursary & Accounts Clearance (Stage 4)**, make sure you provide:\n` +
      `• **Remita Retrieval Reference (RRR)** e-receipt or official bank deposit slip for all registered semesters.\n` +
      `• Clear, flat lighting with no flash reflections or blur.\n` +
      `• All four corners of the receipt and the payment date must be sharply visible.\n\n` +
      `You can use the **Upload Document** tool below to snap or choose your receipt.`;
  }

  if (lower.includes('status') || lower.includes('progress') || lower.includes('check') || lower.includes('how far')) {
    return `### 📊 Clearance Progress Report for ${profile.fullName || 'Student'}\n\n` +
      `• **Matric Number:** \`${profile.matricNumber || 'JSP/ND/CS/22/0149'}\`\n` +
      `• **Department:** ${profile.department || 'Computer Science'}\n` +
      `• **Overall Progress:** **${progressPercent}%** (${completedCount} of ${stages.length} stages completed)\n\n` +
      `✅ **Completed (${completed.length}):** ${completed.length > 0 ? completed.join(', ') : 'None yet'}\n` +
      `⚠️ **Action Required (${actionRequired.length}):** ${actionRequired.length > 0 ? actionRequired.join('; ') : 'None'}\n` +
      `⏳ **Pending / In Progress (${pending.length}):** ${pending.length > 0 ? pending.join(', ') : 'None'}\n` +
      `🔒 **Locked (${locked.length}):** ${locked.length > 0 ? locked.join(', ') : 'None'}\n\n` +
      `${actionRequired.length > 0 ? '👉 Please resolve your action required items to move forward!' : '👉 Great progress! Keep submitting remaining stages.'}`;
  }

  if (lower.includes('missing') || lower.includes('what next') || lower.includes('next step') || lower.includes('what to do')) {
    const nextPending = stages.find(s => s.status === 'READY' || s.status === 'ACTION_REQUIRED' || (s.status === 'PENDING' && s.documentStatus === 'NOT_UPLOADED'));
    if (nextPending) {
      return `### 🎯 Next Clearance Milestone\n\n` +
        `Your active focus is **Stage ${nextPending.stageNumber}: ${nextPending.title}** (${nextPending.department}).\n\n` +
        `**Required Action:** ${nextPending.description}\n` +
        `**Document Type:** \`${nextPending.primaryDocumentType || 'Required Credentials'}\`\n\n` +
        `Click **Upload Document** below to fulfill this stage.`;
    }
    return `You have completed all prerequisite stages! Head over to your **Profile** to view and download your verified **JSP Digital Clearance Certificate**.`;
  }

  if (lower.includes('certificate') || lower.includes('diploma') || lower.includes('graduate') || lower.includes('convocation')) {
    return `### 🎓 Official JSP Digital Clearance Certificate\n\n` +
      `The Jigawa State Polytechnic Clearance Certificate is digitally generated and watermarked with a cryptographically verifiable **QR Code** upon completion of all 8 departmental clearance stages.\n\n` +
      `Once approved by the Academic Board & Registry (Stage 8), you can instantly preview, print, or share your official clearance letter directly from your **Profile** tab!`;
  }

  if (lower.includes('library') || lower.includes('book')) {
    return `### 📚 Polytechnic Central Library Clearance\n\n` +
      `To obtain clearance from the Central Library (Stage 2):\n` +
      `1. Return any borrowed books, journals, or project references to the circulation counter.\n` +
      `2. Surrender your student Library Membership / Reader ID card.\n` +
      `3. Upload your signed **Book Return Slip** or Library Fee slip.`;
  }

  if (lower.includes('sports') || lower.includes('games')) {
    return `### ⚽ Sports & Physical Education Clearance\n\n` +
      `For Stage 6 Clearance, verify that all polytechnic tournament jerseys, athletic gear, and equipment have been returned to the Sports Directorate at Dutse campus.`;
  }

  if (lower.includes('hostel') || lower.includes('dsa') || lower.includes('student affairs') || lower.includes('nysc')) {
    return `### 🏛️ Dean of Student Affairs (DSA) & NYSC Mobilization\n\n` +
      `Stage 7 ensures:\n` +
      `• Surrender of hostel room keys and inspection for hall damage.\n` +
      `• Clearance of good conduct from the Disciplinary Committee.\n` +
      `• Endorsement of NYSC Mobilization or Exemption certificate details.`;
  }

  // Default response
  return `Hello **${profile.fullName || 'Student'}**! I am your AI Clearance Guide for **Jigawa State Polytechnic Dutse**.\n\n` +
    `You are currently at **${progressPercent}% clearance completion** (${completedCount}/8 stages completed).\n\n` +
    `How can I assist you with your admissions, departmental dues, library return, bursary receipts, or clearance certificate today?`;
}
