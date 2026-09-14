import Topbar from './topbar'
import { Fade } from 'react-bootstrap'
import Footer from './footer'
import ScrollToTop from './scrollToTop'
import dynamic from 'next/dynamic'
import { features } from '@/lib/content'

const Chatbot = dynamic(() => import('./chatbot'), { ssr: false })

export default function Layout({ children }) {
    return (
        <>
            <Topbar />
            <Fade in={true} appear={true} timeout={10}>
                <main style={{ minHeight: 'calc(100vh - 100px)' }} aria-label='main'>
                    {children}
                </main>
            </Fade>
            <ScrollToTop />
            {features.chatbot && <Chatbot />}
            <Footer />
        </>
    )
}