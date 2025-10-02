import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
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
  Button,
  CircularProgress,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import ArchiveIcon from "@mui/icons-material/Archive";
import { toast } from "react-toastify";
import { fileAPI } from "../api/apiService";
import { renderAsync as renderDocx } from "docx-preview";
import * as XLSX from "xlsx";

// ---------- helpers ----------
const safeNumber = (val) =>
  typeof val === "number" && Number.isFinite(val) ? val : 0;

const formatFileSize = (bytes) => {
  const n = safeNumber(bytes);
  if (!n) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${parseFloat((n / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getExtension = (name = "") => {
  const parts = String(name).split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase();
};

const getFileIcon = (file) => {
  const ext = getExtension(file?.name);
  const fileType = file?.mimeType || file?.type || "";

  if (fileType.includes("pdf") || ext === "pdf")
    return <PictureAsPdfIcon sx={{ fontSize: 60, color: "#F44336" }} />;
  if (
    fileType.includes("image") ||
    ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext)
  )
    return <ImageIcon sx={{ fontSize: 60, color: "#4CAF50" }} />;
  if (fileType.includes("audio") || ["mp3", "wav", "aac", "ogg"].includes(ext))
    return <AudioFileIcon sx={{ fontSize: 60, color: "#2196F3" }} />;
  if (fileType.includes("video") || ["mp4", "mov", "mkv", "webm"].includes(ext))
    return <VideoFileIcon sx={{ fontSize: 60, color: "#FF5722" }} />;
  if (
    fileType.includes("zip") ||
    ["zip", "rar", "7z", "tar", "gz"].includes(ext)
  )
    return <ArchiveIcon sx={{ fontSize: 60, color: "#795548" }} />;
  if (["doc", "docx"].includes(ext))
    return <DescriptionIcon sx={{ fontSize: 60, color: "#1976D2" }} />;
  if (["xls", "xlsx"].includes(ext))
    return <DescriptionIcon sx={{ fontSize: 60, color: "#388E3C" }} />;
  if (["ppt", "pptx"].includes(ext))
    return <DescriptionIcon sx={{ fontSize: 60, color: "#D32F2F" }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 60, color: "#757575" }} />;
};

// Detect PDFs even when filename/mime is missing
const isPdfBlob = async (blob) => {
  try {
    const ab = await blob.slice(0, 4).arrayBuffer();
    const u8 = new Uint8Array(ab);
    return u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46; // %PDF
  } catch {
    return false;
  }
};

// ---------- component ----------
// Configure react-pdf worker to the public worker file
pdfjs.GlobalWorkerOptions.workerSrc =
  process.env.PUBLIC_URL + "/pdf.worker.min.js";

const FileBrowser = ({ files, folders, isHR, onRefresh }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState(""); // 'pdf' | 'image' | 'docx' | 'excel'
  const [docxHtml, setDocxHtml] = useState("");
  const [excelHtml, setExcelHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false); // NEW: loading state for preview
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(null);

  // pdf plugin removed because we're using react-pdf Document/Page for previews
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event, item, type) => {
    setSelectedItem({ ...item, type });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handlePreviewClose = () => {
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    } catch {}
    setPreviewOpen(false);
    setPreviewUrl("");
    setPreviewType("");
    setDocxHtml("");
    setExcelHtml("");
    setPdfPage(1);
    setPdfNumPages(null);
  };

  const handleDownload = async () => {
    try {
      if (!selectedItem) return;
      if (selectedItem.type === "file") {
        const { blob } = await fileAPI.download(selectedItem.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedItem.name || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download started");
      } else if (selectedItem.type === "folder") {
        if (!fileAPI.downloadFolderZip) {
          toast.error("Folder download not supported");
          return;
        }
        const { blob } = await fileAPI.downloadFolderZip(selectedItem.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedItem.name || "folder"}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Folder download started");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to download");
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
      if (!selectedItem) return;
      const id = selectedItem.id;
      if (selectedItem.type === "file") {
        if (id == null) {
          toast.error("Invalid file ID");
          return;
        }
        await fileAPI.delete(id);
        toast.success("File deleted successfully");
      } else if (selectedItem.type === "folder") {
        if (id == null) {
          toast.error("Invalid folder ID");
          return;
        }
        await fileAPI.deleteFolder(id);
        toast.success("Folder deleted successfully");
      }
      onRefresh && onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete");
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleView = async () => {
    try {
      if (!selectedItem) return;
      if (selectedItem.type === "folder") {
        toast.info(`Open folder: ${selectedItem.name}`);
        return;
      }
      setLoadingPreview(true);
      const { blob, filename } = await fileAPI.download(
        selectedItem.id,
        selectedItem
      );
      const ext = getExtension(filename || selectedItem.name);
      const mime = blob?.type || "";

      // For PDFs, open in native browser viewer (new tab)
      if (
        ext === "pdf" ||
        mime === "application/pdf" ||
        (await isPdfBlob(blob))
      ) {
        // Open a blank window synchronously to avoid popup blockers.
        const newWindow = window.open("", "_blank");
        try {
          const url = window.URL.createObjectURL(blob);
          if (!newWindow) {
            // Popup blocked — try anchor trick to open in new tab
            try {
              const a = document.createElement('a');
              a.href = url;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              document.body.appendChild(a);
              a.click();
              a.remove();
            } catch (e) {
              // Fallback to in-app preview using dialog
              setPreviewUrl(url);
              setPreviewType("pdf");
              setPreviewOpen(true);
            }
          } else {
            // Set location of the previously opened window to the blob URL
            try {
              newWindow.location = url;
            } catch (err) {
              // Some browsers may restrict setting location; fallback to preview
              setPreviewUrl(url);
              setPreviewType("pdf");
              setPreviewOpen(true);
            }
            // Schedule revoke after a delay so the new tab can load the resource
            setTimeout(() => {
              try {
                window.URL.revokeObjectURL(url);
              } catch {}
            }, 10000);
          }
        } catch (e) {
          console.error(e);
          toast.error("Failed to open PDF in browser");
          if (newWindow) try { newWindow.close(); } catch {}
        } finally {
          setLoadingPreview(false);
        }
        return;
      }

      if (
        ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext) ||
        mime.startsWith("image/")
      ) {
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewType("image");
        setPreviewOpen(true);
        setLoadingPreview(false);
        return;
      }

      if (["doc", "docx"].includes(ext)) {
        setPreviewType("docx");
        setDocxHtml("");
        setPreviewOpen(true);
        setTimeout(async () => {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const tmp = document.createElement("div");
            await renderDocx(arrayBuffer, tmp);
            setDocxHtml(tmp.innerHTML || "<p>(empty)</p>");
          } catch (e) {
            console.error(e);
            toast.error("Failed to render DOCX");
            handlePreviewClose();
          } finally {
            setLoadingPreview(false);
          }
        }, 0);
        return;
      }

      if (["xls", "xlsx"].includes(ext)) {
        setPreviewType("excel");
        setExcelHtml("");
        setPreviewOpen(true);
        setTimeout(async () => {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              blankrows: false,
            });
            const limited = rows.slice(0, 50).map((r) => r.slice(0, 20));
            let html = `<h4>${sheetName}</h4><table><tbody>`;
            for (const r of limited)
              html +=
                "<tr>" + r.map((c) => `<td>${c ?? ""}</td>`).join("") + "</tr>";
            html += "</tbody></table>";
            setExcelHtml(html);
          } catch (e) {
            console.error(e);
            toast.error("Failed to render Excel");
            handlePreviewClose();
          } finally {
            setLoadingPreview(false);
          }
        }, 0);
        return;
      }

      // Fallback: download unknown types (but NOT pdf)
      if (ext !== "pdf" && mime !== "application/pdf") {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || selectedItem.name || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to preview PDF");
      }
      setLoadingPreview(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to view file");
      setLoadingPreview(false);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* Folders */}
        {Array.isArray(folders) &&
          folders.map((folder) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`folder-${folder.id}`}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: { xs: 1, sm: 2 },
                    pb: 0,
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      py: { xs: 1, sm: 2 },
                    }}
                  >
                    <FolderIcon
                      sx={{
                        fontSize: { xs: 36, sm: 48, md: 60 },
                        color: "#FFA000",
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{ flexGrow: 1, pt: 1, px: 0, width: "100%" }}
                  >
                    <Tooltip title={folder.name} placement="top">
                      <Typography
                        variant="subtitle1"
                        noWrap
                        textAlign="center"
                        sx={{
                          fontWeight: "medium",
                          color: "#181344",
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                        }}
                      >
                        {folder.name}
                      </Typography>
                    </Tooltip>
                  </CardContent>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, folder, "folder")}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}

        {/* Files */}
        {Array.isArray(files) &&
          files.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`file-${file.id}`}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: { xs: 1, sm: 2 },
                    pb: 0,
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      py: { xs: 1, sm: 2 },
                    }}
                  >
                    {getFileIcon(file)}
                  </Box>
                  <CardContent
                    sx={{ flexGrow: 1, pt: 1, px: 0, width: "100%" }}
                  >
                    <Tooltip title={file.name} placement="top">
                      <Typography
                        variant="subtitle1"
                        noWrap
                        textAlign="center"
                        sx={{
                          fontWeight: "medium",
                          color: "#181344",
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.95rem" } }}
                    >
                      {formatFileSize(file.size)}
                    </Typography>
                  </CardContent>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, file, "file")}
                    sx={{ position: "absolute", top: 8, right: 8 }}
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
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            minWidth: "200px",
          },
        }}
      >
        <MenuItem onClick={handleView} sx={{ color: "#181344" }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: "#181344" }} />
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.type === "file" ? "View File" : "Open Folder"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload} sx={{ color: "#181344" }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" sx={{ color: "#181344" }} />
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.type === "file"
              ? "Download File"
              : "Download Folder"}
          </ListItemText>
        </MenuItem>
        {isHR && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: "#ED1C24" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "#ED1C24" }} />
            </ListItemIcon>
            <ListItemText>
              {selectedItem?.type === "file" ? "Delete File" : "Delete Folder"}
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
      >
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent
          sx={{
            textAlign: "center",
            p: { xs: 1, sm: 2 },
            maxHeight: { xs: 400, sm: 500 },
            overflowY: "auto",
          }}
        >
          <Typography variant="body1">
            Are you sure you want to delete this{" "}
            {selectedItem?.type === "file" ? "file" : "folder"}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: "#181344", fontSize: { xs: "0.95rem", sm: "1rem" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: "#ED1C24",
              fontSize: { xs: "0.95rem", sm: "1rem" },
              "&:hover": { backgroundColor: "#C2181F" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal for images, PDFs, Word, and Excel */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: "100%", sm: 1200 },
            maxWidth: "100vw",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          File Preview
        </DialogTitle>
        <DialogContent
          sx={{
            textAlign: "center",
            p: { xs: 1, sm: 2 },
            maxHeight: { xs: 400, sm: 500 },
            overflowY: "auto",
          }}
        >
          {loadingPreview ? (
            <Box
              sx={{
                width: "100%",
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={48} />
            </Box>
          ) : (
            <>
              {previewType === "pdf" && (
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 350, sm: 400 },
                    minHeight: 250,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 1,
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                      disabled={pdfPage <= 1}
                    >
                      Prev
                    </Button>
                    <Typography variant="body2">
                      Page {pdfPage}
                      {pdfNumPages ? ` / ${pdfNumPages}` : ""}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() =>
                        setPdfPage((p) =>
                          pdfNumPages ? Math.min(pdfNumPages, p + 1) : p + 1
                        )
                      }
                      disabled={pdfNumPages && pdfPage >= pdfNumPages}
                    >
                      Next
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Document
                      file={previewUrl}
                      onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
                      loading={<CircularProgress />}
                      error={() => <Typography>Failed to load PDF</Typography>}
                    >
                      <Page pageNumber={pdfPage} width={800} />
                    </Document>
                  </Box>
                </Box>
              )}
              {previewType === "image" && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              )}
              {previewType === "docx" && (
                <Box
                  sx={{
                    width: "100%",
                    background: "#fff",
                    p: 1,
                    overflowX: "auto",
                    maxHeight: { xs: 350, sm: 500 },
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  {docxHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
                  ) : (
                    <CircularProgress />
                  )}
                </Box>
              )}
              {previewType === "excel" && (
                <Box
                  sx={{
                    width: "100%",
                    background: "#fff",
                    p: 1,
                    overflowX: "auto",
                    maxHeight: { xs: 350, sm: 500 },
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  {excelHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: excelHtml }} />
                  ) : (
                    <CircularProgress />
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handlePreviewClose}
            color="primary"
            sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileBrowser;
