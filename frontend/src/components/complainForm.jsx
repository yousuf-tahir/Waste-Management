// ComplaintForm.jsx
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import './styles.css';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    area: '',
    postalCode: '',
    wasteCategory: '',
    description: '',
    wasteImage: null,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      wasteImage: file,
    });

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnail(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      formData.email &&
      formData.area &&
      formData.postalCode &&
      formData.wasteCategory &&
      formData.description &&
      formData.wasteImage
    ) {
      console.log('Form Submitted:', formData);
      // Navigate to the payment page
      navigate('/Payment');
    } else {
      alert('Please fill in all the required fields.');
    }
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="complaint-form-container">
        <h2>Submit Your Complaint</h2>
        <form onSubmit={handleSubmit} className="complaint-form">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <label>Area:</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            required
          />

          <label>Postal Code:</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
          />

          <label>Waste Category:</label>
          <select
            name="wasteCategory"
            value={formData.wasteCategory}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            <option value="plastic">Plastic</option>
            <option value="organic">Organic</option>
            <option value="metal">Metal</option>
          </select>

          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          ></textarea>

          <label>Upload Waste Image:</label>
          <input
            type="file"
            name="wasteImage"
            onChange={handleFileChange}
            accept="image/*"
            required
          />

          {thumbnail && (
            <div className="thumbnail-preview">
              <p>Image Preview:</p>
              <img src={thumbnail} alt="Thumbnail Preview" />
            </div>
          )}

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
};

export default ComplaintForm;
