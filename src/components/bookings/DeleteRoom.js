import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, equalTo, orderByChild, remove } from "firebase/database";
import Navbar from '../home/Navbar';

const DeleteRoom = () => {
  const [floorNo, setFloorNo] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [roomExists, setRoomExists] = useState(false);

  // Sync offline data once if online upon load
  useEffect(() => {
    if (navigator.onLine) syncOfflineData();

    // Sync offline data when connection goes online
    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  // Fetch room details based on entered floor number and room number to verify its existence
  const checkRoomExists = async (floorNo, roomNo) => {
    setError("");
    const db = getDatabase(app);
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(parseInt(roomNo, 10)));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomEntries = Object.entries(snapshot.val());
      for (const [roomKey, roomData] of roomEntries) {
        if (roomData.FloorNo === parseInt(floorNo, 10)) {
          setRoomExists(true);
          return { roomKey, roomData };
        }
      }
      setError("Room does not exist on this floor.");
      setRoomExists(false);
      return null;
    } else {
      setError("Room does not exist.");
      setRoomExists(false);
      return null;
    }
  };

  const deleteRoomData = async () => {
    if (floorNo.trim() === "" || roomNumber.trim() === "") {
      setError("Please enter valid floor and room numbers.");
      return;
    }

    const roomDetails = await checkRoomExists(floorNo, roomNumber);

    if (roomDetails) {
      const { roomKey, roomData } = roomDetails;

      if (roomData.isOccupied) {
        setError("Cannot delete a currently occupied room.");
        return;
      }

      const db = getDatabase(app);
      const roomDocRef = ref(db, `FMS/Rooms/${roomKey}`);

      if (navigator.onLine) {
        removeFromFirebase(roomDocRef, roomKey);
      } else {
        saveToLocalStorage({ roomKey, floorNo, roomNumber });
      }
    }
  };

  const removeFromFirebase = async (roomDocRef, roomKey) => {
    remove(roomDocRef)
      .then(() => {
        console.log("Room data removed from Firebase:", roomKey);
        showSuccessMessage("Room removed successfully!");
        setFloorNo("");
        setRoomNumber("");
      })
      .catch((error) => {
        setError(`Error: ${error.message}`);
      });
  };

  const saveToLocalStorage = (roomData) => {
    const offlineDeletions = JSON.parse(localStorage.getItem("offlineRoomDeletions")) || [];
    offlineDeletions.push(roomData);
    localStorage.setItem("offlineRoomDeletions", JSON.stringify(offlineDeletions));
    console.log("Room deletion saved to local storage:", roomData);
    showSuccessMessage("Room deletion saved locally. It will sync when online.");
    setFloorNo("");
    setRoomNumber("");
  };

  const syncOfflineData = async () => {
    const offlineDeletions = JSON.parse(localStorage.getItem("offlineRoomDeletions"));
    if (offlineDeletions && offlineDeletions.length > 0) {
      console.log("Synchronizing offline room deletions:", offlineDeletions);
      const db = getDatabase(app);

      for (const { roomKey } of offlineDeletions) {
        const roomDocRef = ref(db, `FMS/Rooms/${roomKey}`);
        await remove(roomDocRef).then(() => {
          console.log("Offline room deletion synced for:", roomKey);
        }).catch((error) => {
          console.error("Failed to sync room deletion for:", roomKey, error);
        });
      }

      localStorage.removeItem("offlineRoomDeletions");
      console.log("Offline room deletions synchronized successfully.");
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
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Remove Room</h1>

        {showAlert && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-200">
            Room removed successfully!
          </div>
        )}

        <div className="w-full max-w-sm">
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
