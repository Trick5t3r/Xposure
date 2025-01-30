import "../styles/NoDocument.css";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

function NoDocument() {
  return (
    <div className="no-document-wrapper">
      <h1>No Document Found</h1>
      <p>There is no document available for this period and region yet. Please select a PDF document to submit or change the time period or region by clicking on the map or on the black button.</p>
        <button className="upload-button">
            <CloudUploadOutlinedIcon className="upload-icon" />
            <p>Upload Document</p>
        </button>
    </div>
  );
}

export default NoDocument;