import React from 'react';
import Navbar from '../home/Navbar';
import homepageImage from './image.jpg'; // Import the image

const MainPage = () => {
  // return (
  //   <div>
  //     <Navbar />
  //     <div className="container mx-auto p-4">
  //       <h1 className="text-4xl font-bold text-blue-500 mb-8 text-center">Welcome to the Floor Management System</h1>
  //       <div className="flex justify-center items-center h-screen">
  //         <img
  //           src={homepageImage}
  //           alt="Floor Plan Management System"
  //           className="w-full object-cover object-center"
  //         />
  //       </div> 

  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <div>
        <img
          src={homepageImage}
          alt="Floor Plan Management System"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50">
          <h1 className="text-6xl font-bold text-white mb-4 text-center">
            Floor Plan Management System
          </h1>
          <p className="text-2xl text-white text-center">
            Seamless Workspace Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

