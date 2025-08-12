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

// src/components/ImageUploaderCard.jsx
// This component is the modal for uploading images.

function ImageUploaderCard({ onClose, onImageUpload , updateProfile , role , fetchProfile, fetchUserId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchUserProfileAgain(role) {
    const id = await fetchUserId(role);
    if (id) {
      await fetchProfile(id);
    }
  }

  // Cloudinary credentials (only safe for frontend)
  const cloudinaryCloudName = "abdullahcloud";
  // You MUST set up an unsigned upload preset in your Cloudinary account
  const cloudinaryUploadPreset = "MY_UPLOAD_PRESET";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const uploadImage = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("Uploading...");

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
    
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-card">
        <div className="upload-card-header">
          <h3>Upload New Image</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="upload-card-body">
          <input type="file" onChange={handleFileChange} />
          <button
            className="upload-btn"
            onClick={uploadImage}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
          {message && <p className="upload-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
