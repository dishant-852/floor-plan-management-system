import React, { useEffect, useState } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get, query, orderByChild } from "firebase/database";
import Navbar from '../home/Navbar';
import { FaSyncAlt } from 'react-icons/fa'; // Import Font Awesome icon

const RoomList = () => {
  const [rooms, setRooms] = useState([]); // State to hold the list of rooms
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  const fetchRooms = async () => {
    setLoading(true); // Set loading state when refreshing
    try {
      const db = getDatabase(app);
      const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('FloorNo'));
      const snapshot = await get(roomRef);

      if (snapshot.exists()) {
        const roomsData = snapshot.val();
        const roomsList = Object.keys(roomsData).map(key => ({
          id: key,
          ...roomsData[key],
        }));

        // Sort rooms by FloorNo and then by RoomNo
        roomsList.sort((a, b) => {
          if (a.FloorNo === b.FloorNo) {
            return a.RoomNo - b.RoomNo; // Sort by RoomNo if FloorNo is the same
          }
          return a.FloorNo - b.FloorNo; // Sort by FloorNo
        });

        setRooms(roomsList); // Set rooms state with fetched and sorted data
      } else {
        setError("No rooms found.");
      }
    } catch (error) {
      setError(`Error fetching rooms: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchRooms(); // Call the fetch function when the component mounts
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading message
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Show error message
  }

  return (
    <div className="min-h-screen ">
      <Navbar />
      <div className="min-h-screen flex flex-col justify-start items-center bg-gray-100 relative p-4">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">All Rooms</h1>

        {/* Refresh Button */}
        <div className="mb-4 flex justify-between items-center w-full max-w-4xl">
          <button
            onClick={fetchRooms}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <FaSyncAlt className="inline-block" /> {/* Refresh Icon */}
            <span>Refresh</span>
          </button>
        </div>

        <div className="w-full max-w-4xl overflow-x-auto"> {/* Add overflow-x-auto for horizontal scrolling */}
          {rooms.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 border-b text-left px-4">Floor Number</th>
                  <th className="py-2 border-b text-left px-4">Room Number</th>
                  <th className="py-2 border-b text-left px-4">Room Capacity</th>
                  <th className="py-2 border-b text-left px-4">Occupied</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="py-2 border-b px-4">{room.FloorNo}</td>
                    <td className="py-2 border-b px-4">{room.RoomNo}</td>
                    <td className="py-2 border-b px-4">{room.RoomCapacity}</td>
                    <td className="py-2 border-b px-4">{room.isOccupied ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No rooms available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList;

