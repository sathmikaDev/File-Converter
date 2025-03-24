import React from "react";

const Header = () => {
  return (
    <div>
      <header>
        <div className="flex justify-between w-1/2 bg-white text-black mx-auto mt-5 rounded-full py-3 px-6">
          <span>ConvertAny</span>
          <div className="flex gap-4 items-center">
            <button className="">Log In</button>
            <button>Sign Up</button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
