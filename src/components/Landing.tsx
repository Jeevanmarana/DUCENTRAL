import { ArrowRight, Users, BookMarked, Lightbulb, Clock, Users2 } from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNavigate?: (path: string) => void;
}

export function Landing({ onLoginClick, onSignupClick, onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-du-bg">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-purple-600">DU Central</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onLoginClick}
                className="px-4 py-1.5 sm:px-6 sm:py-2 text-gray-900 hover:text-purple-600 font-medium transition text-sm sm:text-base"
              >
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="px-4 py-1.5 sm:px-6 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition text-sm sm:text-base"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Connect, Study,<span className="text-purple-400"> Succeed</span>
              </h1>
              <p className="text-base sm:text-lg text-white/90 mb-8 leading-relaxed">
                Join thousands of DU students preparing for exams together. Access study materials, share notes, and connect with friends on your campus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onSignupClick}
                  className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition text-base sm:text-lg"
                >
                  <span>Join DU Central Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onLoginClick}
                  className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 border-2 border-white/30 text-white rounded-lg hover:border-purple-300 hover:text-purple-200 font-semibold transition text-base sm:text-lg"
                >
                  <span>Already a member?</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl opacity-30 blur-3xl bg-purple-500"></div>
              <div className="relative bg-white/95 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/30">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white p-3 rounded-lg flex-shrink-0">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Connect with Friends</h3>
                      <p className="text-gray-600 text-sm mt-1">Find and connect with your batch mates across Delhi University</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white p-3 rounded-lg flex-shrink-0">
                      <BookMarked className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Study Materials</h3>
                      <p className="text-gray-600 text-sm mt-1">Access and share notes, study guides organized by subject</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white p-3 rounded-lg flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Last-Night Prep</h3>
                      <p className="text-gray-600 text-sm mt-1">Get quick short notes and revision materials right before exams</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 text-center mb-4">Why Choose DU Central?</h2>
            <p className="text-center text-gray-800 mb-12 text-base sm:text-lg">Everything you need for exam success, all in one place</p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-purple-600 text-lg mb-3">Active Community</h3>
                <p className="text-gray-800">Connect with thousands of students from your college and across DU</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookMarked className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-purple-600 text-lg mb-3">Rich Resources</h3>
                <p className="text-gray-800">Curated study materials, notes, and resources organized by subject</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-purple-600 text-lg mb-3">Learn Together</h3>
                <p className="text-gray-800">Chat, discuss, and collaborate with peers for better understanding</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-base sm:text-xl text-white/90 mb-8">Join DU Central today and be part of a thriving student community</p>
            <button
              onClick={onSignupClick}
              className="inline-flex items-center space-x-2 px-6 py-2 sm:px-10 sm:py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-purple-500 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">DU Central</h4>
              <p className="text-sm">Connecting Delhi University students for better learning</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => onSignupClick()}
                    className="hover:text-white transition text-left"
                  >
                    Join Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSignupClick()}
                    className="hover:text-white transition text-left"
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => (onNavigate ? onNavigate('/help') : (window.location.href = '/help'))}
                    className="hover:text-white transition text-left"
                  >
                    Help
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => (onNavigate ? onNavigate('/contact') : (window.location.href = '/contact'))}
                    className="hover:text-white transition text-left"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/30 pt-8 text-center text-sm">
            <p>&copy; 2025 DU Central. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
