import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import mainLogo from "../assets/logo.png";
// import mainLogo from "../assets/logo_shadow.png";
// import logoText from "../assets/logo_text.png";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    // { label: "", path: "/portfolio" },
    { label: "Work", path: "/work" },
    { label: "About us", path: "/about" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // 🔑 Works for both window scroll and custom scroll container with id="page"
  const goTop = () => {
    const main = document.getElementById("page");
    if (main && typeof main.scrollTo === "function") {
      main.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <header className="backdrop-blur-sm fixed top-0 left-0 w-full z-40 content-center">
      <div className="mx-auto max-w-7xl py-[24px] pt-[55px] flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center select-none"
        >
    
            {/* <img src={logoText} alt="text" className="h-[40px] w-auto" /> */}
          <h1 className="text-[30px] font-serif-display">HarIT</h1>

        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center">
          {/* <div className="relative p-[2px] bg-gradient-to-r from-[#00E5FF] via-[#FF6B00] to-[#00E5FF] rounded-full"> */}
          <div className="relative p-[1.4px] bg-[radial-gradient(circle,_#FF6B00,_#FF6B00,_#FF8C32,_#7A5CFF,_#00E5FF,_#00E5FF)] rounded-full items-center">
            <div className="bg-[#fff] backdrop-blur shadow-custom-4px px-[25px] rounded-full h-auto py-[4px] flex items-center">

              <nav className="nav-links px-[30px] min-w-[600px] bg-white text-center flex justify-between text-slate-700 text-[18px] font-helvetica font-medium">
                {/* {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative transition-colors ${currentPath === item.path
                        ? "text-[#090c0f] text-[16px] font-helvetica-bold font-bold after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[2px] after:bg-[#0087F9]"
                        : "hover:text-[#0087F9] text-[16px] hover:font-helvetica-bold font-semibold"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))} */}
                <div className="flex gap-[90px] w-[200px] justify-start">
                  <Link
                    key="/"
                    to="/"
                    className={`relative transition-colors ${currentPath === "/"
                      ? "text-[#FF6B00] text-[16px] font-helvetica-bold font-bold after:content-[''] after:absolute after:-bottom-[0px] after:left-0 after:w-full after:h-[2px] after:bg-[#FF6B00]"
                      : "hover:text-[#FF6B00] text-[16px] hover:font-helvetica-bold font-semibold"
                      }`}
                  >
                    Home
                  </Link>
                  <Link
                    key="/services"
                    to="/services"
                    className={`relative transition-colors ${currentPath === "/services"
                      ? "text-[#FF6B00] text-[16px] font-helvetica-bold font-bold after:content-[''] after:absolute after:-bottom-[0px] after:left-0 after:w-full after:h-[2px] after:bg-[#FF6B00]"
                      : "hover:text-[#FF6B00] text-[16px] hover:font-helvetica-bold font-semibold"
                      }`}
                  >
                    Services
                  </Link>
                </div>

                <div className="relative flex w-[160px]">
                  <Link
                  key="/"
                  to="/"
                  className="rounded-full z-50 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] object-center object-contain content-center justify-items-center [box-shadow:0_0_35px_rgba(255,107,0,0.3),inset_0_0_12px_rgba(255,107,0,0.5)]"
                >
                  <img src={mainLogo} alt="" className=" w-[38px] h-[38px]" />
                </Link>

                </div>
                {/* <Link
                  key="/"
                  to="/"
                  className={`rounded-full absolute top-1/2 left-1/2 transform -translate-x-full -translate-y-1/2 shadow-[0_0_35px_rgba(255,107,0,0.7)] transition-colors ${currentPath === "/"
                    ? ""
                    : ""
                    }`}
                >
                  <img src={mainLogo} alt="" className="rounded-full w-[70px] h-[70px]" />
                </Link> */}

                <div className="flex gap-[90px] w-[200px] justify-end">
                  <Link
                    key="/work"
                    to="/work"
                    className={`relative transition-colors ${currentPath === "/work"
                      ? "text-[#FF6B00] text-[16px] font-helvetica-bold font-bold after:content-[''] after:absolute after:-bottom-[0px] after:left-0 after:w-full after:h-[2px] after:bg-[#FF6B00]"
                      : "hover:text-[#FF6B00] text-[16px] hover:font-helvetica-bold font-semibold"
                      }`}
                  >
                    Work
                  </Link>
                  <Link
                    key="/about"
                    to="/about"
                    className={`relative transition-colors ${currentPath === "/about"
                      ? "text-[#FF6B00] text-[16px] font-helvetica-bold font-bold after:content-[''] after:absolute after:-bottom-[0px] after:left-0 after:w-full after:h-[2px] after:bg-[#FF6B00]"
                      : "hover:text-[#FF6B00] text-[16px] hover:font-helvetica-bold font-semibold"
                      }`}
                  >
                    About
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/contact">
            <button
              className={`btn-primary px-3 py-1 transition-shadow ${currentPath === "/contact"
                ? "text-[#FF6B00] border-b-2 border-[#FF6B00] font-bold text-[16px] rounded-2xl"
                : "text-[#fff] bg-[#FF6B00] rounded-2xl text-[16px] hover:text-[#FF6B00] hover:border-b-2 hover:border-[#FF6B00] hover:rounded-2xl hover:bg-transparent hover:shadow-none font-helvetica-bold font-semibold shadow-[0_0_40px_rgba(255,107,0,0.4)]"
                }`}
            >
              Contact us
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-[#10141a] text-3xl">
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden px-6 pt-4 pb-6 bg-[#fefefe00] backdrop-blur shadow-xl h-[100vh]">
          <nav className="flex flex-col gap-5 text-center text-slate-700 text-[18px] font-helvetica">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  closeMenu();
                }}
                className={`relative transition-colors ${currentPath === item.path
                  ? "text-[#090c0f] font-helvetica-bold"
                  : "hover:text-[#0087F9] hover:font-helvetica-bold"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => {
                closeMenu();
              }}
            >
              <button
                className={`w-full mt-4 px-3 py-2 text-[#fff] bg-[#FF6B00] rounded-lg text-[16px] font-helvetica-bold shadow-custom-contact hover:shadow-custom-contact-h transition-shadow ${currentPath === "/contact"
                  ? "text-[#FF6B00] border-b-2 border-[#FF6B00]"
                  : ""
                  }`}
              >
                Contact us
              </button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
