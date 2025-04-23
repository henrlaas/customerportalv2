
export const getFileTypeFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image/'+extension;
  } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    return 'video/'+extension;
  } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return 'application/'+extension;
  } else {
    return 'application/octet-stream';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
