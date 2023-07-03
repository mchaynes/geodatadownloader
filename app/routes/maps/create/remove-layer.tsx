
import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { ActionFunctionArgs, Form, Navigate, useActionData, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getMapConfigLocal, saveMapConfigLocal } from '../../../database';

export const removeLayerAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const url = formData.get("url")
  const mapData = getMapConfigLocal()
  mapData.layers = mapData.layers.filter(l => l.url !== url)
  saveMapConfigLocal(mapData)
  return "removed"
}


export default function RemoveLayerModal() {
  const navigate = useNavigate()
  const params = useSearchParams()
  const url = params["url"]

  const actionData = useActionData() as Awaited<ReturnType<typeof removeLayerAction>>
  if (actionData) {
    return <Navigate to="../" relative="route" replace />
  }
  const navigateBack = () => {
    navigate("../", { relative: "route", replace: true })
  }

  return (
    <Modal show={true} size="md" onClose={navigateBack} popup className="bg-gray-900/90">
      <Modal.Header />
      <Modal.Body>
        <Form method="post">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to remove layer?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" type="submit" name="url" value={url}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={navigateBack}>
                No, cancel
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}


