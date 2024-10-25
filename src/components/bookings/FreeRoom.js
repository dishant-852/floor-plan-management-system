import React, { useState } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import Navbar from '../home/Navbar';

const FreeRoom = () => {
  const [roomNo, setRoomNo] = useState(""); // Room number input
  const [floorNo, setFloorNo] = useState(""); // Floor number input
  const [error, setError] = useState(""); // Error handling
  const [showAlert, setShowAlert] = useState(false); // Success alert

  const freeRoom = async () => {
    // Validate inputs
    const roomNumber = parseInt(roomNo, 10);
    const floorNumber = parseInt(floorNo, 10);

    if (isNaN(roomNumber) || isNaN(floorNumber) || roomNumber <= 0 || floorNumber <= 0) {
      setError("Please enter valid Room and Floor numbers.");
      return;
    }

    try {
      const db = getDatabase(app);

      // Reference to all rooms in the database
      const roomsRef = ref(db, 'FMS/Rooms');

      // Query to search rooms by RoomNo
      const roomNoQuery = query(roomsRef, orderByChild('RoomNo'), equalTo(roomNumber));
      const snapshot = await get(roomNoQuery);

      // Check if the room with the specified RoomNo exists
      if (snapshot.exists()) {
        const rooms = snapshot.val();

        // Find the room with the matching FloorNo
        let roomKey = null;
        Object.keys(rooms).forEach((key) => {
          if (rooms[key].FloorNo === floorNumber) {
            roomKey = key;
          }
        });

        if (roomKey) {
          const room = rooms[roomKey];

          // Check if the room is already free
          if (room.isOccupied === false) {
            setError("Room is already free.");
          } else {
            // Room is occupied, proceed to free it
            const roomRef = ref(db, `FMS/Rooms/${roomKey}`);

            // Update only the isOccupied property to false (freeing the room)
            await update(roomRef, { isOccupied: false });

            // Show success message
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);

            // Reset inputs
            setRoomNo("");
            setFloorNo("");
            setError(""); // Clear any previous error
          }
        } else {
          setError("No room found with the specified RoomNo and FloorNo.");
        }
      } else {
        setError("Room with the specified RoomNo does not exist.");
      }
    } catch (error) {
      setError("Failed to free the room. Please try again.");
      console.error("Error: ", error); // Log error for debugging
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Free a Meeting Room</h1>

        {showAlert && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-300">
            Room freed successfully!
          </div>
        )}

        <div className="w-full max-w-sm">

        <div className="mb-4">
            <input
              type="number"
              placeholder="Floor Number"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <input
              type="number"
              placeholder="Room Number"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={freeRoom}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
            Free Room
          </button>

          {/* Display validation error */}
          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeRoom;

