import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import { toast } from 'react-toastify';
import { fileAPI } from '../api/apiService';

// Helper function to get appropriate file icon based on file type
const getFileIcon = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  const fileType = file.type || '';

  if (fileType.includes('pdf')) {
    return <PictureAsPdfIcon sx={{ fontSize: 60, color: '#F44336' }} />;
  }
  if (fileType.includes('image')) {
    return <ImageIcon sx={{ fontSize: 60, color: '#4CAF50' }} />;
  }
  if (fileType.includes('audio')) {
    return <AudioFileIcon sx={{ fontSize: 60, color: '#2196F3' }} />;
  }
  if (fileType.includes('video')) {
    return <VideoFileIcon sx={{ fontSize: 60, color: '#FF5722' }} />;
  }
  if (fileType.includes('zip') || fileType.includes('compressed')) {
    return <ArchiveIcon sx={{ fontSize: 60, color: '#795548' }} />;
  }
  if (['doc', 'docx'].includes(extension)) {
    return <DescriptionIcon sx={{ fontSize: 60, color: '#1976D2' }} />;
  }
  if (['xls', 'xlsx'].includes(extension)) {
    return <DescriptionIcon sx={{ fontSize: 60, color: '#388E3C' }} />;
  }
  if (['ppt', 'pptx'].includes(extension)) {
    return <DescriptionIcon sx={{ fontSize: 60, color: '#D32F2F' }} />;
  }
  return <InsertDriveFileIcon sx={{ fontSize: 60, color: '#757575' }} />;
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileBrowser = ({ files, folders, isHR, onRefresh }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event, item, type) => {
    setSelectedItem({ ...item, type });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async () => {
    try {
      if (selectedItem.type === 'file') {
        const { blob } = await fileAPI.download(selectedItem.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', selectedItem.name); // Use selectedItem.name as filename
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success('Download started');
      } else if (selectedItem.type === 'folder') {
        // Download folder as zip
        const { blob } = await fileAPI.downloadFolderZip(selectedItem.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedItem.name}.zip`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success('Folder download started');
      }
    } catch (error) {
      toast.error('Failed to download');
    } finally {
      handleMenuClose();
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      // Debug log to verify selectedItem
      console.log('Deleting:', selectedItem);
      if (selectedItem.type === 'file') {
        // Check for valid file ID (number and not null/undefined)
        if (!selectedItem.id || typeof selectedItem.id !== 'number') {
          toast.error('File ID is missing or invalid. Cannot delete.');
          return;
        }
        await fileAPI.delete(selectedItem.id);
        toast.success('File deleted successfully');
        onRefresh && onRefresh();
      } else if (selectedItem.type === 'folder') {
        if (!selectedItem.id || typeof selectedItem.id !== 'number') {
          toast.error('Folder ID is missing or invalid. Cannot delete.');
          return;
        }
        await fileAPI.deleteFolder(selectedItem.id);
        toast.success('Folder deleted successfully');
        onRefresh && onRefresh(); // Always reload FolderBrowser after deletion, just like creation
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleView = async () => {
    if (selectedItem.type === 'file') {
      try {
        const { blob, filename } = await fileAPI.download(selectedItem.id, selectedItem);
        const extension = filename.split('.').pop().toLowerCase();
        const mimeType = blob.type;
        const viewableExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
        const viewableMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
        const url = window.URL.createObjectURL(blob);
        if (viewableExtensions.includes(extension) || viewableMimeTypes.includes(mimeType)) {
          setPreviewUrl(url);
          setPreviewType(extension === 'pdf' || mimeType === 'application/pdf' ? 'pdf' : 'image');
          setPreviewOpen(true);
        } else {
          // Fallback: download if not viewable
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        }
      } catch (error) {
        toast.error('Failed to view file');
      }
    } else {
      toast.info(`Opening folder: ${selectedItem.name}`);
    }
    handleMenuClose();
  };

  return (
    <>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* Folders */}
        {folders.map(folder => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`folder-${folder.id}`}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: { xs: 1, sm: 2 },
                pb: 0,
                position: 'relative',
                width: '100%'
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  py: { xs: 1, sm: 2 }
                }}>
                  <FolderIcon sx={{ fontSize: { xs: 36, sm: 48, md: 60 }, color: '#FFA000' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1, pt: 1, px: 0, width: '100%' }}>
                  <Tooltip title={folder.name} placement="top">
                    <Typography
                      variant="subtitle1"
                      noWrap
                      textAlign="center"
                      sx={{ fontWeight: 'medium', color: '#181344', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                    >
                      {folder.name}
                    </Typography>
                  </Tooltip>
                </CardContent>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, folder, 'folder')}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}

        {/* Files */}
        {files.map(file => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`file-${file.id}`}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: { xs: 1, sm: 2 },
                pb: 0,
                position: 'relative',
                width: '100%'
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  py: { xs: 1, sm: 2 }
                }}>
                  {getFileIcon(file)}
                </Box>
                <CardContent sx={{ flexGrow: 1, pt: 1, px: 0, width: '100%' }}>
                  <Tooltip title={file.name} placement="top">
                    <Typography
                      variant="subtitle1"
                      noWrap
                      textAlign="center"
                      sx={{ fontWeight: 'medium', color: '#181344', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                    >
                      {file.name}
                    </Typography>
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
                    {formatFileSize(file.size)}
                  </Typography>
                </CardContent>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, file, 'file')}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            minWidth: '200px'
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ color: '#181344' }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: '#181344' }} />
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.type === 'file' ? 'View File' : 'Open Folder'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload} sx={{ color: '#181344' }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" sx={{ color: '#181344' }} />
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.type === 'file' ? 'Download File' : 'Download Folder'}
          </ListItemText>
        </MenuItem>
        {isHR && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: '#ED1C24' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: '#ED1C24' }} />
            </ListItemIcon>
            <ListItemText>
              {selectedItem?.type === 'file' ? 'Delete File' : 'Delete Folder'}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography fontSize={{ xs: '0.95rem', sm: '1rem' }}>
            Are you sure you want to delete this {selectedItem?.type}: <strong>{selectedItem?.name}</strong>?
          </Typography>
          {selectedItem?.type === 'folder' && (
            <Typography variant="body2" color="error" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              Warning: This will permanently delete all contents of this folder.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: '#181344', fontSize: { xs: '0.95rem', sm: '1rem' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#ED1C24',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: '#C2181F'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal for images and PDFs */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 600 },
            maxWidth: '100vw',
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>File Preview</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
          {previewType === 'pdf' ? (
            <iframe src={previewUrl} title="PDF Preview" width="100%" height="300px" style={{ border: 'none' }} />
          ) : (
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} color="primary" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileBrowser;