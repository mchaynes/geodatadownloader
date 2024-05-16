import { Fragment, useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import logo from "/IMG_1039.png";
import { supabase } from "../supabase";
import { Session } from "@supabase/supabase-js";
import 'flowbite'

import { Tooltip } from "flowbite-react";
import GitHubButton from "react-github-btn";
import { Menu, Transition } from "@headlessui/react";



export default function Root() {
  const location = useLocation()
  const [session, setSession] = useState<Session>()

  useEffect(() => {
    async function f() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
      }
    }
    void f()
  }, [location])
  return (
    <div>
      <header className="z-40">
        <nav className="fixed w-full bg-white dark:border-gray-700 border-gray-200 px-4 lg:px-6 pt-2 pb-1 dark:bg-dark-bg border-b z-10">
          <div className="flex flex-wrap justify-between items-center mx-auto">
            <a href="https://geodatadownloader.com" className="flex items-center">
              <img src={logo as string} className="mr-3 h-6 sm:h-9" alt="Geodatadownloader Logo" />
              <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">geodatadownloader</span>
            </a>
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
      <div className="z-0">
        <aside id="sidebar" className="fixed top-0 left-0 z-0 flex-col flex-shrink-0 w-16 h-full font-normal duration-75 lg:flex transition-width" aria-label="Sidebar">
          <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-dark-bg dark:border-gray-700">
            <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 dark:bg-dark-bg dark:divide-gray-700">
                <ul className="space-y-3 divide-y divide-gray-200 pt-16">
                  <li>
                    <Tooltip placement="right-end" content="Download">
                      <Link to="/" className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                        <svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                          <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                        </svg>
                      </Link>
                    </Tooltip>
                  </li>
                  {/*<li>

                    <Tooltip placement="right-end" content="Saved Maps" className="w-28">
                      <Link to="/maps/saved" className="flex items-center p-2 mt-3 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                        <svg className="flex-shrink-0 text-gray-500 w-6 h-6 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path d="m1.56 6.245 8 3.924a1 1 0 0 0 .88 0l8-3.924a1 1 0 0 0 0-1.8l-8-3.925a1 1 0 0 0-.88 0l-8 3.925a1 1 0 0 0 0 1.8Z" />
                          <path d="M18 8.376a1 1 0 0 0-1 1v.163l-7 3.434-7-3.434v-.163a1 1 0 0 0-2 0v.786a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.786a1 1 0 0 0-1-1Z" />
                          <path d="M17.993 13.191a1 1 0 0 0-1 1v.163l-7 3.435-7-3.435v-.163a1 1 0 1 0-2 0v.787a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.787a1 1 0 0 0-1-1Z" />
                        </svg>
                      </Link>
                    </Tooltip>
                  </li>
                  <li>

                    <Tooltip placement="right-end" content="Scheduled Downloads" className="w-44">
                      <Link to="/maps/dl/config" className="flex items-center p-2 mt-3 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                        <svg className="flex-shrink-0 text-gray-500 w-6 h-6 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm14-7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
                        </svg>
                      </Link>
                    </Tooltip>
                  </li>*/}
                </ul>
              </div>
            </div>
          </div >
        </aside >
        <div className="fixed inset-0 z-10 hidden bg-gray-900/50 dark:bg-gray-900/90" id="sidebarBackdrop"></div>

      </div>
      <div id="main-content" className="pt-16 pl-16">
        <Outlet />
      </div>
    </div >
  )
}


