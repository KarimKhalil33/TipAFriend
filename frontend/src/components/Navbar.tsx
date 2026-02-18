import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  return (
    <header className="w-full py-6 px-12 flex justify-between items-center bg-white bg-opacity-95 shadow-sm backdrop-filter backdrop-blur-lg relative z-20">
      <div className="text-2xl font-bold tracking-wide text-gray-800">
        <Link href={isAuthenticated ? "/marketplace" : "/landing"}>
          T<span style={{ color: "rgb(9, 13, 33)" }}>A</span>F
        </Link>
      </div>
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
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
            <nav className="flex space-x-6 items-center">
              <Link href="/marketplace">
                <span
                  className={`cursor-pointer transition duration-300 ease-in-out ${
                    pathname === "/marketplace"
                      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                      : "hover:text-blue-700 text-gray-700"
                  }`}
                >
                  Marketplace
                </span>
              </Link>
              <Link href="/create-post">
                <span
                  className={`cursor-pointer transition duration-300 ease-in-out ${
                    pathname === "/create-post"
                      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                      : "hover:text-blue-700 text-gray-700"
                  }`}
                >
                  Create Post
                </span>
              </Link>
              <Link href="/profile">
                <span
                  className={`cursor-pointer transition duration-300 ease-in-out ${
                    pathname === "/profile"
                      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
                      : "hover:text-blue-700 text-gray-700"
                  }`}
                >
                  Profile
                </span>
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <FaUser className="text-sm" />
                  <span className="text-sm font-medium">
                    {user?.displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </nav>
          </>
        ) : (
          /* Guest Navigation */
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
        )}
      </div>
    </header>
  );
}
