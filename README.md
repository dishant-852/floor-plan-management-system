# Floor Management System

## Live Demo
[Click here to try the live app](https://floor-plan-management-system.firebaseapp.com/)  
[Watch the demo video](https://drive.google.com/file/d/1WkDtyM2dQQt18k_3MPL2VVvoRXnS-mkO/view?usp=sharing)

[Documentation](https://drive.google.com/file/d/1CcMBXurFR5bczQUB7vh_nt_Wqrh21eFC/view?usp=drive_link)

## Overview
The **Floor Management System** is a web-based application designed to streamline the management of rooms and meeting spaces within an office or organization. The system allows administrators to manage room capacities, availability, and floor plans, while users can easily book rooms based on real-time availability and capacity.

## Features
- **Room Booking**: Book rooms by specifying the number of participants and other requirements.
- **Room Suggestions**: The system recommends the best-fit rooms based on capacity and proximity to ensure optimal use of space.
- **Dynamic Updates**: As bookings occur, room availability is updated dynamically to provide accurate suggestions.
- **Preferred Rooms**: Meeting rooms are prioritized based on previous bookings and preferences.
- **Admin Management**: Admins can add, modify, or delete rooms and floor plans, making it easy to manage meeting spaces.

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase (for data storage and authentication)
- **Database**: Firebase Realtime Database
- **Deployment**: [Firebase]



## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dishant-852/floor-management-system
   cd floor-management-system


2. Install dependencies:
    ```bash
    npm install


3. Set up Firebase configuration:
-  Create a Firebase project and enable authentication and      Realtime Database.
-  Replace the firebaseConfig in the firebase.js file with your Firebase credentials.

4. Start the development server:
    ```bash 
    npm start

5. Access the app locally at http://localhost:3000.

6. Usage
- Add new rooms, update existing rooms, or delete rooms based on floor number and capacity.
- Log in and book a room by specifying the number of participants.The system will suggest the best rooms based on capacity and proximity.
Confirm the booking and view room details.

7. Future Enhancements
- Develop a local storage mechanism for admins to make changes offline
- Implement synchronization to update the server when the internet or server connection is re-established.

8. Contributing:

- Fork the repository.
- Create a new branch (git checkout -b feature/your-feature).
- Commit your changes (git commit -m 'Add some feature').
- Push to the branch (git push origin feature/your-feature).


9. Contact
-For any questions or suggestions, feel free to reach out at dishantgupta852@gmail.com.
