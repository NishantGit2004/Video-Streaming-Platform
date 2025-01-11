import React, { useState } from 'react'
import SearchIcon from '../assets/searchicon.png'
import profilePic from '../assets/profile.png'

const Navbar = () => {
    const [searchText, setSearchText] = useState("")
    const [showProfileDialog, setProfileDialog] = useState(false)

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value)
        console.log(searchText)
        console.log(showProfileDialog)
    }

  return (
    <>
      <div className='flex justify-between py-4 px-4 m-2 bg-[#1f1f1f] rounded-lg'>
        <div className='px-2'><span className='text-red-600 font-bold text-4xl'>Hi</span><span className='text-2xl font-bold'>Video</span></div>
        <div className='flex gap-2 items-center'>
          <div>
            <input 
                type="text" 
                value={searchText}
                name="searchText" 
                id="searchText"
                className='bg-[#0a0e0f] pr-28 py-1 pl-3 rounded-md' 
                onChange={handleSearchTextChange}
                placeholder="Type anything to search" 
            /> 
          </div>
          <div>
            <img className='invert' src={SearchIcon} width={25} alt="Search Icon" />
          </div>
        </div>
        <div>
            <div onClickCapture={() => setProfileDialog(!showProfileDialog)} className='invert hover:bg-[#525252] hover:invert-0 hover:rounded-lg'>
              <img className='cursor-pointer rounded-[50%]' src={profilePic} alt="profile pic" width={55}/>
            </div>
        </div>
        { showProfileDialog && (
          <div
            className="absolute right-4 bg-[#1f1f1f] text-white rounded-lg p-4 shadow-lg"
            // style={{ width: '200px' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                className="rounded-[50%] cursor-pointer"
                src={profilePic}
                alt="profile pic"
                width={50}
              />
              <div>
                <div className="font-bold">John Doe</div>
                <div className="text-sm text-gray-400">johndoe@example.com</div>
              </div>
            </div>
            <div>
              <button
                className="w-full  hover:bg-[#525252] text-white py-1 px-3 rounded-lg"
                onClick={() => alert('Profile Settings')}
              >
                Profile Settings
              </button>
            </div>
            <div className="mt-2">
              <button
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-lg"
                onClick={() => setProfileDialog(!showProfileDialog)}
              >
                Back
              </button>
            </div>
            <div className="mt-2">
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
                onClick={() => alert('Logout')}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
