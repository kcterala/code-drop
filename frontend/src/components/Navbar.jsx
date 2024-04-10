import React from 'react'

const Navbar = () => {
  return (
    <div className='p-10 flex justify-between'>
        <h1 className='text-white text-3xl font-bold ml-8 hover:text-green-500'>CodeDrop</h1>
        <div className='flex justify-between gap-5'>
            <h1 className='text-2xl text-white'><a href='https://github.com/kcterala/code-judge'>Github</a></h1>
        </div>
    </div>
  )
}

export default Navbar