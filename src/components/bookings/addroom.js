import React, { useState } from 'react';
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

  // Function to check if the room number is unique on the same floor
  const isRoomNumberUnique = async (roomNo, floorNo) => {
    const db = getDatabase(app);
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(roomNo));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomsData = snapshot.val();
      // Check if any room with the same number exists on the specified floor
      return Object.values(roomsData).some(room => room.FloorNo === floorNo);
    }
    return false; // No existing room with that number
  };
  const saveData = async () => {
    const roomCapacity = parseInt(inputValue2, 10);
    const floorNumber = parseInt(floorNo, 10);
    const roomNo = parseInt(inputValue1, 10); // Convert room number to integer

    // Validate Room Capacity, Floor Number, and Room Number
    if (isNaN(roomCapacity) || roomCapacity <= 0) {
        setError("Room Capacity must be a positive integer greater than 0.");
        return; // Stop execution if validation fails
    }
    if (isNaN(floorNumber) || floorNumber < 0) {
        setError("Floor Number must be a non-negative integer.");
        return; // Stop execution if validation fails
    }
    if (isNaN(roomNo) || roomNo <= 0) {
        setError("Room Number must be a positive integer greater than 0.");
        return; // Stop execution if validation fails
    }

    // Check if the Room Number is unique on the same floor
    const roomExists = await isRoomNumberUnique(roomNo, floorNumber);

    if (roomExists) {
        setError(`Room number ${roomNo} already exists on Floor ${floorNumber}.`);
        return; // Stop execution if room number is not unique on that floor
    }

    // Clear error if validation passes and room number is unique
    setError("");

    const db = getDatabase(app);
    const newDocRef = push(ref(db, "FMS/Rooms"));
    set(newDocRef, {
        RoomNo: roomNo,            // Save as integer
        RoomCapacity: roomCapacity, // Save as integer
        FloorNo: floorNumber,       // Save as integer
        isOccupied: isOccupied
    })
    .then(() => {
        setShowAlert(true);
        setInputValue1(""); // Clear Room Number field
        setInputValue2(""); // Clear Room Capacity field
        setFloorNo(""); // Clear Floor Number field
        setIsOccupied(false); // Reset isOccupied to default

        setTimeout(() => {
            setShowAlert(false); // Hide alert after 3 seconds
        }, 3000);
    })
    .catch((error) => {
        alert(`Error: ${error.message}`);
    });
};

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Add Room to Floor</h1>

        {showAlert && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-200">
            Room added successfully!
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

          {/* Display validation error */}
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          <button
            onClick={saveData}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            Add Room
          </button>
        </div>

        <div className="mt-6 space-y-4"></div>
      </div>
    </div>
  );
}

export default Addroom;
