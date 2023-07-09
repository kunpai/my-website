import Topbar from './topbar'
import { Fade } from 'react-bootstrap'
import Footer from './footer'
import ScrollToTop from './scrollToTop'
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
      function returnDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      setDarkMode(returnDarkMode());
    }, []);
    return (
        <>
            <Topbar />
            <Fade in={true} appear={true} timeout={10}>
                <main style={{ minHeight: 'calc(100vh - 100px)', background: darkMode ? "black" : "white"  }} aria-label='main'>
                    {children}
                </main>
            </Fade>
            <ScrollToTop />
            <Footer />
        </>
    )
}