import { ArrowRight, Users, BookMarked, Lightbulb, Clock } from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNavigate?: (path: string) => void;
}

export function Landing({ onLoginClick, onSignupClick, onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-du-bg">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-10">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-bold text-purple-600 tracking-tight">DU Central</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={onLoginClick}
                className="px-[5px] py-[1px] sm:px-[6px] sm:py-[1px] text-gray-900 hover:text-purple-600 font-semibold transition text-[7px] leading-none rounded-full"
              >
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="px-[5px] py-[1px] sm:px-[6px] sm:py-[1px] bg-purple-500 text-white rounded-full hover:bg-purple-600 font-semibold transition text-[7px] leading-none shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 items-center mb-12">
            <div>
              <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Connect, Study,<span className="text-purple-400"> Succeed</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mb-6 leading-relaxed">
                Join thousands of DU students preparing for exams together. Access study materials, share notes, and connect with friends on your campus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onSignupClick}
                  className="flex items-center justify-center space-x-2 px-3 py-1.5 sm:px-5 sm:py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold transition text-xs sm:text-sm"
                >
                  <span>Join DU Central Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onLoginClick}
                  className="flex items-center justify-center space-x-2 px-3 py-1.5 sm:px-5 sm:py-2 bg-white text-purple-600 rounded-md hover:bg-purple-50 font-semibold transition text-xs sm:text-sm border border-purple-100"
                >
                  <span>Already a member?</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl opacity-30 blur-3xl bg-purple-500"></div>
              <div className="relative bg-white/95 rounded-2xl p-3 sm:p-6 shadow-md border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-white p-2 rounded-lg flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Connect with Friends</h3>
                      <p className="text-gray-600 text-xs mt-1">Find and connect with your batch mates across Delhi University</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white p-2 rounded-lg flex-shrink-0">
                      <BookMarked className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Study Materials</h3>
                      <p className="text-gray-600 text-xs mt-1">Access and share notes, study guides organized by subject</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white p-2 rounded-lg flex-shrink-0">
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Last-Night Prep</h3>
                      <p className="text-gray-600 text-xs mt-1">Get quick short notes and revision materials right before exams</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-md border border-gray-100 mb-10">
            <h2 className="text-sm sm:text-xl font-bold text-purple-600 text-center mb-3">Why Choose DU Central?</h2>
            <p className="text-center text-gray-800 mb-6 text-xs sm:text-sm">Everything you need for exam success, all in one place</p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-purple-600 text-xs mb-1">Active Community</h3>
                <p className="text-gray-800 text-xs">Connect with thousands of students from your college and across DU</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookMarked className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-purple-600 text-xs mb-1">Rich Resources</h3>
                <p className="text-gray-800 text-xs">Curated study materials, notes, and resources organized by subject</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-purple-600 text-xs mb-1">Learn Together</h3>
                <p className="text-gray-800 text-xs">Chat, discuss, and collaborate with peers for better understanding</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <h2 className="text-sm sm:text-lg font-bold text-white mb-3">Ready to Get Started?</h2>
            <p className="text-xs sm:text-sm text-white/90 mb-4">Join DU Central today and be part of a thriving student community</p>
            <button
              onClick={onSignupClick}
              className="inline-flex items-center space-x-2 px-3 py-1.5 sm:px-6 sm:py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold transition text-xs sm:text-sm shadow-md"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-purple-500 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">DU Central</h4>
              <p className="text-xs">Connecting Delhi University students for better learning</p>
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
          <div className="border-t border-white/30 pt-4 text-center text-xs">
            <p>&copy; 2025 DU Central. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
