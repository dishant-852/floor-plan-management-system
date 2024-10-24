import React from 'react'
import { AuthProvider } from '../../contexts/authContext'
import MainPage from '../pages/MainPage';


const Home = () => {
    // const { currentUser } = useAuth()

    return (
        // <div className='text-2xl font-bold pt-14'>
        <AuthProvider>
            <div>
                {/* Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in. */}
                <MainPage />
            </div>
        </AuthProvider>
    )
}

export default Home


