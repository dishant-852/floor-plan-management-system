import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-600 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="text-white text-xl font-bold">
          Room Management
        </Link>
        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              ></path>
            </svg>
          </button>
        </div>
        <div className={`w-full lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'}`}>
          <Link to="/allroom" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">All Rooms</Link>
          <Link to="/addroom" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">Add Room</Link>
          <Link to="/modifyroom" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">Modify Room</Link>
          <Link to="/deleteroom" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">Remove Room</Link>
          <Link to="/bookmeeting" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">Book Meeting</Link>
          <Link to="/freeroom" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">Free Room</Link>
          <Link to="/meetrecord" className="block lg:inline-block text-white px-4 py-2 hover:text-gray-200">Meet Records</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
