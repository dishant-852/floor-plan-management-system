// import React, { useState, useEffect } from 'react';
// import { app } from "../../firebase/firebase";
// import { getDatabase, ref, get } from "firebase/database";
// import Navbar from '../home/Navbar';
// import { FaSyncAlt } from 'react-icons/fa'; // Import Font Awesome icon

// const MeetRecordList = () => {
//   const [meetRecords, setMeetRecords] = useState([]); // All meeting records
//   const [error, setError] = useState(""); // Error state
//   const [loading, setLoading] = useState(true); // Loading state

//   const fetchMeetRecords = async () => {
//     setLoading(true); // Set loading state when refreshing
//     try {
//       const db = getDatabase(app);
//       const meetRecordRef = ref(db, 'FMS/MeetRecord');
//       const snapshot = await get(meetRecordRef);

//       if (snapshot.exists()) {
//         setMeetRecords(Object.values(snapshot.val())); // Set the fetched meeting records
//       } else {
//         setError("No meeting records found.");
//       }
//     } catch (err) {
//       console.error("Error fetching meeting records: ", err);
//       setError("Failed to load meeting records.");
//     } finally {
//       setLoading(false); // Set loading to false after fetching
//     }
//   };

//   useEffect(() => {
//     fetchMeetRecords(); // Fetch meeting records when the component mounts
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>; // Show loading message
//   }

//   return (
//     <div>
//       <Navbar />
//       <div className="min-h-screen flex flex-col justify-start items-center bg-gray-100 relative p-4">
//         <h1 className="text-3xl font-bold mb-8 text-blue-700">Meeting Records</h1>

//         {/* Refresh Button */}
//         <div className="mb-4 flex justify-between items-center w-full max-w-4xl">
//           <button
//             onClick={fetchMeetRecords}
//             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
//           >
//             <FaSyncAlt className="inline-block" /> {/* Refresh Icon */}
//             <span>Refresh</span>
//           </button>
//         </div>

//         {error && (
//           <div className="text-red-500 mb-4">{error}</div>
//         )}

//         <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
//           {meetRecords.length > 0 ? (
//             <table className="min-w-full table-auto">
//               <thead>
//                 <tr className="bg-blue-500 text-white">
//                   <th className="px-4 py-2">User ID</th>
//                   <th className="px-4 py-2">User Name</th>
//                   <th className="px-4 py-2">Floor No</th>
//                   <th className="px-4 py-2">Room No</th>
//                   <th className="px-4 py-2">Capacity</th>
//                   <th className="px-4 py-2">Booked At</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {meetRecords.map((record, index) => (
//                   <tr key={index} className="border-t">
//                     <td className="px-4 py-2">{record.userId}</td>
//                     <td className="px-4 py-2">{record.userName}</td>
//                     <td className="px-4 py-2">{record.floorNo}</td> {/* Floor No */}
//                     <td className="px-4 py-2">{record.roomNo}</td> {/* Room No */}
//                     <td className="px-4 py-2">{record.capacity}</td>
//                     <td className="px-4 py-2">{new Date(record.bookedAt).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <div className="text-center">No meeting records available.</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MeetRecordList;

import React, { useState, useEffect } from 'react';
import { app } from "../../firebase/firebase";
import { getDatabase, ref, get } from "firebase/database";
import Navbar from '../home/Navbar';
import { FaSyncAlt } from 'react-icons/fa'; // Import Font Awesome icon

const MeetRecordList = () => {
  const [meetRecords, setMeetRecords] = useState([]); // All meeting records
  const [error, setError] = useState(""); // Error state
  const [loading, setLoading] = useState(true); // Loading state

  const fetchMeetRecords = async () => {
    setLoading(true); // Set loading state when refreshing
    try {
      const db = getDatabase(app);
      const meetRecordRef = ref(db, 'FMS/MeetRecord');
      const snapshot = await get(meetRecordRef);

      if (snapshot.exists()) {
        setMeetRecords(Object.values(snapshot.val())); // Set the fetched meeting records
      } else {
        setError("No meeting records found.");
      }
    } catch (err) {
      console.error("Error fetching meeting records: ", err);
      setError("Failed to load meeting records.");
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchMeetRecords(); // Fetch meeting records when the component mounts
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading message
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <div className="min-h-screen flex flex-col justify-start items-center bg-gray-100 relative p-4">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Meeting Records</h1>

        {/* Refresh Button */}
        <div className="mb-4 flex justify-between items-center w-full max-w-4xl">
          <button
            onClick={fetchMeetRecords}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <FaSyncAlt className="inline-block" /> {/* Refresh Icon */}
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="w-full max-w-4xl overflow-x-auto bg-white shadow-md rounded-lg p-6">
          {meetRecords.length > 0 ? (
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">User Name</th>
                  <th className="px-4 py-2">Floor No</th>
                  <th className="px-4 py-2">Room No</th>
                  <th className="px-4 py-2">Capacity</th>
                  <th className="px-4 py-2">Booked At</th>
                </tr>
              </thead>
              <tbody>
                {meetRecords.map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{record.userId}</td>
                    <td className="px-4 py-2">{record.userName}</td>
                    <td className="px-4 py-2">{record.floorNo}</td> {/* Floor No */}
                    <td className="px-4 py-2">{record.roomNo}</td> {/* Room No */}
                    <td className="px-4 py-2">{record.capacity}</td>
                    <td className="px-4 py-2">{new Date(record.bookedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">No meeting records available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetRecordList;
