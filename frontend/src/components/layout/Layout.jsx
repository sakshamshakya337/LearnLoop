import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0823', color: '#f0eeff', fontFamily: 'Sora, sans-serif' }}>
      <Navbar />
      <main style={{ flexGrow: 1, paddingTop: 72 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
