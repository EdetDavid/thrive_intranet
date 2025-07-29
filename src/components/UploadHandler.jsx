import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Typography,
  Box,
  IconButton,
  Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { fileAPI } from "../api/apiService";
import { toast } from "react-toastify";

const UploadHandler = ({ 
  open,
  onClose,
  files,
  currentFolder,
  onUploadSuccess
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
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

      setUploadStatus('success');
      toast.success("Files uploaded successfully");
      onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      let errorMsg = "Upload failed";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = "Session expired. Please login again.";
        } else if (error.response.status === 403) {
          errorMsg = "Permission denied. Only HR can upload files.";
        } else if (error.response.data?.detail) {
          errorMsg = error.response.data.detail;
        }
      }
      
      setUploadStatus('error');
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (open && files) {
      handleUpload();
    }
  }, [open]);

  const handleClose = () => {
    if (uploadStatus === 'uploading') {
      if (window.confirm('Are you sure you want to cancel the upload?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {uploadStatus === 'success' ? 'Upload Complete' : 'Uploading Files'}
          </Typography>
          <IconButton 
            onClick={handleClose} 
            disabled={uploadStatus === 'uploading'}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {uploadStatus === 'success' ? (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 2 }}
            >
              Successfully uploaded {files?.length} file(s)
            </Alert>
          ) : uploadStatus === 'error' ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                Uploading {files?.length} file(s)...
              </Typography>
              <LinearProgress
                variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
                value={uploadProgress}
                sx={{ height: 8, borderRadius: 4, mt: 2 }}
              />
              <Typography variant="caption" display="block" textAlign="right" mt={1}>
                {uploadProgress}%
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UploadHandler;