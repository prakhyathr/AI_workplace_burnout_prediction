import React, { useState } from 'react';
import axios from 'axios';
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';

function App() {
  const [form, setForm] = useState({
    gender: 'Male',
    companyType: 'Product',
    wfhSetup: 'Yes',
    designation: 2,
    resourceAllocation: 5,
    mentalFatigue: 5.0
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      Gender: form.gender,
      Company_Type: form.companyType,
      WFH_Setup_Available: form.wfhSetup,
      Designation: form.designation,
      Resource_Allocation: form.resourceAllocation,
      Mental_Fatigue_Score: form.mentalFatigue
    };

    console.log("Sending payload:", payload);

    try {
      const res = await axios.post('http://localhost:5000/predict', payload);
      setResult(res.data);
    } catch (err) {
      alert("Prediction failed.");
      console.error("Error from backend:", err);
    }
  };

  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '5px' };
  const inputWrapper = { marginBottom: '1rem' };
  const sliderLabel = { marginLeft: '10px', fontWeight: 'bold' };

  const radarData = [
    { metric: 'Designation', value: form.designation },
    { metric: 'Resource Allocation', value: form.resourceAllocation },
    { metric: 'Mental Fatigue', value: form.mentalFatigue }
  ];

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>🧠 Employee Burnout Predictor</h1>

      <div style={inputWrapper}>
        <label style={labelStyle}>Gender:</label>
        <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      <div style={inputWrapper}>
        <label style={labelStyle}>Company Type:</label>
        <select name="companyType" value={form.companyType} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
          <option>Product</option>
          <option>Service</option>
        </select>
      </div>

      <div style={inputWrapper}>
        <label style={labelStyle}>WFH Setup:</label>
        <select name="wfhSetup" value={form.wfhSetup} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <div style={inputWrapper}>
        <label style={labelStyle}>Designation: <span style={sliderLabel}>{form.designation}</span></label>
        <input
          type="range"
          name="designation"
          min="0"
          max="4"
          value={form.designation}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={inputWrapper}>
        <label style={labelStyle}>Resource Allocation: <span style={sliderLabel}>{form.resourceAllocation}</span></label>
        <input
          type="range"
          name="resourceAllocation"
          min="1"
          max="10"
          value={form.resourceAllocation}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={inputWrapper}>
        <label style={labelStyle}>Mental Fatigue Score: <span style={sliderLabel}>{form.mentalFatigue}</span></label>
        <input
          type="range"
          name="mentalFatigue"
          min="0"
          max="10"
          step="0.1"
          value={form.mentalFatigue}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#3498db',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Predict
      </button>

      {result && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: result.burnout_class === 1 ? '#fdecea' : '#e8f8f5',
          border: `2px solid ${result.burnout_class === 1 ? '#e74c3c' : '#2ecc71'}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ color: result.burnout_class === 1 ? '#e74c3c' : '#2ecc71' }}>
            {result.burnout_class === 1 ? '🔥 High Burnout Risk' : '✅ Low Burnout Risk'}
          </h3>
          <p><strong>Burnout Probability:</strong> {result.burnout_probability}</p>
          <div style={{ marginTop: '10px', height: '20px', backgroundColor: '#ddd', borderRadius: '5px' }}>
            <div style={{
              width: `${result.burnout_probability * 100}%`,
              backgroundColor: result.burnout_class === 1 ? '#e74c3c' : '#2ecc71',
              height: '100%',
              borderRadius: '5px',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>

          {/* 🌐 Radar Chart */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: '#2c3e50' }}>Input Features Overview</h4>
            <RadarChart outerRadius={90} width={400} height={300} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar name="Input" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
