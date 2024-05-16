import { ActionFunctionArgs, Form, LoaderFunctionArgs, Navigate, useActionData, useLoaderData, useNavigate } from "react-router-dom"
import { Formats, Days, Frequency, Frequencies } from "../../../../types"
import { supabase } from "../../../../supabase"
import { useState } from "react"
import dayjs from "dayjs"
import { dlConfigFromForm } from "../../../../database"

export const updateMapDlConfigLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data, error } = await supabase.from("map_dl_config")
    .select("*, map(*)")
    .eq("id", params.id)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const updateMapDlConfigAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  console.log(formData.get("active"))
  const dlConfig = dlConfigFromForm(formData)
  return await supabase.from("map_dl_config")
    .update(dlConfig)
    .eq("id", params.id)
}

export default function UpdateMapDlConfig() {
  const dlConfig = useLoaderData() as Awaited<ReturnType<typeof updateMapDlConfigLoader>>
  const actionData = useActionData() as Awaited<ReturnType<typeof updateMapDlConfigAction>>

  const [frequency, setFrequency] = useState(dlConfig.frequency)

  const navigate = useNavigate()

  if (actionData) {
    return <Navigate to="../" replace relative="route" />
  }

  return (
    <div id="updateProductModal"
      tabIndex={-1}
      key={`${dlConfig?.id}-updateProductModal`}
      className={`${dlConfig ? "" : "hidden"} fixed bg-gray-600/80 left-0 right-0 z-50 items-center justify-center overflow-y-auto top-4 md:inset-0 h-modal sm:h-full flex`}
      role="modal"
    >
      <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">

          <Form method="post">
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update Download Config
              </h3>
              <div className="flex-grow" />
              <div className="flex items-center pr-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="active" defaultChecked={dlConfig.active} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Active</span>
                </label>
              </div>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-toggle="updateProductModal"
                onClick={() => navigate("../", { relative: "route", replace: true })}
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">

              <div className="col-span-2">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Source Map</label>
                {/*@ts-ignore*/}
                <input type="text" name="name" disabled id="name" defaultValue={dlConfig?.map.name ?? undefined} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 cursor-not-allowed" placeholder="Wetlands - Daily" required />
              </div>

              <div>
                <label htmlFor="access-key-id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Access Key ID</label>
                <input type="password" name="access_key_id" id="access-key-id" defaultValue={dlConfig?.access_key_id} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="XXXXXXX" />
              </div>
              <div>
                <label htmlFor="secret-key" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Secret Key</label>
                <input type="password" name="secret_key" id="secret-key" defaultValue={dlConfig?.secret_key} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="XXXXXXX" />
              </div>
              <div>
                <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Format</label>
                <select defaultValue={dlConfig?.format} name="format" id="format" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                  {Formats.map(f =>
                    <option key={f} value={f}>
                      {f}
                    </option>)}
                </select>
              </div>
              <div>
                <label htmlFor="destination" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Destination (S3 or R2)</label>
                <input type="url" name="destination" id="destination" defaultValue={dlConfig?.destination} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="XXXXXXX" />
              </div>
              <div className="col-span-2">
                <label htmlFor="frequency" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Frequency</label>
                <select id="frequency" name="frequency" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as Frequency)}
                >
                  {Frequencies.map(f =>
                    <option key={f} value={f}>
                      {f}
                    </option>)}
                </select>
              </div>

              {frequency === "weekly" && (
                <div className="w-full col-span-2">
                  <h3 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Days Of Week</h3>
                  <ul className="items-center p-1 gap-1 text-sm font-medium text-gray-900 rounded-lg sm:flex dark:text-white">
                    {Days.map(day =>
                      <li key={day} className="w-full rounded-lg border border-gray-300 dark:border-gray-600">
                        <div className="flex items-center pl-3">
                          <input id={`${day}`} name={`${day}`} type="checkbox" defaultChecked={dlConfig?.days_of_week.includes(day)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                          <label htmlFor={`${day}`} className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{day.slice(0, 2).toUpperCase()}</label>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {frequency === "monthly" && (
                <div className="col-span-2">
                  <label htmlFor="day-of-month" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Day of Month (1-28)</label>
                  <input type="number" defaultValue={dlConfig?.day_of_month ?? 1} name="day_of_month" id="day-of-month" min={1} max={28} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="15" />
                </div>
              )}
              {["monthly", "daily", "weekly"].includes(frequency) && (
                <div className="col-span-2">
                  <label htmlFor="time-of-day" className="mb-2 flex flex-row items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    Hour Of Day (0-23)
                    <svg data-tooltip-target="tooltip-default" className="w-[14px] h-[14px] text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
                    </svg>
                    <div id="tooltip-default" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                      Runs in UTC time. Your timezone is {dayjs().utcOffset() / 60} hours off of UTC
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                  </label>
                  <input type="number" defaultValue={parseInt(`${dlConfig?.time_of_day ? dlConfig.time_of_day.slice(0, 2) : "6"}`).toString()} name="time_of_day" id="time_of_day" min={0} max={23} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button type="submit" name="intent" value="update" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                Update
              </button>
              <button type="submit" name="intent" value="delete" className="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
                <svg className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                Delete
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
