import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import logo from "/IMG_1039.png";
import { supabase } from "../supabase";
import { Session } from "@supabase/supabase-js";
import 'flowbite'

import { Avatar, DarkThemeToggle, Dropdown, Navbar } from "flowbite-react";
import GitHubButton from "react-github-btn";

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
      <Navbar
        fluid
        className="absolute z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <Navbar.Brand
          className="pl-2"
          as={Link}
        >
          <img
            alt="Flowbite React Logo"
            className="mr-3 h-6 sm:h-9"
            src={logo as string}
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            geodatadownloader
          </span>
        </Navbar.Brand>
        <div className="flex flex-row justify-between items-center gap-5">
          <div className="flex">
            <Dropdown
              dismissOnClick
              inline
              arrowIcon={false}
              label={
                <button className="flex flex-col items-center w-10 h-10 p-2 text-gray-500 rounded-lg sm:flex hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 justify-center">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
              }
            >
              <div className="max-w-sm overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded dark:bg-gray-700 dark:divide-gray-600 block">
                <div className="grid grid-cols-3 gap-4 p-4">
                  <a href="/" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                      <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white" sidebar-toggle-item="">Download</span>
                  </a>
                  <a href="/maps/saved" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path d="m1.56 6.245 8 3.924a1 1 0 0 0 .88 0l8-3.924a1 1 0 0 0 0-1.8l-8-3.925a1 1 0 0 0-.88 0l-8 3.925a1 1 0 0 0 0 1.8Z" />
                      <path d="M18 8.376a1 1 0 0 0-1 1v.163l-7 3.434-7-3.434v-.163a1 1 0 0 0-2 0v.786a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.786a1 1 0 0 0-1-1Z" />
                      <path d="M17.993 13.191a1 1 0 0 0-1 1v.163l-7 3.435-7-3.435v-.163a1 1 0 1 0-2 0v.787a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.787a1 1 0 0 0-1-1Z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white" sidebar-toggle-item="">Maps</span>
                  </a>
                  <a href="/maps/dl/config/" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm14-7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule</span>
                  </a>
                </div>
              </div>
            </Dropdown>
          </div>
          <div className="h-full pt-2"> {/*Make the button align with the rest of the buttons*/}
            <GitHubButton href="https://github.com/mchaynes/geodatadownloader" data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" data-show-count="true" aria-label="Star mchaynes/geodatadownloader on GitHub">Star</GitHubButton>
          </div>

          <div className="flex md:order-3">
            <Dropdown
              inline
              label={<Avatar alt="User settings" img="/avatar.png" rounded />}
            >
              <Dropdown.Header className="block text-sm border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <span >
                  {session?.user.email}
                </span>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item>
                <Link to="/signout">
                  Sign out
                </Link>
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

      </Navbar>
      <div className="hidden overflow-hidden bg-gray-50 dark:bg-gray-900">
        <aside id="sidebar" className="fixed top-0 left-0 z-20 flex-col flex-shrink-0 w-48 h-full pt-16 font-normal duration-75 lg:flex transition-width" aria-label="Sidebar">
          <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <ul className="pb-2 space-y-2">
                  <li>
                    <Link to="/" className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                      <svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                      </svg>
                      <span className="ml-3" sidebar-toggle-item="">Download</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/" className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                      <svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="m1.56 6.245 8 3.924a1 1 0 0 0 .88 0l8-3.924a1 1 0 0 0 0-1.8l-8-3.925a1 1 0 0 0-.88 0l-8 3.925a1 1 0 0 0 0 1.8Z" />
                        <path d="M18 8.376a1 1 0 0 0-1 1v.163l-7 3.434-7-3.434v-.163a1 1 0 0 0-2 0v.786a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.786a1 1 0 0 0-1-1Z" />
                        <path d="M17.993 13.191a1 1 0 0 0-1 1v.163l-7 3.435-7-3.435v-.163a1 1 0 1 0-2 0v.787a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.787a1 1 0 0 0-1-1Z" />
                      </svg>
                      <span className="ml-3" sidebar-toggle-item="">Discover</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/maps/saved" className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                      <svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 16 20">
                        <path d="M8 5.625c4.418 0 8-1.063 8-2.375S12.418.875 8 .875 0 1.938 0 3.25s3.582 2.375 8 2.375Zm0 13.5c4.963 0 8-1.538 8-2.375v-4.019c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353c-.193.081-.394.158-.6.231l-.189.067c-2.04.628-4.165.936-6.3.911a20.601 20.601 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244c-.053-.028-.113-.053-.165-.082v4.019C0 17.587 3.037 19.125 8 19.125Zm7.09-12.709c-.193.081-.394.158-.6.231l-.189.067a20.6 20.6 0 0 1-6.3.911 20.6 20.6 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244C.112 6.035.052 6.01 0 5.981V10c0 .837 3.037 2.375 8 2.375s8-1.538 8-2.375V5.981c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353Z" />
                      </svg>
                      <span className="flex-1 ml-3 text-left whitespace-nowrap" sidebar-toggle-item="">Saved</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/maps/dl/config/" className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                      <svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                      </svg>
                      <span className="flex-1 ml-3 text-left whitespace-nowrap" sidebar-toggle-item="">Configurations</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div >
        </aside >
        <div className="fixed inset-0 z-10 hidden bg-gray-900/50 dark:bg-gray-900/90" id="sidebarBackdrop"></div>

      </div>
      <div id="main-content" className="relative w-full h-full py-16 bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </div>
    </div >
  )
}


