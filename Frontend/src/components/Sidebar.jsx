import React from 'react'
import profilePic from '../assets/profile.png'
import home from '../assets/home.svg'
import like from '../assets/like.svg'
import history from '../assets/history.svg'
import subscription from '../assets/subscription.svg'
import "../styles/Sidebar.css"

const Sidebar = () => {

  return (
    <>
        <div className='flex-col items-center justify-center gap-4 h-5/6 overflow-auto text-[#b5b5b6] bg-[#1f1f1f] py-3 px-4 m-2 rounded-lg'>
            <div>
                <div className='flex gap-4 p-2 my-3 cursor-pointer hover:bg-[#525252] hover:text-white font-bold rounded-md'>
                    <div><img className='invert' src={home} alt="home logo" /> </div>
                    <div>Home</div>
                </div>
                <div className='flex gap-4 p-2 my-3 cursor-pointer hover:bg-[#525252] hover:text-white font-bold rounded-md'>
                    <div><img className='invert' src={subscription} alt="subscription" /></div>
                    <div>Subscription</div>
                </div>
                <div className='flex gap-4 p-2 my-3 cursor-pointer hover:bg-[#525252] hover:text-white font-bold rounded-md'>
                    <div><img className='invert' src={history} alt="history" /></div>
                    <div>History</div>
                </div>
                <div className='flex gap-4 p-2 my-3 cursor-pointer hover:bg-[#525252] hover:text-white font-bold rounded-md'>
                    <div><img className='invert' src={like} alt="liked videos" /></div>
                    <div>Liked Videos</div>
                </div>
            </div>
            <div className='h-[0.1px] my-4 custom-grey'></div>
            <div>
                <div className='p-2 my-3 text-xl font-bold'>Subscriptions</div>
                <div className='flex gap-4 p-2 my-3 cursor-pointer hover:bg-[#525252] hover:text-white font-bold rounded-md'>
                    <div><img src={profilePic} width={35} alt="channel logo" /></div>
                    <div>Channel Name</div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Sidebar
