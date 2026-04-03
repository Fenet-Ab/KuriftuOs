import React from 'react'
import Navbar from '../components/navbar/page'
import Hero from '../components/hero/page'
import KuriftuAi from '../components/kuriftuAi/page'

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-parchment font-sans selection:bg-brass selection:text-white">
            <Navbar />
            <Hero />
            {/* <KuriftuAi /> */}
        </div>
    )
}

export default HomePage