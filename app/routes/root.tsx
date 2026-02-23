import { Outlet } from "react-router-dom";
import { useState } from "react";

import logo from "/IMG_1039.png";
import 'flowbite'

import GitHubButton from "react-github-btn";
import BuyMeACoffee from "../BuyMeACoffee";
import FeedbackModal from "../FeedbackModal";



export default function Root() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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
            </div>
            <div className="flex flex-row justify-between items-center gap-3">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="inline-flex items-center h-[28px] px-3 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 mr-1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
                Feedback
              </button>
              <BuyMeACoffee />
              <div className="flex items-center translate-y-[2px]">
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
      {showFeedbackModal && (
        <FeedbackModal key="feedback-modal" showModal={showFeedbackModal} setShowModal={setShowFeedbackModal} />
      )}
      <div id="main-content" className="pt-16">
        <Outlet />
      </div>
    </div >
  )
}


