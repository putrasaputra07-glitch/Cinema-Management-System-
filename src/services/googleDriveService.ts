import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  shared?: boolean;
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveUserInfo {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
}

export interface DriveAboutResponse {
  storageQuota: DriveStorageQuota;
  user: DriveUserInfo;
}

export const googleDriveService = {
  /**
   * Fetch Drive user info and storage quota
   */
  async getAbout(): Promise<DriveAboutResponse> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal memuat profil Google Drive');
    }

    return res.json();
  },

  /**
   * List files from Google Drive
   */
  async listFiles(options?: {
    folderId?: string;
    searchTerm?: string;
    mimeTypeFilter?: string;
    pageSize?: number;
  }): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const { folderId, searchTerm, mimeTypeFilter, pageSize = 50 } = options || {};

    const queryParts: string[] = ['trashed = false'];

    if (folderId) {
      queryParts.push(`'${folderId}' in parents`);
    }

    if (searchTerm && searchTerm.trim()) {
      const safeTerm = searchTerm.replace(/'/g, "\\'");
      queryParts.push(`name contains '${safeTerm}'`);
    }

    if (mimeTypeFilter && mimeTypeFilter !== 'ALL') {
      if (mimeTypeFilter === 'folder') {
        queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
      } else if (mimeTypeFilter === 'document') {
        queryParts.push("(mimeType contains 'document' or mimeType contains 'text/' or mimeType contains 'word')");
      } else if (mimeTypeFilter === 'spreadsheet') {
        queryParts.push("(mimeType contains 'spreadsheet' or mimeType contains 'csv' or mimeType contains 'excel')");
      } else if (mimeTypeFilter === 'pdf') {
        queryParts.push("mimeType = 'application/pdf'");
      } else if (mimeTypeFilter === 'image') {
        queryParts.push("mimeType contains 'image/'");
      }
    }

    const q = encodeURIComponent(queryParts.join(' and '));
    const fields = encodeURIComponent(
      'nextPageToken,files(id,name,mimeType,size,modifiedTime,iconLink,webViewLink,webContentLink,thumbnailLink,parents,shared)'
    );
    const orderBy = encodeURIComponent('folder,modifiedTime desc');

    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=${orderBy}&pageSize=${pageSize}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal memuat berkas Google Drive');
    }

    return res.json();
  },

  /**
   * Create a new folder
   */
  async createFolder(name: string, parentFolderId?: string): Promise<DriveFileItem> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: name.trim(),
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal membuat folder di Google Drive');
    }

    return res.json();
  },

  /**
   * Upload text or JSON content to Google Drive (e.g. Cinema Reports backup)
   */
  async uploadContent(
    filename: string,
    content: string,
    mimeType: string = 'application/json',
    parentFolderId?: string
  ): Promise<DriveFileItem> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: filename,
      mimeType: mimeType,
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------CinemaDriveUploadBoundary' + Math.random().toString().slice(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal mengunggah berkas ke Google Drive');
    }

    return res.json();
  },

  /**
   * Upload binary file (File / Blob) to Google Drive
   */
  async uploadFile(file: File, parentFolderId?: string): Promise<DriveFileItem> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal mengunggah berkas');
    }

    return res.json();
  },

  /**
   * Rename a file or folder
   */
  async renameFile(fileId: string, newName: string): Promise<DriveFileItem> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal mengubah nama berkas di Google Drive');
    }

    return res.json();
  },

  /**
   * Delete a file or folder permanently (or move to trash)
   */
  async deleteFile(fileId: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Drive membutuhkan login akun Google.');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal menghapus berkas dari Google Drive');
    }
  },
};
