import "../styles/NoDocument.css";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

function NoDocument() {
  return (
    <div className="no-document-wrapper">
      <h1>No Document Found</h1>
      <p>There is no document to be analyzed yet. Please submit a file.</p>
        <button className="upload-button">
            <CloudUploadOutlinedIcon className="upload-icon" />
            <p>Upload Document</p>
        </button>
    </div>
  );
}

export default NoDocument;