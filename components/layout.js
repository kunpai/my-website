import Topbar from './topbar'
import { Fade } from 'react-bootstrap'
import Footer from './footer'
import ScrollToTop from './scrollToTop'
import dynamic from 'next/dynamic'

// const KunalAI = dynamic(() => import('./kunalai'), { ssr: false })

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
            {/* <KunalAI /> */}
            <Footer />
        </>
    )
}