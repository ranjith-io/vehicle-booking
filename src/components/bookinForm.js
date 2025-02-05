import React, { useState } from "react";
import "./bookingForm.css";
import "firebase/compat/auth";
import firebase from "../utils/firebaseconfig";



function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    bookingDate: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);  // State to track OTP verification
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = (e) => {
    e.preventDefault();
  
    const phoneNumber = formData.phone.startsWith("+")
      ? formData.phone
      : `+91${formData.phone}`; // Add country code if missing
  
    const appVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
      size: "invisible", // Or 'normal' for a visible widget
      callback: (response) => {
        console.log("ReCAPTCHA solved, ready to send OTP.");
      },
    });
  
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        setOtpSent(true);
        alert("OTP sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.message);
        alert(`Failed to send OTP: ${error.message}`);
      });
  };
  

  const verifyOtp = (e) => {
    e.preventDefault();
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(() => {
        alert("OTP verified! Booking confirmed.");
        setOtpVerified(true);
        console.log("Booking Details:", formData);
      })
      .catch((error) => {
        console.error("OTP verification failed:", error);
        alert("Invalid OTP. Try again.");
      });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send the form data to the backend
    try {
      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the form data to the backend
      });

      const data = await response.json();
      if (data.message) {
        alert(data.message); // Success message from the backend
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      
      <label>
        Vehicle Type</label>
        <select className="select"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          required
        >
          <option value="">Select vehicle</option>
          <option value="Backhoe Loader">Backhoe Loader</option>
          <option value="Crane">Crane</option>
          <option value="Bulldozer">Bulldozer</option>
          <option value="Recovery Van">Recovery Van</option>
        </select>
      
      <label>
        Booking Date</label>
        <input
          type="date"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          required
        />
     
      <label>
        Phone Number:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={otpSent}
        />
      
      {otpSent ? (
        <>
          <label>
            Enter OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      ) : (
        <button onClick={sendOtp}>Send OTP</button>
        
      )}
      {otpVerified && (
        <button type="submit">book now</button>
      )}
    
      <div id="recaptcha-container"></div>
    </form>
  );
}

export default BookingForm;
