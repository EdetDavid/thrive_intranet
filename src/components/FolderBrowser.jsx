import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Button,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Folder as FolderIcon,
  ArrowBack,
  CreateNewFolder,
  MoreVert,
} from "@mui/icons-material";
import { fileAPI } from "../api/apiService";
import { toast } from "react-toastify";
import NewFolderDialog from "./NewFolderDialog";
import FolderMenu from "./FolderMenu";
import EditIcon from '@mui/icons-material/Edit';
import RenameFolderDialog from "./RenameFolderDialog";

const FolderBrowser = ({ 
  currentFolder, 
  onFolderSelect,
  isHR,
  onRefresh 
}) => {
  const [loading, setLoading] = useState(false);
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [folderPath, setFolderPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const foldersResponse = await fileAPI.listFolders(currentFolder?.id);
      setFolders(Array.isArray(foldersResponse) ? foldersResponse : []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    onFolderSelect(folder);
  };

  const handleMenuOpen = (event, folder) => {
    event.stopPropagation();
    setSelectedFolder(folder);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateUp = () => {
    if (currentFolder?.parent) {
      onFolderSelect(currentFolder.parent);
    } else {
      onFolderSelect(null);
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      setLoading(true);
      const newFolder = await fileAPI.createFolder({
        name: folderName,
        parent: currentFolder?.id || null,
      });
      setFolders((prev) => [...prev, newFolder]); // Add new folder to state
      toast.success("Folder created successfully");
      onRefresh(); // Refresh dashboard after creating folder
    } catch (error) {
      console.error("Folder creation error:", error);
      toast.error(error.response?.data?.detail || "Failed to create folder");
    } finally {
      setLoading(false);
      setOpenNewFolder(false);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await fileAPI.deleteFolder(selectedFolder.id);
      toast.success("Folder deleted successfully");
      await fetchFolders(); // Force FolderBrowser to reload folders from backend after deletion
      onRefresh(); // Also refresh dashboard
    } catch (error) {
      toast.error(error.message || "Failed to delete folder");
    } finally {
      handleMenuClose();
    }
  };

  const handleRenameFolder = () => {
    setRenameTarget(selectedFolder);
    setOpenRenameDialog(true);
    handleMenuClose();
  };

  const handleRenameSubmit = async (newName) => {
    try {
      const updatedFolder = await fileAPI.renameFolder(renameTarget.id, newName);
      setFolders((prev) => prev.map(f => f.id === updatedFolder.id ? updatedFolder : f)); // Update folder in state
      toast.success("Folder renamed successfully");
      onRefresh(); // Refresh dashboard after renaming folder
    } catch (error) {
      toast.error(error.message || "Failed to rename folder");
    } finally {
      setOpenRenameDialog(false);
      setRenameTarget(null);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [currentFolder]);

  useEffect(() => {
    const buildPath = (folder) => {
      const path = [];
      let current = folder;
      while (current) {
        path.unshift(current);
        current = current.parent;
      }
      setFolderPath(path);
    };

    if (currentFolder) {
      buildPath(currentFolder);
    } else {
      setFolderPath([]);
    }
  }, [currentFolder]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {currentFolder && (
          <IconButton onClick={handleNavigateUp} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Breadcrumbs sx={{ flexGrow: 1 }}>
          <Link
            component="button"
            onClick={() => onFolderSelect(null)}
            color={!currentFolder ? "text.primary" : "inherit"}
            underline="hover"
          >
            Root
          </Link>
          {folderPath.map((folder, index) => (
            <Link
              key={folder.id}
              component="button"
              onClick={() => onFolderSelect(folder)}
              color={
                index === folderPath.length - 1 ? "text.primary" : "inherit"
              }
              underline="hover"
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>
        {isHR &&
        <Button
          variant="outlined"
          startIcon={<CreateNewFolder />}
          onClick={() => setOpenNewFolder(true)}
          sx={{ ml: 2 }}
          disabled={loading}
        >
          New Folder
        </Button>
}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {folders.map((folder) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => handleFolderClick(folder)}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  pb: 0,
                  position: 'relative' // Enable absolute positioning for icon
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    width: '100%',
                    py: 2
                  }}>
                    <FolderIcon sx={{ fontSize: 60, color: '#FFA000' }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                    <Tooltip title={folder.name} placement="top">
                      <Typography 
                        variant="subtitle1" 
                        noWrap 
                        textAlign="center"
                        sx={{ fontWeight: 'medium', color: '#181344' }}
                      >
                        {folder.name}
                      </Typography>
                    </Tooltip>
                  </CardContent>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, folder)}
                    sx={{ position: 'absolute', top: 8, right: 8 }} // Move to top right
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <NewFolderDialog
        open={openNewFolder}
        onClose={() => setOpenNewFolder(false)}
        onCreate={handleCreateFolder}
      />

      <FolderMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onDelete={handleDeleteFolder}
        onRename={handleRenameFolder}
        isHR={isHR}
      />
      <RenameFolderDialog
        open={openRenameDialog}
        folder={renameTarget}
        onClose={() => setOpenRenameDialog(false)}
        onSubmit={handleRenameSubmit}
      />
    </Box>
  );
};

export default FolderBrowser;