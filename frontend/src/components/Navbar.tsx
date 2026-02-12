import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBell } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full py-6 px-12 flex justify-between items-center bg-white bg-opacity-95 shadow-sm backdrop-filter backdrop-blur-lg relative z-20">
      <div className="text-2xl font-bold tracking-wide text-gray-800">
        T<span style={{ color: "rgb(9, 13, 33)" }}>A</span>F
      </div>
      <div className="flex items-center gap-6">
        {/* Notifications Bell */}
        <Link href="/notifications">
          <div className="relative cursor-pointer">
            <FaBell
              className={`text-xl transition duration-300 ease-in-out ${
                pathname === "/notifications"
                  ? "text-blue-700"
                  : "hover:text-blue-700 text-gray-700"
              }`}
            />
            {/* Notification Badge */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              3
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex space-x-6">
          <Link href="/landing">
            <span
              className={`cursor-pointer transition duration-300 ease-in-out ${
                pathname === "/landing"
                  ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                  : "hover:text-blue-700 text-gray-700"
              }`}
            >
              Home
            </span>
          </Link>
          <Link href="/dashboard">
            <span
              className={`cursor-pointer transition duration-300 ease-in-out ${
                pathname === "/dashboard"
                  ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                  : "hover:text-blue-700 text-gray-700"
              }`}
            >
              Dashboard
            </span>
          </Link>
          <Link href="/login">
            <span
              className={`cursor-pointer transition duration-300 ease-in-out ${
                pathname === "/login"
                  ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                  : "hover:text-blue-700 text-gray-700"
              }`}
            >
              Login
            </span>
          </Link>
          <Link href="/signup">
            <span
              className={`cursor-pointer transition duration-300 ease-in-out ${
                pathname === "/signup"
                  ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                  : "hover:text-blue-700 text-gray-700"
              }`}
            >
              Sign Up
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
