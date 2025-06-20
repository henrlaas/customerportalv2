
export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

export const isVideoFile = (fileType: string): boolean => {
  return fileType.startsWith('video/');
};

export const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf';
};

export const isPreviewableFile = (fileType: string): boolean => {
  return isImageFile(fileType) || isVideoFile(fileType);
};

export const getFileAction = (fileType: string): 'preview' | 'open' | 'none' => {
  if (isPreviewableFile(fileType)) return 'preview';
  if (isPdfFile(fileType)) return 'open';
  return 'none';
};
