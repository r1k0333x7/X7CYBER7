'use client';

export default function Footer() {
  return (
    <footer className="relative border-t border-cyberneon-border mt-12 sm:mt-20 backdrop-blur-md bg-cyberneon-dark/50">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">X7 Cyber</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Premium defensive cybersecurity platform</p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-cyberneon-blue mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyberneon-blue transition">Features</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Pricing</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Security</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Roadmap</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-cyberneon-blue mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyberneon-blue transition">About</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Blog</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Careers</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-cyberneon-blue mb-3 sm:mb-4">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyberneon-blue transition">Privacy</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Terms</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">Disclaimer</a></li>
                <li><a href="#" className="hover:text-cyberneon-blue transition">License</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-cyberneon-border mb-6 sm:mb-8"></div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs sm:text-sm">
            <p>&copy; 2024 X7 Cyber. All rights reserved.</p>
            <p className="text-cyberneon-blue font-semibold">🛡️ Defensive Security Only</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-cyberneon-blue transition">Twitter</a>
              <a href="#" className="hover:text-cyberneon-blue transition">GitHub</a>
              <a href="#" className="hover:text-cyberneon-blue transition">Discord</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
