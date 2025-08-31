import React, { useState } from 'react';
import { Cloud, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import '../styles/ImageUploader.scss';

// Cloudinary credentials (from provided user data)
const cloudinaryCloudName = "abdullahcloud";
const cloudinaryUploadPreset = "MY_UPLOAD_PRESET";
const BASE_URL = `http://localhost:5000`
const ImageUploaderComponent = ({ employeeId, onUploadSuccess, onCancel }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setUploadSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }

        setLoading(true);
        setError(null);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', cloudinaryUploadPreset);

        try {
            // Step 1: Upload image to Cloudinary
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;
            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || "Cloudinary upload failed.");
            }

            const data = await response.json();
            const imageUrl = data.secure_url;

            // Step 2: Update employee profile with the new image URL
            const token = localStorage.getItem("token");
            const updateApiUrl = `${BASE_URL}/employee/profile/edit/${employeeId}`;
            
            const updateResponse = await fetch(updateApiUrl, {
                method: 'PUT', // Assuming the API uses PUT for updates
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    profile_image_url: imageUrl, 
                    employee_id: employeeId 
                }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.message || "Failed to update employee profile.");
            }

            setUploadSuccess(true);
            onUploadSuccess(imageUrl);
            console.log("Profile updated successfully with new image URL:", imageUrl);

        } catch (err) {
            console.error("Upload process failed:", err);
            setError(err.message || "An unexpected error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay">
        <div className="image-uploader">
            <div className="cross" onClick={onCancel}>
                <X size={14} />
            </div>
            <h3 className="uploader-title">Upload Profile Picture</h3>
            <p className="uploader-subtitle">Upload a new image to update the employee's profile.</p>

            <div className="upload-area">
                <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                    <Cloud size={48} className="cloud-icon" />
                    <span className="file-input-text">
                        {selectedFile ? selectedFile.name : "Click to select a file"}
                    </span>
                    <span className="file-input-btn">Browse</span>
                </label>
            </div>

            {selectedFile && (
                <div className="upload-actions">
                    <button
                        onClick={handleUpload}
                        className="upload-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload Image
                            </>
                        )}
                    </button>
                    <button onClick={onCancel} className="cancel-button">
                        <X size={18}/>
                        Cancel
                    </button>
                </div>
            )}

            {uploadSuccess && (
                <div className="upload-status success">
                    <CheckCircle size={20} />
                    <span>Upload successful!</span>
                </div>
            )}

            {error && (
                <div className="upload-status error">
                    <AlertCircle size={20} />
                    <span>Error: {error}</span>
                </div>
            )}
        </div>
        </div>
    );
};

export default ImageUploaderComponent;