import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  useMediaQuery,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {
  Folder,
  Add,
  InsertDriveFile,
  CreateNewFolder,
  GridOn,
  Description,
  ListAlt,
  Slideshow,
  Videocam,
} from "@mui/icons-material";
import { useNavigate, useOutletContext } from "react-router-dom";

const Sidebar = ({ onUploadTrigger, currentFolder, setCurrentFolder }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { user, sidebarOpen, setSidebarOpen } = useOutletContext(); // Get user and sidebar control from Outlet context
  const isMobile = useMediaQuery('(max-width:900px)');
  const handleDrawerToggle = () => {
    if (typeof setSidebarOpen === 'function') setSidebarOpen(prev => !prev);
  };

  const handleNewClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      if (onUploadTrigger) {
        onUploadTrigger(e, false);
      }
    };
    input.click();
    handleMenuClose();
  };

  const handleFolderUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.directory = true;
    input.onchange = (e) => {
      if (onUploadTrigger) {
        onUploadTrigger(e, true);
      }
    };
    input.click();
    handleMenuClose();
  };

  const googleApps = [
    {
      name: "Google Sheet",
      icon: <GridOn fontSize="small" color="success" />,
      url: "https://docs.google.com/spreadsheets/create"
    },
    {
      name: "Google Doc",
      icon: <Description fontSize="small" color="info" />,
      url: "https://docs.google.com/document/create"
    },
    {
      name: "Google Form",
      icon: <ListAlt fontSize="small" color="warning" />,
      url: "https://docs.google.com/forms/create"
    },
    {
      name: "Google Slides",
      icon: <Slideshow fontSize="small" color="secondary" />,
      url: "https://docs.google.com/presentation/create"
    },
    {
      name: "Google Meet",
      icon: <Videocam fontSize="small" color="error" />,
      url: "https://meet.google.com/new"
    }
  ];

  const handleNavigation = () => {
    setCurrentFolder(null);
    navigate("/");
  };

  return (
    <>
      {isMobile && user?.isHR && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, background: '#f5f5f5' }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#181344' }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, color: '#181344', fontWeight: 500, fontSize: '1.1rem' }}>
            Menu
          </Typography>
        </Box>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? !!sidebarOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: 240,
          flexShrink: 0,
          display: { xs: 'block', md: 'block' },
          zIndex: (theme) => theme.zIndex.drawer,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
            zIndex: (theme) => theme.zIndex.appBar - 1,
          },
        }}
      >
        {/* spacer to avoid AppBar overlap on desktop */}
        {!isMobile && <Box sx={(theme) => theme.mixins.toolbar} />}
        <List>
          <ListItem
            button
            onClick={() => {
              handleNavigation();
              if (isMobile) handleDrawerToggle();
            }}
            sx={{
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <ListItemIcon>
              <Folder sx={{ color: '#181344' }} />
            </ListItemIcon>
            <ListItemText
              primary="Thrive Drive"
              primaryTypographyProps={{
                fontWeight: 'medium',
                color: '#181344',
              }}
            />
          </ListItem>
          <Divider sx={{ my: 1 }} />
          {user?.isHR && (
            <ListItem sx={{ px: 2, py: 1 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={handleNewClick}
                sx={{
                  backgroundColor: '#181344',
                  '&:hover': {
                    backgroundColor: '#0f0b2b',
                  },
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                New
              </Button>
            </ListItem>
          )}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                width: 280,
                boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              },
            }}
          >
            <MenuItem onClick={handleFileUpload}>
              <ListItemIcon>
                <InsertDriveFile fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="File upload" />
            </MenuItem>
            <MenuItem onClick={handleFolderUpload}>
              <ListItemIcon>
                <CreateNewFolder fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Folder upload" />
            </MenuItem>
            <Divider />
            {googleApps.map((app) => (
              <Tooltip key={app.name} title={`Create new ${app.name}`} placement="right">
                <MenuItem
                  component="a"
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ListItemIcon>{app.icon}</ListItemIcon>
                  <ListItemText primary={app.name} />
                </MenuItem>
              </Tooltip>
            ))}
          </Menu>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;