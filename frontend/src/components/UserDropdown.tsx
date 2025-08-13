import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "react-router-dom";
import { ChevronDown, CircleUserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserDropdown = () => {
  const { logout, email } = useAuth();

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1 px-3 py-1 rounded-full text-orange-600 hover:ring-2 ring-orange-600 transition">
        <CircleUserRound className="w-8 h-8" />
        
        <ChevronDown className="w-4 h-4 text-orange-600" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="absolute mt-3 w-64 origin-top-right z-50"
      >

        {/* Panel */}
        <div className="relative bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-100">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">Welcome</p>
            <p className="text-sm text-gray-500">{email ?? "you@example.com"}</p>
          </div>

          <div className="py-1 text-sm text-gray-800">
            <MenuItem>
              <Link
                to="/history"
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition rounded-lg"
              >
                History
                
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                to="/"
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition rounded-lg"
              >
                Settings
              </Link>
            </MenuItem>
          </div>

          <div className="border-t my-1" />

          <MenuItem>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition rounded-lg"
            >
              Log out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

export default UserDropdown;
