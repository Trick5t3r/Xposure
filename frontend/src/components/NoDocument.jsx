import "../styles/NoDocument.css";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import IconButton from "@mui/material/IconButton";

function NoDocument({handleUploadFile}) {
  return (
    <div className="no-document-wrapper">
      <h1>No Document Found</h1>
      <p>There is no document available for this period and region yet. Please select a PDF document to submit or change the time period or region by clicking on the map or on the black button.</p>
            <IconButton
              color="primary"
              component="label"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 15px",
                textAlign: "center",
                color: "var(--text)",
                backgroundColor: "var(--background)",
                borderRadius: "15px",
                border: "1px solid var(--background)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "var(--text)",
                  color: "var(--background)",
                  transform: "scale(1.02)",
                },
                "&:active": {
                  transform: "scale(1)",
                },
              }}
            >
              <CloudUploadOutlinedIcon className="upload-icon" />
              <input
                type="file"
                hidden
                onChange={handleUploadFile}
              />
            <span className="upload-span">Upload Document</span>
            </IconButton>
    </div>
  );
}

export default NoDocument;