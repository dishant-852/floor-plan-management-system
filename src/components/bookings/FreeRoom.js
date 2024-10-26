import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import Navbar from '../home/Navbar';

const FreeRoom = () => {
  const [roomNo, setRoomNo] = useState("");
  const [floorNo, setFloorNo] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Sync offline data once if online upon load
  useEffect(() => {
    if (navigator.onLine) syncOfflineData();

    // Sync offline data when connection goes online
    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  // Function to free a room
  const freeRoom = async () => {
    const roomNumber = parseInt(roomNo, 10);
    const floorNumber = parseInt(floorNo, 10);

    if (isNaN(roomNumber) || isNaN(floorNumber) || roomNumber <= 0 || floorNumber <= 0) {
      setError("Please enter valid Room and Floor numbers.");
      return;
    }

    try {
      const db = getDatabase(app);
      const roomsRef = ref(db, 'FMS/Rooms');
      const roomNoQuery = query(roomsRef, orderByChild('RoomNo'), equalTo(roomNumber));
      const snapshot = await get(roomNoQuery);

      if (snapshot.exists()) {
        const rooms = snapshot.val();
        let roomKey = null;

        Object.keys(rooms).forEach((key) => {
          if (rooms[key].FloorNo === floorNumber) {
            roomKey = key;
          }
        });

        if (roomKey) {
          const room = rooms[roomKey];
          if (room.isOccupied === false) {
            setError("Room is already free.");
          } else {
            const roomRef = ref(db, `FMS/Rooms/${roomKey}`);
            if (navigator.onLine) {
              updateRoomStatusInFirebase(roomRef, roomKey);
            } else {
              saveToLocalStorage({ roomKey, roomNo: roomNumber, floorNo: floorNumber });
            }
          }
        } else {
          setError("No room found with the specified RoomNo and FloorNo.");
        }
      } else {
        setError("Room with the specified RoomNo does not exist.");
      }
    } catch (error) {
      setError("Failed to free the room. Please try again.");
      console.error("Error: ", error);
    }
  };

  // Update room status in Firebase
  const updateRoomStatusInFirebase = async (roomRef, roomKey) => {
    try {
      await update(roomRef, { isOccupied: false });
      console.log("Room status updated in Firebase:", roomKey);
      showSuccessMessage("Room freed successfully!");

      // Reset inputs
      setRoomNo("");
      setFloorNo("");
      setError("");
    } catch (error) {
      console.error("Error updating Firebase:", error);
      setError("Failed to update room status. Please try again.");
    }
  };

  // Save request to local storage
  const saveToLocalStorage = (roomData) => {
    const offlineFreeRoomRequests = JSON.parse(localStorage.getItem("offlineFreeRoomRequests")) || [];
    offlineFreeRoomRequests.push(roomData);
    localStorage.setItem("offlineFreeRoomRequests", JSON.stringify(offlineFreeRoomRequests));
    console.log("Room freeing request saved offline:", roomData);
    showSuccessMessage("Request saved offline. It will sync when online.");
  };

  // Sync offline data with Firebase
  const syncOfflineData = async () => {
    const offlineFreeRoomRequests = JSON.parse(localStorage.getItem("offlineFreeRoomRequests"));
    if (offlineFreeRoomRequests && offlineFreeRoomRequests.length > 0) {
      console.log("Synchronizing offline room free requests:", offlineFreeRoomRequests);
      const db = getDatabase(app);

      for (const { roomKey } of offlineFreeRoomRequests) {
        const roomRef = ref(db, `FMS/Rooms/${roomKey}`);
        await update(roomRef, { isOccupied: false }).then(() => {
          console.log("Offline room free request synced for:", roomKey);
        }).catch((error) => {
          console.error("Failed to sync room free request for:", roomKey, error);
        });
      }

      localStorage.removeItem("offlineFreeRoomRequests");
      console.log("Offline room free requests synchronized successfully.");
    }
  };

  const showSuccessMessage = (message) => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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

          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeRoom;
