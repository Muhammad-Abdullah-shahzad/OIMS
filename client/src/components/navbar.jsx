// src/components/NavBar.jsx
import React, { useState , useEffect} from "react";

import "./NavBar.css";

import { Link } from "react-router-dom";

import { FaBars, FaTimes } from "react-icons/fa";

import logo from "../assets/company-logo.jpg";

import ProfileCard from "./ProfileCard";

const NavBar = ({ navLinks, showProfile, hamburgerShow, role }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [userId,setUserId] = useState(null);
  const BASE_URL = "https://oimsapi.oradigitals.com";
  const [isProfileUpdated,setIsProfileUpdated] = useState(false);
  // Placeholder user data. In a real app, this would be managed by state or context.
  const [userProfileData, setUserProfileData] = useState({
    firstName: "",
    lastName:"",
    profileId:null,
    userId: "",
    role: "",
    email: "",
    profile_image_url: "",
  });
  
  async function fetchUserId(role) {
    try{
      const response = await fetch(`${BASE_URL}/users/getid/${role}`,{
        headers:{
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type': 'application/json'
        }
      })
      if(!response.ok){
        throw new Error("failed to get user id ",role);
      }
        const {userId} = await response.json();
       
        return userId;
    }
    catch(error){
      console.log(error);
    }
  }
  async function fetchProfile(userId) {
    try {
      const response = await fetch(`${BASE_URL}/profile/${userId}`,{
        headers:{
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error("failed to get user profile");
      }
      const profile = await response.json();
      setUserProfileData({ ...profile,role });
  console.log("user profile comming from backend");
    } catch (error) {
      console.log(error);
    }
  }

 async function updateProfile(newProfilePictureURL) {
  try {
    const response = await fetch(`${BASE_URL}/profile/edit/${userProfileData.profileId}`,{
      headers:{
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type': 'application/json'
      },
      method:"PUT",
      body:JSON.stringify({
       profile_image_url:newProfilePictureURL,
       userId:parseInt(userProfileData.userId)
      })


    })
    if(!response.ok){
      throw new Error("failed to update profile " );
    }
    console.log(await response.json());
  } catch (error) {
    console.log(error);
  }
  }
  // on initail Navbar render fetch user profile
 useEffect(() => {
  
  async function init(role) {
    const id = await fetchUserId(role);
    if (id) {
      await fetchProfile(id);
    }
  }

  if(role && role==="super_admin"){
    init(role);
  }

}, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
    setMenuOpen(false);
  };

  const handleAddImageClick = () => {
    setShowProfileCard(false); // Hide the profile card
    setShowImageUploader(true); // Show the image uploader modal
  };

  const handleImageUpload = (url) => {
    // Update the user data with the new profile image URL
    setUserProfileData((prevData) => ({ ...prevData, profile_image_url: url }));
    setShowImageUploader(false); // Hide the uploader after a successful upload
    // You would typically save this new URL to your backend/database here
  };

  const setButtonText = () => {
    return isLogin ? "log out" : "log in";
  };

  const setPath = () => {
    return isLogin ? "" : "/login";
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={logo} alt="company-logo" />
          OraDigitals
        </div>
        {hamburgerShow && (
          <div className="hamburger" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        )}
         {navLinks.length > 0 && (
          <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
            {navLinks.map((navLink, index) => {
              return (
                <li key={index}>
                  <Link to={navLink.path} onClick={closeMenu}>
                    {navLink.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div className="profile-login-wrapper">
          <div>
            <Link
              className="btn btn-login"
              to={setPath()}
              onClick={() => {
                if (localStorage.token) {
                  localStorage.clear();
                  setIsLogin(false);
                }
              }}
            >
              {setButtonText()}
            </Link>
          </div>
          {showProfile && (
            <div className="profile-container">
              <img
                className="profile-pic"
                src={userProfileData.profile_image_url || 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-2409187029.jpg'}
                alt="User Profile"
                onClick={toggleProfileCard}
              />
              {showProfileCard && (
                <ProfileCard
                  userData={userProfileData}
                  onAddImageClick={handleAddImageClick}
                />
              )}
            </div>
          )}
        </div>
       
      </nav>
      {showImageUploader && (
        <ImageUploaderCard
          fetchUserId={fetchUserId}
          fetchProfile={fetchProfile}
          updateProfile={updateProfile}
          onClose={() => setShowImageUploader(false)}
          onImageUpload={handleImageUpload}
          role={role}
        />
      )}
    </>
  );
};

export default NavBar;

function ImageUploaderCard({ onClose, onImageUpload, updateProfile, role, fetchProfile, fetchUserId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(''); // 'info', 'success', 'error'

  async function fetchUserProfileAgain(role) {
    const id = await fetchUserId(role);
    if (id) {
      await fetchProfile(id);
    }
  }

  // Cloudinary credentials (only safe for frontend)
  const cloudinaryCloudName = "abdullahcloud";
  const cloudinaryUploadPreset = "MY_UPLOAD_PRESET";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage(selectedFile ? `Selected: ${selectedFile.name}` : "");
    setStatus('info');

    // Update the data-filename attribute on the label for CSS display
    const label = document.querySelector('.image-uploader__file-label');
    if (label && selectedFile) {
        label.setAttribute('data-filename', selectedFile.name);
    }
  };

  const uploadImage = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      setStatus('error');
      return;
    }

    setLoading(true);
    setMessage("Uploading...");
    setStatus('info');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Image upload failed.");
      }

      const data = await response.json();
      const url = data.secure_url;
      
      await updateProfile(url);
      await fetchUserProfileAgain(role);

      onImageUpload(url); //Pass the URL back to the parent component
      setMessage("Upload Successful!");
      setStatus('success');
    
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-uploader__modal-overlay">
      <div className="image-uploader__card">
        <div className="image-uploader__card-header">
          <h3 className="image-uploader__card-title">Upload New Image</h3>
          <button className="image-uploader__close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="image-uploader__card-body">
          {/* Custom File Input */}
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="image-uploader__hidden-input"
          />
          <label 
            htmlFor="file-upload" 
            className={`image-uploader__file-label ${file ? 'image-uploader__file-label--selected' : ''}`}
          >
            <svg className="image-uploader__upload-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            <span className="image-uploader__upload-text">
                {file ? `Selected: ${file.name}` : "Drag & drop or click to upload an image"}
            </span>
          </label>

          <button
            className="image-uploader__upload-btn"
            onClick={uploadImage}
            disabled={loading || !file}
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
          {message && <p className={`image-uploader__message image-uploader__message--${status}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

// export default ImageUploaderCard;

// export default ImageUploaderCard;