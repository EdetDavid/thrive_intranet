import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const RenameFolderDialog = ({ open, folder, onClose, onSubmit }) => {
  const [newName, setNewName] = useState(folder?.name || "");

  React.useEffect(() => {
    setNewName(folder?.name || "");
  }, [folder]);

  const handleSubmit = () => {
    if (newName.trim()) {
      onSubmit(newName.trim());
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Rename Folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="New Folder Name"
          type="text"
          fullWidth
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Rename</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameFolderDialog;
