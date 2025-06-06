import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from './navbar';
import Footer from './footer';

const LiveLocationPage = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError('Unable to fetch location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const center = {
    lat: location.latitude || 0,
    lng: location.longitude || 0,
  };

  return (
    <>
    <div>
        <Navbar/>
    </div>
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Your Live Location</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : location.latitude && location.longitude ? (
        <div>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
          <MapContainer
            center={center}
            zoom={15}
            style={{ width: '100%', height: '400px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={center}>
              <Popup>Your current location</Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
    <div>
        <Footer/>
    </div>
    </>
  );
};

export default LiveLocationPage;
