import React, { useState } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, set, get, query, equalTo, orderByChild } from "firebase/database";
import Navbar from '../home/Navbar';

const ModifyRoom = () => {
  const [floorNo, setFloorNo] = useState(""); // Floor Number
  const [inputValue1, setInputValue1] = useState(""); // Room Number
  const [inputValue2, setInputValue2] = useState(""); // Room Capacity
  const [error, setError] = useState(""); // Validation errors
  const [showAlert, setShowAlert] = useState(false); // Success alert
  const [roomExists, setRoomExists] = useState(false); // Room existence state
  const [isOccupied, setIsOccupied] = useState(false); // Occupancy state

  // Fetch room details based on selected floor and room number
  const fetchRoomDetails = async () => {
    setError(""); // Clear any previous errors
    const db = getDatabase(app);
    
    // Convert Room Number and Floor Number to integers for comparison
    const roomNo = parseInt(inputValue1, 10);
    const floorNumber = parseInt(floorNo, 10);

    // Query to fetch the room using both Floor Number and Room Number
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(roomNo));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomData = Object.values(snapshot.val()).find(room => room.FloorNo === floorNumber);
      if (roomData) {
        setInputValue2(roomData.RoomCapacity.toString());
        setIsOccupied(roomData.isOccupied); // Set the occupancy state
        setRoomExists(true);
      } else {
        setError("Room does not exist on this floor.");
        setRoomExists(false);
      }
    } else {
      setError("Room does not exist.");
      setRoomExists(false);
    }
  };

  const updateRoomData = async () => {
    const roomNo = parseInt(inputValue1, 10);
    const roomCapacity = parseInt(inputValue2, 10);
    const floorNumber = parseInt(floorNo, 10);

    // Validate Room Capacity
    if (isNaN(roomCapacity) || roomCapacity <= 0) {
      setError("Room Capacity must be a positive integer greater than 0.");
      return; // Stop execution if validation fails
    }

    // Check if room is occupied before updating
    if (isOccupied) {
      setError("Cannot modify an occupied room.");
      return;
    }

    // Clear error if validation passes
    setError("");

    const db = getDatabase(app);
    // Query to fetch the room using both Floor Number and Room Number
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(roomNo));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomData = Object.values(snapshot.val()).find(room => room.FloorNo === floorNumber);
      if (roomData) {
        const roomKey = Object.keys(snapshot.val()).find(key => snapshot.val()[key].FloorNo === floorNumber);
        const roomDocRef = ref(db, `FMS/Rooms/${roomKey}`);

        // Save the updated room details as integers
        set(roomDocRef, {
          RoomNo: roomNo,             // Save RoomNo as integer
          RoomCapacity: roomCapacity,  // Save RoomCapacity as integer
          FloorNo: floorNumber,        // Save FloorNo as integer
          isOccupied: roomData.isOccupied // Retain current occupation status
        })
        .then(() => {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false); // Hide alert after 3 seconds
            setRoomExists(false); // Reset room existence
            setInputValue1(""); // Clear inputs
            setInputValue2("");
            setFloorNo(""); // Reset floor number
            setIsOccupied(false); // Reset occupancy state
          }, 3000);
        })
        .catch((error) => {
          setError(`Error: ${error.message}`);
        });
      } else {
        setError("Room not found on this floor.");
      }
    } else {
      setError("Room not found.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Modify Room</h1>

        {showAlert && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-150">
            Room updated successfully!
          </div>
        )}

        <div className="w-full max-w-sm">
          {/* Select Floor Number and Room Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Floor Number</label>
            <input
              type="number"
              placeholder="Enter Floor Number"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Room Number to Modify</label>
            <input
              type="number"
              placeholder="Room Number"
              value={inputValue1}
              onChange={(e) => setInputValue1(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={fetchRoomDetails}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-150">
              Load Room Details
            </button>
          </div>

          {/* Modify Room Details */}
          {roomExists && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="number"
                  value={inputValue1}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Room Capacity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Room Capacity"
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
                onClick={updateRoomData}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-150">
                Update Room
              </button>
            </>
          )}

          {!roomExists && error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifyRoom;
