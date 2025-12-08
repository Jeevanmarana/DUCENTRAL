import React from 'react';
import BackButton from './BackButton';

export function Contact() {
  return (
    <div className="min-h-screen flex items-start justify-center py-16 px-4 bg-du-bg text-white">
      <div className="max-w-3xl bg-white/95 rounded-lg p-8 shadow-lg text-gray-900">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <p className="mb-4">Thanks for your interest in DU Central. If you need assistance or have feedback, contact us using the details below.</p>
        <ul className="mb-6 space-y-1">
          <li>Phone: <strong>9329990175</strong></li>
          <li>Phone: <strong>9102005567</strong></li>
          <li>Email: <strong>help@ducentral.com</strong></li>
        </ul>
        <p className="text-sm text-gray-600">We welcome feedback and will respond as soon as possible.</p>
      </div>
    </div>
  );
}

export default Contact;
