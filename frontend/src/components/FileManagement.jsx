import "../styles/FileManagement.css";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from "@mui/material/IconButton";
import api from "../api";
import { useState, useEffect, useRef, forwardRef } from 'react';

function FileManagement({handleUploadFile, setRefresh, selectedDate, selectedDashboardRegion}) {
    const regionMatch = {
        "-1": "All Regions",
        "53": "Bretagne",
        "28": "Normandie",
        "32": "Hauts-de-France",
        "44": "Grand Est",
        "11": "Île-de-France",
        "27": "Bourgogne-Franche-Comté",
        "24": "Centre-Val de Loire",
        "75": "Nouvelle-Aquitaine",
        "84": "Auvergne-Rhône-Alpes",
        "76": "Occitanie",
        "93": "Provanse-Alpes-Côte d'Azur",
        "94": "Corse"
    };
    const [listFiles, setListFiles] = useState([]);

    useEffect(() => {
        getListFiles();
    }, []);

    const getListFiles = () => {
        api
        .get("/api/fileupload/")
        .then((res) => res.data)
        .then((data) => {setListFiles(data)})
        .catch((err) => alert(err));
    };

    const deleteFile = (id) => {
        api
        .delete(`/api/fileupload/${id}/`)
        .then((res) => {
            if (res.status === 204) {
                console.log("File deleted successfully !");
            } else {
                alert("Failed to delete note !");
            };
            getListFiles();
        }).catch((err) => alert(err));
        setRefresh(prev => !prev);
    };
    
    const sortedListFiles = listFiles.sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        const regionDiff = a.region.localeCompare(b.region);
        if (regionDiff !== 0) return regionDiff;

        return a.title.localeCompare(b.title);
    });

    return (
        <div className="file-management-wrapper">
            <h1>Uploaded Documents</h1>
            <div className="file-list">
                {sortedListFiles.map((file, index) => (
                    <div className="file-card" key={index}>
                        <InsertDriveFileIcon className="file-management-item-icon" />
                        <a href={file.file} download target="_blank" rel="noopener noreferrer">
                            {file.title}
                        </a>
                        <p>{regionMatch[file.region]}</p>
                        <p>{file.date}</p>
                        <button className="delete-file-button" onClick={() => deleteFile(file.id)}><ClearIcon className="delete-file-icon" /></button>
                    </div>
                ))}
            </div>
            <div className="submit-wrapper">
                <h3>Upload a file</h3>
                <p>Choose a region and a date, and upload a file.</p>
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
                            onChange={(e) => {
                                    handleUploadFile({e, selectedDate, selectedDashboardRegion});
                                    setTimeout(() => {
                                        setRefresh(prev => !prev);
                                        getListFiles();
                                    }, 1000);
                                }}
                        />
                    <span className="upload-span">Submit File</span>
                </IconButton>
            </div>
            
        </div>
    );
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

export default FileManagement;
