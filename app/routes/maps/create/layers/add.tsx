import { ActionFunctionArgs, Form, useActionData, useLoaderData, useNavigate, useRouteLoaderData } from "react-router-dom"


export const addLayerToMapAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const layerUrl = formData.get("layer-url") as string
  let layer: FeatureLayer | undefined = undefined
  let errMsg = ""
  try {
    layer = new FeatureLayer({
      url: layerUrl,
    });
    await layer.load();
  } catch (e) {
    const err = e as Error;
    errMsg = err.message
  }
  return {
    layer: layer,
    err: errMsg,
  }
}

export default function AddLayerToMap() {

  const navigate = useNavigate()
  const actionData = useActionData()

  return (
    <div id="add-layer-modal"
      tabIndex={-1}
      key="add-layer-modal"
      className="fixed bg-gray-600/80 left-0 right-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full flex"
      role="modal"
    >
      <div className="relative p-4 w-full max-w-5xl h-full md:h-auto">
        <div className="relative p-4 w-5/6 h-5/6 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <Form method="post">
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Layer To Map
              </h3>
              <div className="flex-grow" />
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-toggle="updateProductModal"
                onClick={() => navigate("../../", { relative: "route", replace: true, })}
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">
              <div className="col-span-2">

                <div className="flex flex-col gap-4">
                  <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="search" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Paste URL or Search For Layer" required />
                    <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Load</button>
                  </div>
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Where</label>
                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="1=1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button type="submit" name="intent" value="update" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  Add
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
