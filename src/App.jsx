import React from 'react';
import { AuthProvider } from "./contexts/authContext";
import Routes from "./routes/Routes"; // Import the new Routes component

function App() {
  return (
    <AuthProvider>
      <div className="w-full h-screen flex flex-col">
        <Routes />
      </div>
    </AuthProvider>
  );
}
export default App;
