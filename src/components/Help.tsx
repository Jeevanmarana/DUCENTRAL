import React from 'react';
import BackButton from './BackButton';

export function Help() {
  return (
    <div className="min-h-screen flex items-start justify-center py-16 px-4 bg-du-bg text-white">
      <div className="max-w-3xl bg-white/95 rounded-lg p-8 shadow-lg text-gray-900">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4">Help &amp; Support</h1>
        <p className="mb-4">DU Central is a student-driven platform for sharing study materials, connecting with batchmates, joining chat rooms, and collaborating for exam preparation.</p>
        <p className="mb-4">If you have any queries, reach out to us at the phone numbers or email below:</p>
        <ul className="mb-6 space-y-1">
          <li>Phone: <strong>9329990175</strong></li>
          <li>Phone: <strong>9102005567</strong></li>
          <li>Email: <strong>help@ducentral.com</strong></li>
        </ul>
        <p className="text-sm text-gray-600">We aim to respond to support requests within 48 hours. For urgent matters, please call the phone numbers listed above.</p>
      </div>
    </div>
  );
}

export default Help;
