import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Download all files in a folder (and subfolders) as a zip file.
 * @param {Array} files - Array of files with { name, url, path }.
 * @param {string} folderName - Name for the zip file.
 */
export async function downloadFolderAsZip(files, folderName) {
  const zip = new JSZip();

  for (const file of files) {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      // Add file to zip, using its relative path
      zip.file(file.path || file.name, blob);
    } catch (err) {
      console.error(`Failed to fetch ${file.url}:`, err);
    }
  }

  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${folderName}.zip`);
  });
}

/**
 * Example usage:
 * const files = [
 *   { name: 'file1.txt', url: '/api/files/files/1/download/', path: 'file1.txt' },
 *   { name: 'file2.txt', url: '/api/files/files/2/download/', path: 'subfolder/file2.txt' },
 * ];
 * downloadFolderAsZip(files, 'MyFolder');
 */
