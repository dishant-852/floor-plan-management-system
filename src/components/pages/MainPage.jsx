// // src/pages/MainPage.jsx
// import React from 'react';
// import Navbar from '../home/Navbar';
// import homepageImage from './home_image.png'; // Import the image


// const MainPage = () => {
//   return (
//     <div>
//       <Navbar />
//       <div className="container mx-auto p-4">
//          <h1 className="text-2xl font-bold text-blue-500  mb-4 text-center">Welcome to the Room Management System</h1>
//         {/* <div className="flex justify-center items-center h-screen">
//           <img
//             src={homepageImage}
//             alt="Floor Plan Management System"
//             className="max-w-full max-h-[60vh] object-contain"
//           />
//         </div> */} 
//       </div>
//     </div>
//   );
// };

// export default MainPage;
// src/pages/MainPage.jsx
import React from 'react';
import Navbar from '../home/Navbar';
import homepageImage from './home_image.png'; // Import the image

const MainPage = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-blue-500 mb-8 text-center">Welcome to the Room Management System</h1>
        {/* <div className="flex justify-center items-center h-screen">
          <img
            src={homepageImage}
            alt="Floor Plan Management System"
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div> */} 
      </div>
    </div>
  );
};

export default MainPage;

