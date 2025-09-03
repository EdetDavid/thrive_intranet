import React from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";

/**
 * Button to download a folder as a zip file using backend's list_files endpoint and JSZip.
 * @param {number|string} folderId - The folder ID to download.
 */
export default function DownloadFolderZipButton({ folderId }) {
  const handleDownload = async () => {
    try {
      // 1. Get all files in the folder (and subfolders)
      const res = await axios.get(`/api/files/folders/${folderId}/list_files/`);
      const { files, folder_name } = res.data;
      if (!files.length) {
        alert("No files to download.");
        return;
      }
      const zip = new JSZip();
      // 2. Fetch each file and add to zip
      for (const file of files) {
        try {
          const response = await axios.get(file.url, { responseType: "blob" });
          zip.file(file.path, response.data);
        } catch (err) {
          console.error(`Failed to fetch ${file.url}:`, err);
        }
      }
      // 3. Generate zip and trigger download
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `${folder_name}.zip`);
      });
    } catch (err) {
      console.error("Failed to list files:", err);
      alert("Failed to download folder as zip.");
    }
  };

  return (
    <button onClick={handleDownload}>
      Download Folder as Zip
    </button>
  );
}
