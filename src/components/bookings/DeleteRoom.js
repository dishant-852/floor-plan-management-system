
import React, { useState } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, equalTo, orderByChild, remove } from "firebase/database";
import Navbar from '../home/Navbar';

const DeleteRoom = () => {
  const [floorNo, setFloorNo] = useState(""); // Floor number input
  const [roomNumber, setRoomNumber] = useState(""); // Room number input
  const [error, setError] = useState(""); // Validation errors
  const [showAlert, setShowAlert] = useState(false); // Success alert
  const [roomExists, setRoomExists] = useState(false); // Room existence state

  // Fetch room details based on entered floor number and room number to verify its existence
  const checkRoomExists = async (floorNo, roomNo) => {
    setError(""); // Clear previous errors
    const db = getDatabase(app);
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(parseInt(roomNo, 10))); // Parse roomNo to integer
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomEntries = Object.entries(snapshot.val());
      for (const [roomKey, roomData] of roomEntries) {
        if (roomData.FloorNo === parseInt(floorNo, 10)) {
          setRoomExists(true); // Room exists, proceed to delete
          return { roomKey, roomData }; // Return room key and data for further use
        }
      }
      setError("Room does not exist on this floor.");
      setRoomExists(false); // Room doesn't exist on this floor
      return null;
    } else {
      setError("Room does not exist.");
      setRoomExists(false); // Room doesn't exist
      return null;
    }
  };

  const deleteRoomData = async () => {
    // Validate if both floor number and room number have been entered
    if (floorNo.trim() === "" || roomNumber.trim() === "") {
      setError("Please enter valid floor and room numbers.");
      return;
    }

    // Check if the room exists
    const roomDetails = await checkRoomExists(floorNo, roomNumber);

    if (roomDetails) {
      const { roomKey, roomData } = roomDetails;

      // Check if the room is occupied
      if (roomData.isOccupied) {
        setError("Cannot delete a currently occupied room.");
        return; // Stop execution if the room is occupied
      }

      const db = getDatabase(app);
      const roomDocRef = ref(db, `FMS/Rooms/${roomKey}`);

      // Remove the room
      remove(roomDocRef)
        .then(() => {
          setShowAlert(true); // Show success alert
          setTimeout(() => {
            setShowAlert(false); // Hide alert after 3 seconds
            setRoomNumber(""); // Clear input after deletion
            setFloorNo(""); // Clear floor number input
            setRoomExists(false); // Reset state
          }, 3000);
        })
        .catch((error) => {
          setError(`Error: ${error.message}`);
        });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Remove Room</h1>

        {showAlert && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-200">
            Room removed successfully!
          </div>
        )}

        <div className="w-full max-w-sm">
          {/* Input for Floor Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Floor Number</label>
            <input
              type="number"
              placeholder="Enter Floor Number"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Input for Room Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Room Number to Remove</label>
            <input
              type="number"
              placeholder="Room Number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            onClick={deleteRoomData}
            className="mt-1 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
            Remove Room
          </button>

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteRoom;