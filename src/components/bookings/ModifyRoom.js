import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, set, get, query, equalTo, orderByChild } from "firebase/database";
import Navbar from '../home/Navbar';

const ModifyRoom = () => {
  const [floorNo, setFloorNo] = useState("");
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const [isOccupied, setIsOccupied] = useState(false);

  useEffect(() => {
    // Sync offline data once if online upon load
    if (navigator.onLine) syncOfflineData();

    // Sync offline data when connection goes online
    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  // Fetch room details based on floor and room number
  const fetchRoomDetails = async () => {
    setError("");
    const db = getDatabase(app);
    const roomNo = parseInt(inputValue1, 10);
    const floorNumber = parseInt(floorNo, 10);

    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(roomNo));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomData = Object.values(snapshot.val()).find(room => room.FloorNo === floorNumber);
      if (roomData) {
        setInputValue2(roomData.RoomCapacity.toString());
        setIsOccupied(roomData.isOccupied);
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

  // Update room data
  const updateRoomData = async () => {
    const roomNo = parseInt(inputValue1, 10);
    const roomCapacity = parseInt(inputValue2, 10);
    const floorNumber = parseInt(floorNo, 10);

    if (isNaN(roomCapacity) || roomCapacity <= 0) {
      setError("Room Capacity must be a positive integer greater than 0.");
      return;
    }

    if (isOccupied) {
      setError("Cannot modify an occupied room.");
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
      saveToFirebase(roomData);
    } else {
      saveToLocalStorage(roomData);
    }
  };

  // Save data to Firebase
  const saveToFirebase = async (roomData) => {
    const db = getDatabase(app);
    const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomNo'), equalTo(roomData.RoomNo));
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomKey = Object.keys(snapshot.val()).find(key => snapshot.val()[key].FloorNo === roomData.FloorNo);
      const roomDocRef = ref(db, `FMS/Rooms/${roomKey}`);

      set(roomDocRef, roomData)
        .then(() => {
          console.log("Room data updated in Firebase:", roomData);
          showSuccessMessage("Room updated successfully!");
        })
        .catch((error) => {
          setError(`Error: ${error.message}`);
        });
    } else {
      setError("Room not found.");
    }
  };

  // Save data to Local Storage when offline
  const saveToLocalStorage = (roomData) => {
    const offlineData = JSON.parse(localStorage.getItem("offlineRoomModifications")) || [];
    offlineData.push(roomData);
    localStorage.setItem("offlineRoomModifications", JSON.stringify(offlineData));
    console.log("Room data saved to local storage:", roomData);
    showSuccessMessage("Room modification saved locally. It will sync when online.");
  };

  // Sync offline data to Firebase when online
  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem("offlineRoomModifications"));
    if (offlineData && offlineData.length > 0) {
      console.log("Synchronizing offline room modifications:", offlineData);
      for (const roomData of offlineData) {
        await saveToFirebase(roomData);
      }
      localStorage.removeItem("offlineRoomModifications");
      console.log("Offline room modifications synchronized successfully.");
    }
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Modify Room</h1>

        {showAlert && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-150">
            Room updated successfully!
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

          {roomExists && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Room Capacity</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Room Capacity"
                  value={inputValue2}
                  onChange={(e) => setInputValue2(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
                />
              </div>

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
