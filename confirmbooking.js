// import React, { useState, useEffect } from 'react';
// import { app } from "../../firebase/firebase";
// import { getDatabase, ref, get, query, orderByChild } from "firebase/database";
// import Navbar from '../home/Navbar';

// const BookMeeting = () => {
//   const [seatCount, setSeatCount] = useState(""); // Number of seats requested by user
//   const [rooms, setRooms] = useState([]); // All available rooms
//   const [proximityAndCapacityRooms, setProximityAndCapacityRooms] = useState([]); // Best-fit rooms based on proximity and capacity
//   const [capacityOnlyRooms, setCapacityOnlyRooms] = useState([]); // Best-fit rooms based only on capacity
//   const [error, setError] = useState(""); // Validation error
//   const [showAlert, setShowAlert] = useState(false); // Success alert

//   useEffect(() => {
//     // Fetch all rooms from the database on component mount
//     const fetchRooms = async () => {
//       const db = getDatabase(app);
//       const roomRef = query(ref(db, 'FMS/Rooms'), orderByChild('RoomCapacity'));
//       const snapshot = await get(roomRef);

//       if (snapshot.exists()) {
//         setRooms(Object.values(snapshot.val())); // Set rooms in state
//       } else {
//         setError("No rooms available.");
//       }
//     };

//     fetchRooms();
//   }, []);

//   const suggestRooms = () => {
//     const seats = parseInt(seatCount, 10);

//     // Validate seat count
//     if (isNaN(seats) || seats <= 0) {
//       setError("Please enter a valid number of seats.");
//       return;
//     }

//     // Filter rooms that have enough capacity
//     const availableRooms = rooms.filter(room => room.RoomCapacity >= seats);

//     if (availableRooms.length === 0) {
//       setError("No rooms available for the requested seat count.");
//       setProximityAndCapacityRooms([]);
//       setCapacityOnlyRooms([]);
//     } else {
//       // Sort rooms first by FloorNo (proximity), then by RoomCapacity (for best fit)
//       const sortedByProximityAndCapacity = [...availableRooms].sort((a, b) => {
//         if (a.FloorNo === b.FloorNo) {
//           return a.RoomCapacity - b.RoomCapacity;
//         } else {
//           return a.FloorNo - b.FloorNo;
//         }
//       });

//       // Take the top 2 best-fit rooms based on proximity and capacity
//       const proximityAndCapacitySuggestions = sortedByProximityAndCapacity.slice(0, 2);

//       // Sort rooms by RoomCapacity only (regardless of proximity)
//       const sortedByCapacityOnly = [...availableRooms].sort((a, b) => a.RoomCapacity - b.RoomCapacity);

//       // Take the top 2 best-fit rooms based on capacity only
//       const capacityOnlySuggestions = sortedByCapacityOnly.slice(0, 2);

//       // Set both types of suggestions in state
//       setProximityAndCapacityRooms(proximityAndCapacitySuggestions);
//       setCapacityOnlyRooms(capacityOnlySuggestions);
//       setError(""); // Clear any previous error
//     }
//   };

//   const confirmBooking = (room) => {
//     // Perform the booking logic for the selected room (e.g., save the booking to the database)
//     setShowAlert(true);
//     setTimeout(() => setShowAlert(false), 3000);
//     setSeatCount(""); // Reset seat input after booking
//     setProximityAndCapacityRooms([]); // Reset suggestions
//     setCapacityOnlyRooms([]);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
//         <h1 className="text-3xl font-bold mb-8 text-blue-700">Book a Meeting Room</h1>

//         {showAlert && (
//           <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-transform transform ease-out duration-300">
//             Room booked successfully!
//           </div>
//         )}

//         <div className="w-full max-w-sm">
//           {/* Input seat count */}
//           <div className="mb-4">
//             <input
//               type="number"
//               placeholder="Number of Seats"
//               value={seatCount}
//               onChange={(e) => setSeatCount(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
//             />
//             <button
//               onClick={suggestRooms}
//               className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
//               Suggest Rooms
//             </button>
//           </div>

//           {/* Display suggested rooms based on proximity and capacity */}
//           {proximityAndCapacityRooms.length > 0 && (
//             <div className="bg-white shadow-md rounded-lg p-4 mb-4">
//               <h2 className="text-lg font-bold">Suggested Rooms (Proximity & Capacity)</h2>
//               {proximityAndCapacityRooms.map((room) => (
//                 <div key={room.RoomNo} className="p-2 mb-2 border-b">
//                   <p>Room Number: {room.RoomNo}</p>
//                   <p>Floor: {room.FloorNo}</p>
//                   <p>Capacity: {room.RoomCapacity}</p>
//                   <button
//                     onClick={() => confirmBooking(room)}
//                     className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
//                     Confirm Booking
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Display suggested rooms based on capacity only */}
//           {capacityOnlyRooms.length > 0 && (
//             <div className="bg-white shadow-md rounded-lg p-4 mb-4">
//               <h2 className="text-lg font-bold">Suggested Rooms (Capacity Only)</h2>
//               {capacityOnlyRooms.map((room) => (
//                 <div key={room.RoomNo} className="p-2 mb-2 border-b">
//                   <p>Room Number: {room.RoomNo}</p>
//                   <p>Floor: {room.FloorNo}</p>
//                   <p>Capacity: {room.RoomCapacity}</p>
//                   <button
//                     onClick={() => confirmBooking(room)}
//                     className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
//                     Confirm Booking
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Display validation error */}
//           {error && (
//             <div className="text-red-500 mb-4">{error}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookMeeting;