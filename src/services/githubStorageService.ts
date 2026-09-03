/**
 * githubStorageService.ts
 * Uploads files to a GitHub repository via the GitHub Contents API.
 * Files are stored at: uploads/clearance/{uid}/{stageKey}/{filename}
 * Public raw URL: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
 */

/// <reference types="vite/client" />

const env = (import.meta as any).env || {};
const GITHUB_TOKEN: string = env.VITE_GITHUB_TOKEN || '';
const GITHUB_OWNER: string = env.VITE_GITHUB_OWNER || 'Muhammadumma';
const GITHUB_REPO: string = env.VITE_GITHUB_REPO || 'the-admin-app';
const GITHUB_BRANCH: string = env.VITE_GITHUB_BRANCH || 'main';

const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubUploadResult {
  downloadUrl: string;  // https://raw.githubusercontent.com/... (for display)
  htmlUrl: string;      // https://github.com/... (for reference)
  path: string;         // e.g. uploads/clearance/uid/stage/file.pdf
  sha: string;          // needed for updates/deletes
}

/**
 * Converts a File or Blob to a base64 string (content only, no data URI prefix).
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix - GitHub API needs raw base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

/**
 * Converts a data URI string (already base64) to raw base64.
 */
const dataUriToBase64 = (dataUri: string): string => {
  if (dataUri.includes(',')) {
    return dataUri.split(',')[1];
  }
  return dataUri;
};

/**
 * Sanitize a filename so it is URL-safe.
 */
const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Upload a file (File object) to GitHub.
 */
export const uploadFileToGitHub = async (
  file: File,
  uid: string,
  stageKey: string
): Promise<GitHubUploadResult> => {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub storage is not configured. Please check your .env file.');
  }

  const timestamp = Date.now();
  const safeName = sanitizeFilename(file.name);
  const filePath = `uploads/clearance/${uid}/${stageKey}/${timestamp}_${safeName}`;
  const base64Content = await fileToBase64(file);

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `[JSP Clearance] Upload ${file.name} for student ${uid} (${stageKey})`,
        content: base64Content,
        branch: GITHUB_BRANCH
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `GitHub upload failed (${response.status}): ${(err as any).message || response.statusText}`
    );
  }

  const data = await response.json();
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

  return {
    downloadUrl: rawUrl,
    htmlUrl: data.content?.html_url || rawUrl,
    path: filePath,
    sha: data.content?.sha || ''
  };
};

/**
 * Upload from a Data URI string (e.g. from camera capture).
 */
export const uploadDataUriToGitHub = async (
  dataUri: string,
  fileName: string,
  uid: string,
  stageKey: string
): Promise<GitHubUploadResult> => {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub storage is not configured. Please check your .env file.');
  }

  const timestamp = Date.now();
  const safeName = sanitizeFilename(fileName);
  const filePath = `uploads/clearance/${uid}/${stageKey}/${timestamp}_${safeName}`;
  const base64Content = dataUriToBase64(dataUri);

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `[JSP Clearance] Upload ${fileName} for student ${uid} (${stageKey})`,
        content: base64Content,
        branch: GITHUB_BRANCH
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `GitHub upload failed (${response.status}): ${(err as any).message || response.statusText}`
    );
  }

  const data = await response.json();
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

  return {
    downloadUrl: rawUrl,
    htmlUrl: data.content?.html_url || rawUrl,
    path: filePath,
    sha: data.content?.sha || ''
  };
};

/**
 * Delete a previously uploaded file from GitHub (optional, for admin cleanup).
 */
export const deleteFileFromGitHub = async (filePath: string, sha: string): Promise<void> => {
  await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `[JSP Clearance] Remove file ${filePath}`,
        sha,
        branch: GITHUB_BRANCH
      })
    }
  );
};
