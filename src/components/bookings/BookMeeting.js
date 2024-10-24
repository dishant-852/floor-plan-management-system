import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, orderByChild, update, equalTo, push } from "firebase/database";
import Navbar from '../home/Navbar';

const BookMeeting = () => {
  const [userId, setUserId] = useState(""); // User ID input
  const [userName, setUserName] = useState(""); // User Name input
  const [seatCount, setSeatCount] = useState(""); // Number of seats requested by user
  const [rooms, setRooms] = useState([]); // All available rooms
  const [proximityAndCapacityRooms, setProximityAndCapacityRooms] = useState([]); // Best-fit rooms based on proximity and capacity
  const [capacityOnlyRooms, setCapacityOnlyRooms] = useState([]); // Best-fit rooms based only on capacity
  const [error, setError] = useState(""); // Validation error
  const [showAlert, setShowAlert] = useState(false); // Success alert

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
        if (a.FloorNo === b.FloorNo) {
          return a.RoomCapacity - b.RoomCapacity;
        } else {
          return a.FloorNo - b.FloorNo;
        }
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

          // Store the meeting record in `MeetRecord`
          const meetRecordRef = ref(db, 'FMS/MeetRecord');
          await push(meetRecordRef, {
            userId,
            userName,
            roomNo: room.RoomNo,
            floorNo: room.FloorNo,
            capacity: room.RoomCapacity,
            bookedAt: new Date().toISOString()
          });

          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);

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
      setError("Failed to book the room. Please try again.");
      console.error("Error: ", error);
    }
  };

  return (
    <div>
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
              placeholder="Number of Seats"
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
                <h2 className="text-lg font-bold">Proximity & Capacity</h2>
                {proximityAndCapacityRooms.map((room) => (
                  <div key={room.RoomNo} className="p-2 mb-2 border-b">
                    <p>Room Number: {room.RoomNo}</p>
                    <p>Floor: {room.FloorNo}</p>
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
                <h2 className="text-lg font-bold">Capacity Only</h2>
                {capacityOnlyRooms.map((room) => (
                  <div key={room.RoomNo} className="p-2 mb-2 border-b">
                    <p>Room Number: {room.RoomNo}</p>
                    <p>Floor: {room.FloorNo}</p>
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

