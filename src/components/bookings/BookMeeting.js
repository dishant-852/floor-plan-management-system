import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, orderByChild, update, equalTo, push } from "firebase/database";
import Navbar from '../home/Navbar';

const BookMeeting = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [seatCount, setSeatCount] = useState("");
  const [rooms, setRooms] = useState([]);
  const [proximityAndCapacityRooms, setProximityAndCapacityRooms] = useState([]);
  const [capacityOnlyRooms, setCapacityOnlyRooms] = useState([]);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      const db = getDatabase(app);
      const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomCapacity'));
      const snapshot = await get(roomRef);

      if (snapshot.exists()) {
        setRooms(Object.values(snapshot.val()));
      } else {
        setError("No rooms available.");
      }
    };

    fetchRooms();

    if (navigator.onLine) syncOfflineData();

    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  const suggestRooms = () => {
    const seats = parseInt(seatCount, 10);

    if (isNaN(seats) || seats <= 0) {
      setError("Please enter a valid number of seats.");
      return;
    }

    const availableRooms = rooms.filter(room => room.RoomCapacity >= seats && !room.isOccupied);

    if (availableRooms.length === 0) {
      setError("No rooms available for the requested seat count.");
      setProximityAndCapacityRooms([]);
      setCapacityOnlyRooms([]);
    } else {
      const sortedByProximityAndCapacity = [...availableRooms].sort((a, b) => {
        return a.FloorNo === b.FloorNo ? a.RoomCapacity - b.RoomCapacity : a.FloorNo - b.FloorNo;
      });

      const proximityAndCapacitySuggestions = sortedByProximityAndCapacity.slice(0, 2);
      const sortedByCapacityOnly = [...availableRooms].sort((a, b) => a.RoomCapacity - b.RoomCapacity);
      const capacityOnlySuggestions = sortedByCapacityOnly.slice(0, 2);

      setProximityAndCapacityRooms(proximityAndCapacitySuggestions);
      setCapacityOnlyRooms(capacityOnlySuggestions);
      setError("");
    }
  };


  const confirmBooking = async (room) => {
    if (navigator.onLine) {
      await completeBooking(room);
    } else {
      saveToLocalStorage(room);
    }
  
    // Clear suggestions after booking to prevent multiple bookings
    setProximityAndCapacityRooms([]);
    setCapacityOnlyRooms([]);
  };
  
  const completeBooking = async (room) => {
    try {
      const db = getDatabase(app);
      const roomsRef = ref(db, 'FMS/Rooms');
      const roomNoQuery = query(roomsRef, orderByChild('RoomNo'), equalTo(room.RoomNo));
      const snapshot = await get(roomNoQuery);
  
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        let roomKey = null;
        Object.keys(rooms).forEach((key) => {
          if (rooms[key].FloorNo === room.FloorNo) {
            roomKey = key;
          }
        });
  
        if (roomKey) {
          const roomRef = ref(db, `FMS/Rooms/${roomKey}`);
          await update(roomRef, { isOccupied: true });
  
          const meetRecordRef = ref(db, 'FMS/MeetRecord');
          await push(meetRecordRef, {
            userId,
            userName,
            roomNo: room.RoomNo,
            floorNo: room.FloorNo,
            capacity: room.RoomCapacity,
            bookedAt: new Date().toISOString()
          });
  
          console.log("Room booked in Firebase:", room.RoomNo);
          showSuccessMessage("Room booked successfully!");
  
          // Reset input fields and clear room suggestions after booking
          setSeatCount("");
          setUserId("");
          setUserName("");
          setProximityAndCapacityRooms([]);
          setCapacityOnlyRooms([]);
        } else {
          setError("No room found with the specified RoomNo and FloorNo.");
        }
      } else {
        setError("Room with the specified RoomNo does not exist.");
      }
    } catch (error) {
      console.error("Error booking room:", error);
      setError("Failed to book the room. Please try again.");
    }
  };
  

  const saveToLocalStorage = (room) => {
    const offlineBookings = JSON.parse(localStorage.getItem("offlineBookings")) || [];
    offlineBookings.push({
      userId,
      userName,
      room,
      bookedAt: new Date().toISOString()
    });
    localStorage.setItem("offlineBookings", JSON.stringify(offlineBookings));
    console.log("Booking saved offline:", { userId, userName, room });
    showSuccessMessage("Booking saved offline. It will sync when online.");
  };

  const syncOfflineData = async () => {
    const offlineBookings = JSON.parse(localStorage.getItem("offlineBookings"));
    if (offlineBookings && offlineBookings.length > 0) {
      console.log("Syncing offline bookings:", offlineBookings);
      for (const booking of offlineBookings) {
        await completeBooking(booking.room);
      }
      localStorage.removeItem("offlineBookings");
      console.log("Offline bookings synced successfully.");
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
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Book a Meeting Room</h1>

        {showAlert && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-300">
            Room booked successfully!
          </div>
        )}

        <div className="w-full max-w-sm">
          <div className="mb-4">
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="User Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <input
              type="number"
              placeholder="Number of Required Seats"
              value={seatCount}
              onChange={(e) => setSeatCount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={suggestRooms}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
              Suggest Rooms
            </button>
          </div>

          <div className="flex justify-between space-x-6">
            {proximityAndCapacityRooms.length > 0 && (
              <div className="w-1/2 bg-white shadow-md rounded-lg p-4 mb-4">
                <h2 className="text-lg font-bold">Proximity</h2>
                {proximityAndCapacityRooms.map((room) => (
                  <div key={room.RoomNo} className="p-2 mb-2 border-b">
                    <p>Floor: {room.FloorNo}</p>
                    <p>Room Number: {room.RoomNo}</p>
                    <p>Capacity: {room.RoomCapacity}</p>
                    <button
                      onClick={() => confirmBooking(room)}
                      className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
                      Confirm Booking
                    </button>
                  </div>
                ))}
              </div>
            )}

            {capacityOnlyRooms.length > 0 && (
              <div className="w-1/2 bg-white shadow-md rounded-lg p-4 mb-4">
                <h2 className="text-lg font-bold">Capacity</h2>
                {capacityOnlyRooms.map((room) => (
                  <div key={room.RoomNo} className="p-2 mb-2 border-b">
                    <p>Floor: {room.FloorNo}</p>
                    <p>Room Number: {room.RoomNo}</p>
                    <p>Capacity: {room.RoomCapacity}</p>
                    <button
                      onClick={() => confirmBooking(room)}
                      className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
                      Confirm Booking
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookMeeting;
