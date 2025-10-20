import { Outlet } from "react-router-dom";

import logo from "/IMG_1039.png";
import 'flowbite'

import GitHubButton from "react-github-btn";



export default function Root() {
  return (
    <div>
      <header className="z-40">
        <nav className="fixed w-full bg-white dark:border-gray-700 border-gray-200 px-4 lg:px-6 pt-2 pb-1 dark:bg-dark-bg border-b z-10">
          <div className="flex flex-wrap justify-between items-center mx-auto">
            <div className="flex flex-row h-6 justify-center">
              <a href="https://geodatadownloader.com" className="flex items-center">
                <img src={logo as string} className="mr-3 h-6 sm:h-9" alt="Geodatadownloader Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">geodatadownloader</span>
              </a>

              <div className="ml-10 text-green-700 bg-green-50 dark:bg-green-100 dark:text-green-800 ring-green-600/20 rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset">
                <span className="self-center text-xs font-semibold whitespace-nowrap">Looking for data? Check out <a className="text-bold text-green-800 hover:underline" about="_blank" href="https://galileo.gisdata.io">Galileo</a></span>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center gap-5">
              <div className="h-full pt-2"> {/*Make the button align with the rest of the buttons*/}
                <GitHubButton href="https://github.com/mchaynes/geodatadownloader" data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" data-show-count="true" aria-label="Star mchaynes/geodatadownloader on GitHub">Star</GitHubButton>
              </div>
              <div className="md:order-3">
                {/*<Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full dark:bg-dark-text-bg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="/avatar.png"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-dark-bg py-1 border border-black dark:border-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {() => (
                          <a
                            href="#"
                            className="hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-text-bg dark:text-white dark:hover:text-white block px-4 py-2 text-sm text-gray-700"
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {() => (
                          <a
                            href="/settings"
                            className="hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-text-bg dark:text-white dark:hover:text-white block px-4 py-2 text-sm text-gray-700"
                          >
                            Settings
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {() => (
                          <a
                            href="/signout"
                            className="hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-text-bg dark:text-white dark:hover:text-white block px-4 py-2 text-sm text-gray-700"
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>*/}
              </div>
            </div>
          </div>
        </nav>
      </header>
      <div id="main-content" className="pt-16">
        <Outlet />
      </div>
    </div >
  )
}


