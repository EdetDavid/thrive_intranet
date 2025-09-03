import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';

const FolderMenu = ({ anchorEl, open, onClose, onDelete, onRename, isHR }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          minWidth: '200px'
        }
      }}
    >
      <MenuItem onClick={onClose} sx={{ color: '#181344' }}>
        <ListItemIcon>
          <DownloadIcon fontSize="small" sx={{ color: '#181344' }} />
        </ListItemIcon>
        <ListItemText>Download Folder</ListItemText>
      </MenuItem>
      {isHR && (
        <MenuItem onClick={onRename} sx={{ color: '#181344' }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#181344' }} />
          </ListItemIcon>
          <ListItemText>Rename Folder</ListItemText>
        </MenuItem>
      )}
      {isHR && (
        <MenuItem onClick={onDelete} sx={{ color: '#ED1C24' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ED1C24' }} />
          </ListItemIcon>
          <ListItemText>Delete Folder</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default FolderMenu;