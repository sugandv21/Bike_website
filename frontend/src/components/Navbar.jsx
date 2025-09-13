import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/images/logo1.png";
import lens from "../assets/images/lens.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { label: "Home", path: "/" },
    { label: "Buy Bike", path: "/buy" },
    { label: "Sell Bike", path: "/sell" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  const handleLinkClick = () => setIsOpen(false);

  useEffect(() => {
    const lock = isOpen ? "hidden" : "";
    document.body.style.overflow = lock;
    document.documentElement.style.overflow = lock;

    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <nav className="bg-white relative z-50" role="navigation" aria-label="main-navigation">
      <div className="max-w-8xl mx-auto px-4 md:px-2">
        {/* Desktop Navbar */}
        <div className="hidden lg:grid grid-cols-8 items-center h-20 lg:ps-10">
          <div className="flex justify-center">
            <NavLink to="/" onClick={handleLinkClick}>
              <img src={logo} alt="DriveRP" className="h-12" />
            </NavLink>
          </div>

          {links.map(({ label, path }) => (
            <div key={label} className="flex justify-center ">
              <NavLink
                to={path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `transition-colors font-bold text-sm lg:text-xl ${
                    isActive
                      ? "text-[#10a8a3]"
                      : "text-[#07435c] hover:text-[#10a8a3]"
                  }`
                }
              >
                {label}
              </NavLink>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/login")}
              className="bg-[#215671] text-white px-3 py-2 rounded-xl font-semibold hover:opacity-90 text-sm lg:text-lg"
            >
              Login
            </button>
          </div>

          <div className="flex justify-center">
            <img src={lens} alt="search" className="h-6 cursor-pointer" />
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="lg:hidden flex justify-between items-center h-20">
          <NavLink to="/" onClick={handleLinkClick}>
            <img src={logo} alt="DriveRP" className="h-6 md:h-10" />
          </NavLink>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-[#215671] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90"
            >
              Login
            </button>
            <img src={lens} alt="search" className="h-5 cursor-pointer" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              className="p-1"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-20 left-0 right-0 bottom-0 bg-white shadow-lg p-6 overflow-auto">
            <nav className="space-y-4">
              {links.map(({ label, path }) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block font-medium text-lg py-3 px-2 rounded-md transition-colors ${
                      isActive
                        ? "text-[#10a8a3]"
                        : "text-[#07435c] hover:text-[#10a8a3]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-3">
                <button
                  onClick={() => {
                    handleLinkClick();
                    navigate("/login");
                  }}
                  className="w-full bg-[#215671] text-white px-5 py-3 rounded-xl font-semibold"
                >
                  Login
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="h-[6px] w-full">
        <div className="w-full h-full shadow-[0_8px_12px_rgba(0,0,0,0.12)] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200" />
      </div>
    </nav>
  );
}
