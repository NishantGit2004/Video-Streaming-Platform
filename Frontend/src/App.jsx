import { useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/sidebar'
import VideoSection from './components/VideoSection'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div className='flex h-screen'>
        <div className='w-1/5'>
          <Sidebar />
        </div>
        <VideoSection /> 
      </div>

    </>
  )
}

export default App
