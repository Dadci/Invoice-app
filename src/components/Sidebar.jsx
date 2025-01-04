import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import moon from "../assets/moon.svg";
import profil from "../assets/profil.svg";

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 md:relative md:w-24 bg-[#373B53] md:h-screen overflow-hidden md:rounded-r-[20px] flex md:flex-col justify-between z-[100]">
      <div className=" md:block">
        <img src={logo} alt="logo" />
      </div>

      <div className="flex md:flex-col items-center justify-end gap-8 md:justify-between md:gap-0 w-full md:space-y-6 p-6 md:pb-6">
        <img src={moon} alt="" className="w-6 h-6" />
        <div className="hidden md:block border-t w-full border-t-indigo-200/40"></div>
        <img src={profil} alt="" className="w-8 h-8" />
      </div>
    </div>
  )
}

export default Sidebar;
