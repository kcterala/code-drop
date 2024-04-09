import React from 'react'
import Navbar from './components/Navbar'
import CodeSnippet from './components/CodeSnippet'

const App = () => {
  return (
    <div className='bg-slate-900 h-screen'>
      <Navbar/>
      <CodeSnippet/>
    </div>
  )
}

export default App