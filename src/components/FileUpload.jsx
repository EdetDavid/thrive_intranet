import { useState } from "react";
import { 
  Button, 
  Box, 
  Typography, 
  LinearProgress,
  Alert,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fileAPI } from "../api/apiService";
import { toast } from "react-toastify";

const FileUpload = ({ 
  onUploadSuccess, 
  currentFolder,
}) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files?.length > 0) {
      setSelectedFiles(event.target.files);
      setError(null);
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });
      
      if (currentFolder) {
        formData.append('folder', currentFolder.id);
      }

      await fileAPI.upload(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSelectedFiles(null);
      document.getElementById("file-input").value = "";
      setUploadComplete(true);
      onUploadSuccess();
      setTimeout(() => setUploadComplete(false), 2000);
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Upload failed";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (error.response.status === 403) {
          errorMessage = "Permission denied. Only HR can upload files.";
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCloseDialog = () => {
    if (!uploading) {
      setUploadComplete(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          mb: 4,
          p: 2,
          border: "1px dashed #181344",
          borderRadius: 1,
          backgroundColor: "#ffffff",
        }}
      >
        <Collapse in={!!error}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Collapse>

        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={uploading}
          multiple
          webkitdirectory="true"
          directory="true"
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
          >
            Select Files/Folder
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              multiple
              webkitdirectory="true"
              directory="true"
            />
          </Button>

          {selectedFiles && (
            <Typography variant="body1" sx={{ color: "#606060" }}>
              {selectedFiles.length} file(s) selected
            </Typography>
          )}

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#181344",
              "&:hover": { backgroundColor: "#0f0b2b" },
              ml: 'auto'
            }}
            onClick={handleUpload}
            disabled={!selectedFiles || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Box>

        {uploading && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" display="block" textAlign="right">
              {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={uploadComplete} onClose={handleCloseDialog}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" />
            <Typography variant="h6">Upload Complete</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>Files uploaded successfully!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUpload;