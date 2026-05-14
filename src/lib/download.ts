import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const downloadFile = async (url: string, fileName: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Fetch the file
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 2. Convert to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      // 3. Write to Filesystem
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache, // Using Cache directory is safer for sharing
      });

      // 4. Share the file
      await Share.share({
        title: fileName,
        text: 'Save your file',
        url: result.uri,
        dialogTitle: 'Share or Save PDF',
      });
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  } else {
    // Web implementation
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const savePdfFromBase64 = async (base64WithHeader: string, fileName: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = base64WithHeader.split(',')[1];
      
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: fileName,
        text: 'Your generated PDF',
        url: result.uri,
        dialogTitle: 'Share or Save PDF',
      });
    } catch (error) {
      console.error('PDF Save error:', error);
      alert('Failed to save PDF.');
    }
  } else {
    // Browser fallback (though usually handled by jsPDF)
    const link = document.createElement('a');
    link.href = base64WithHeader;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
