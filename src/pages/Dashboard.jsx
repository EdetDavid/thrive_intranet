import { useState, useEffect } from "react";
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import FileBrowser from "../components/FileBrowser";
import FolderBrowser from "../components/FolderBrowser";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { fileAPI } from "../api/apiService";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Dashboard = () => {
  const { user } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState({
    open: false,
    files: null,
    progress: 0,
    status: "idle",
    error: "",
  });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesResponse, foldersResponse] = await Promise.all([
        fileAPI.list(currentFolder?.id),
        fileAPI.listFolders(currentFolder?.id),
      ]);

      console.log("Files response:", filesResponse);
      console.log("Folders response:", foldersResponse);

      setFiles(Array.isArray(filesResponse) ? filesResponse : []);
      setFolders(Array.isArray(foldersResponse) ? foldersResponse : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.isAuthenticated) {
      fetchData();
    }
  }, [user.isAuthenticated, currentFolder]);

  const handleUploadTrigger = (e, isFolder) => {
    if (e.target.files?.length > 0) {
      setUploadState({
        open: true,
        files: e.target.files,
        progress: 0,
        status: "uploading",
        error: "",
      });
      handleUpload(e.target.files);
    }
  };

  const handleUpload = async (filesToUpload) => {
    try {
      const formData = new FormData();
      Array.from(filesToUpload).forEach((file) => {
        formData.append("files", file);
      });

      if (currentFolder) {
        formData.append("folder", currentFolder.id);
      }

      await fileAPI.upload(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadState((prev) => ({
            ...prev,
            progress: percentCompleted,
          }));
        },
      });

      setUploadState((prev) => ({
        ...prev,
        status: "success",
        progress: 100,
      }));
      fetchData();
    } catch (error) {
      let errorMsg = "Upload failed";
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: errorMsg,
      }));
      toast.error(errorMsg);
    }
  };

  const handleCloseUploadDialog = () => {
    if (uploadState.status === "uploading") {
      if (window.confirm("Cancel upload?")) {
        setUploadState({
          open: false,
          files: null,
          progress: 0,
          status: "idle",
          error: "",
        });
      }
    } else {
      setUploadState({
        open: false,
        files: null,
        progress: 0,
        status: "idle",
        error: "",
      });
    }
  };

  const handleFolderSelect = (folder) => {
    setCurrentFolder(folder);
  };

  // In Dashboard.jsx, update the renderContent function:
  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress />
        </Box>
      );
    }

    return (
      <>
        <FileBrowser
          files={files || []}
          folders={[]} // Don't render folders here anymore
          isHR={user.isHR}
          onRefresh={fetchData}
        />
      </>
    );
  };

  if (!user.isAuthenticated) return null;

  return (
    <>
      <Box
        display="flex"
        sx={{
          flexDirection: { xs: "column", sm: "column", md: "row" },
          alignItems: { xs: "stretch", sm: "stretch", md: "flex-start" },
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: 240 },
            minWidth: 0,
            flexShrink: 0,
            mb: { xs: 2, md: 0 },
            borderRight: { md: '1px solid #eee' },
            background: { xs: 'transparent', md: 'white' },
            zIndex: 2
          }}
        >
          <Sidebar
            onUploadTrigger={handleUploadTrigger}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
          />
        </Box>

        <Container
          maxWidth={false}
          disableGutters
          sx={{
            flex: 1,
            width: '100%',
            
            mt: { xs: 0, md: 4 },
            mb: { xs: 2, md: 4 },
            px: { xs: 1, sm: 2, md: 4 },
            minWidth: 0,
            overflowX: 'auto',
          }}
        >
          <FolderBrowser
            currentFolder={currentFolder}
            folders={folders}
            onFolderSelect={handleFolderSelect}
            isHR={user.isHR}
            onRefresh={fetchData}
          />
          {renderContent()}
        </Container>

        <Dialog
          open={uploadState.open}
          onClose={handleCloseUploadDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 400 },
              maxWidth: '100vw',
            }
          }}
        >
          <DialogTitle>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                {uploadState.status === "success"
                  ? "Upload Complete"
                  : "Uploading Files"}
              </Typography>
              <IconButton onClick={handleCloseUploadDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {uploadState.status === "success" ? (
                <Alert icon={<CheckCircleIcon />} severity="success">
                  Uploaded {uploadState.files?.length} file(s) successfully
                </Alert>
              ) : uploadState.status === "error" ? (
                <Alert severity="error">{uploadState.error}</Alert>
              ) : (
                <>
                  <Typography fontSize={{ xs: '0.95rem', sm: '1rem' }}>
                    Uploading {uploadState.files?.length} file(s)...
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={uploadState.progress}
                    sx={{ height: { xs: 6, sm: 8 }, my: 2 }}
                  />
                  <Typography textAlign="right" fontSize={{ xs: '0.85rem', sm: '1rem' }}>
                    {uploadState.progress}%
                  </Typography>
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default Dashboard;
