import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  FaLinkedinIn, 
  FaGithub, 
  FaTwitter, 
  FaYoutube, 
  FaInstagram, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe 
} from 'react-icons/fa';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-gradient-to-r from-primary to-purple-500 text-white pt-16 pb-8 relative", className)}>
      <div className="absolute left-0 top-0 bg-purple-500 bg-opacity-20 h-full w-1/3 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#8054fe 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SHIV JHA</h3>
            <p className="text-white text-opacity-80 mb-6">
              Full-stack MERN developer passionate about creating beautiful, functional web applications.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300 transition duration-200">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition duration-200">
                <FaGithub />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition duration-200">
                <FaTwitter />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition duration-200">
                <FaYoutube />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-white text-opacity-80">
              <li className="flex items-center">
                <FaMapMarkerAlt className="mr-2" /> New Delhi, India
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2" /> contact@shivjha.com
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2" /> +91 9876543210
              </li>
              <li className="flex items-center">
                <FaGlobe className="mr-2" /> www.shivjha.com
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white text-opacity-80">
              <li>
                <Link href="/" className="hover:text-white transition duration-200">Home</Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition duration-200">About</Link>
              </li>
              <li>
                <Link href="/#skills" className="hover:text-white transition duration-200">Skills</Link>
              </li>
              <li>
                <Link href="/#projects" className="hover:text-white transition duration-200">Projects</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition duration-200">Blog</Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-white transition duration-200">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Social</h3>
            <ul className="space-y-2 text-white text-opacity-80">
              <li>
                <a href="#" className="hover:text-white transition duration-200 flex items-center">
                  <FaLinkedinIn className="mr-2" /> LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition duration-200 flex items-center">
                  <FaGithub className="mr-2" /> GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition duration-200 flex items-center">
                  <FaTwitter className="mr-2" /> Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition duration-200 flex items-center">
                  <FaYoutube className="mr-2" /> YouTube
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition duration-200 flex items-center">
                  <FaInstagram className="mr-2" /> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 pt-8 text-center text-white text-opacity-60 text-sm">
          <p>&copy; {new Date().getFullYear()} Shiv Jha. All rights reserved.</p>
        </div>
      </div>
      
      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/919876543210" 
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50 transition duration-300"
      >
        <FaGithub className="text-2xl" />
      </a>
    </footer>
  );
}
