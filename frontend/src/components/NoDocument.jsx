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
                bgcolor: "secondary.main",
                color: "#fff",
                borderRadius: "50%",
                '&:hover': {
                  bgcolor: "secondary.dark",
                },
              }}
            >
              <CloudUploadOutlinedIcon className="upload-icon" />
              <input
                type="file"
                hidden
                onChange={handleUploadFile}
              />
            <p>Upload Document</p>
            </IconButton>
    </div>
  );
}

export default NoDocument;