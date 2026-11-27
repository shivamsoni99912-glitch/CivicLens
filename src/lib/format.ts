export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
};

/**
 * Downscales an uploaded image so a few dozen reports fit comfortably inside
 * browser storage while keeping a crisp thumbnail in the UI.
 */
export const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPG, PNG or WebP).'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('That image is larger than 8 MB. Please pick a smaller photo.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('That image could not be read. Try another file.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('That image could not be opened. Try another file.'));
      image.onload = () => {
        const maxWidth = 900;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(String(reader.result));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
