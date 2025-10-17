export interface StoredFile {
  fileName: string;
  dataUrl: string;
  uploadedAt: string;
}

export const uploadFileToStorage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const fileName = file.name;
      const stored: StoredFile = { fileName, dataUrl, uploadedAt: new Date().toISOString() };
      const fileId = crypto.randomUUID();
      localStorage.setItem(`file_${fileId}`, JSON.stringify(stored));
      resolve(fileId);
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
};

export const getStoredFile = (fileId: string): StoredFile | null => {
  try {
    const stored = localStorage.getItem(`file_${fileId}`);
    if (!stored) return null;
    return JSON.parse(stored) as StoredFile;
  } catch {
    return null;
  }
};

export const getFileName = (fileIdOrUrl: string): string => {
  const stored = getStoredFile(fileIdOrUrl);
  if (stored) return stored.fileName;
  
  try {
    const urlObj = new URL(fileIdOrUrl);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'Документ';
  } catch {
    return 'Документ';
  }
};

export const openStoredFile = (fileIdOrUrl: string): void => {
  const stored = getStoredFile(fileIdOrUrl);
  if (stored) {
    const blob = dataURLtoBlob(stored.dataUrl);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    return;
  }
  
  try {
    window.open(fileIdOrUrl, '_blank');
  } catch (error) {
    console.error('Ошибка открытия файла:', error);
  }
};

export const deleteStoredFile = (fileId: string): void => {
  localStorage.removeItem(`file_${fileId}`);
};

const dataURLtoBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
