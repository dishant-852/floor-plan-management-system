import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAe-6Nu2kRcLAZDXE-HlgwgmDHQS_L1roE",
  authDomain: "floor-plan-management-system.firebaseapp.com",
  projectId: "floor-plan-management-system",
  databaseURL:"https://floor-plan-management-system-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "floor-plan-management-system.appspot.com",
  messagingSenderId: "30003136164",
  appId: "1:30003136164:web:1a5d51d92aa00c3a378831",
  measurementId: "G-74Z7DVEZND"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const analytics=getAnalytics(app)

export { app, auth };

