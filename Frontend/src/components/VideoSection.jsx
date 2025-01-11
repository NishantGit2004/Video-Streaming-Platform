import React from 'react'
import profilePic from '../assets/profile.png'
import thumbnail from '../assets/thumbnail.png'

const VideoSection = () => {
    const wid = 270;
    const cardClass = "flex-col gap-4 p-4 justify-center items-center bg-[#191616] rounded-xl"
  return (
    <>
        <div className='text-[#b5b5b6] bg-[#1f1f1f] p-2 m-2 h-5/6 w-screen rounded-lg overflow-auto'>
            <div className='flex gap-2 flex-wrap'>
                <div className={cardClass}>
                    <div>
                        <img className='rounded-lg' src={thumbnail} width={wid} alt="thumbnail" />
                    </div>
                    <div className='flex items-center gap-3'>
                        <div><img src={profilePic} width={40} alt="channel profile" /></div>
                        <div className='flex-col gap-3 items-center'>
                            <div className='font-bold pt-2 text-[#b5b5b6] text-xl'>This is title</div>
                            <div className='text-xs'>Channel Name</div>
                            <div className='flex gap-2 text-xs'>
                                <div>733K views</div>
                                <div className='font-bold'>:</div>
                                <div>2 years ago</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                               
            </div>
        </div>
    </>
  )
}

export default VideoSection
