import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

import UploadPage from './pages/UploadPage';
import NotesReviewPage from './pages/NotesReviewPage';
import ModulePage from './pages/ModulePage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Flashcards & Notes Feature Routes */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/notes/review" element={<NotesReviewPage />} />
        <Route path="/modules/:id" element={<ModulePage />} />
        <Route path="/flashcards/:moduleId" element={<FlashcardsPage />} />
        <Route path="/quiz/:moduleId" element={<QuizPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
