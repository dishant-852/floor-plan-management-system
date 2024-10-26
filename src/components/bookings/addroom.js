import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, set, push, get, query, orderByChild, equalTo } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import Navbar from '../home/Navbar';

function Addroom() {
  const navigate = useNavigate(); 
  const [inputValue1, setInputValue1] = useState(""); // Room number
  const [inputValue2, setInputValue2] = useState(""); // Room capacity
  const [floorNo, setFloorNo] = useState(""); // Floor number
  const [isOccupied, setIsOccupied] = useState(false); // Room occupation status
  const [showAlert, setShowAlert] = useState(false); // State for success alert
  const [error, setError] = useState(""); // State for validation errors

  useEffect(() => {
    if (navigator.onLine) {
      console.log("Online on load, syncing offline data if available.");
      syncOfflineData();
    }

    // Sync offline data when the connection goes online
    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  const isRoomNumberUnique = async (roomNo, floorNo) => {
    const db = getDatabase(app);
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(roomNo));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomsData = snapshot.val();
      return Object.values(roomsData).some(room => room.FloorNo === floorNo);
    }
    return false;
  };

  const saveData = async () => {
    const roomCapacity = parseInt(inputValue2, 10);
    const floorNumber = parseInt(floorNo, 10);
    const roomNo = parseInt(inputValue1, 10);

    // Validate Room Capacity, Floor Number, and Room Number
    if (isNaN(roomCapacity) || roomCapacity <= 0) {
      setError("Room Capacity must be a positive integer greater than 0.");
      return;
    }
    if (isNaN(floorNumber) || floorNumber < 0) {
      setError("Floor Number must be a non-negative integer.");
      return;
    }
    if (isNaN(roomNo) || roomNo <= 0) {
      setError("Room Number must be a positive integer greater than 0.");
      return;
    }

    const roomExists = await isRoomNumberUnique(roomNo, floorNumber);
    if (roomExists) {
      setError(`Room number ${roomNo} already exists on Floor ${floorNumber}.`);
      return;
    }

    setError("");

    const roomData = {
      RoomNo: roomNo,
      RoomCapacity: roomCapacity,
      FloorNo: floorNumber,
      isOccupied
    };

    if (navigator.onLine) {
      console.log("Online: Saving room data to Firebase.");
      saveToFirebase(roomData);
    } else {
      saveToLocalStorage(roomData);
    }
  };

  const saveToFirebase = async (roomData) => {
    const db = getDatabase(app);
    const newDocRef = push(ref(db, "FMS/Rooms"));
    try {
      await set(newDocRef, roomData);
      console.log("Room data saved to Firebase:", roomData);
      showSuccessMessage("Room added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving to Firebase:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

 
  const saveToLocalStorage = (roomData) => {
    const offlineData = JSON.parse(localStorage.getItem("offlineRoomData")) || [];
    
    // Check if the room already exists in offline storage
    const roomExists = offlineData.some(
      (room) => room.RoomNo === roomData.RoomNo && room.FloorNo === roomData.FloorNo
    );
  
    if (roomExists) {
      console.log("Room already exists in local storage:", roomData);
      showSuccessMessage("Room already saved locally and will sync when online.");
      return;
    }
  
    // Add room data if it does not exist
    offlineData.push(roomData);
    localStorage.setItem("offlineRoomData", JSON.stringify(offlineData));
    console.log("Room data saved to local storage:", roomData);
    showSuccessMessage("Room saved locally. It will sync when online.");
  };
  

  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem("offlineRoomData"));
    if (offlineData && offlineData.length > 0) {
      console.log("Syncing offline data to Firebase. Data to sync:", offlineData);
      for (const roomData of offlineData) {
        await saveToFirebase(roomData);  // Wait for each room to be saved
      }
      localStorage.removeItem("offlineRoomData");
      console.log("Offline data synced to Firebase and cleared from local storage.");
    } else {
      console.log("No offline data to sync.");
    }
  };

  const showSuccessMessage = (message) => {
    setShowAlert(message);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const resetForm = () => {
    setInputValue1("");
    setInputValue2("");
    setFloorNo("");
    setIsOccupied(false);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Add Room to Floor</h1>

        {showAlert && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-200">
            {showAlert}
          </div>
        )}

        <div className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Floor Number</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter Floor Number"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type='number'
              placeholder='Enter Room Number'
              value={inputValue1}
              onChange={(e) => setInputValue1(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Room Capacity</label>
            <input
              type='number'
              min="1"
              step="1"
              placeholder='Enter Room Capacity'
              value={inputValue2}
              onChange={(e) => setInputValue2(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          <button
            onClick={saveData}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            Add Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Addroom;