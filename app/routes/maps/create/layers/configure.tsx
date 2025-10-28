import { ActionFunctionArgs } from "react-router-dom";
import { getMapConfigLocal, saveMapConfigLocal } from "../../../../database";
import { raise } from "../../../../types";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { Button, Checkbox, Label, Modal, TextInput } from 'flowbite-react';
import { LayerConfig } from '../../../../types';


export const configureLayerAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const url = formData.get("url") as string ?? raise("Url isn't defined")
  const where = formData.get("where") as string ?? raise("Where isn't defined")
  const mapConfig = await getMapConfigLocal()
  const normalize = (u: string) => (u ?? "").replace(/\/+$/, "")
  const layer = mapConfig.layers.find(l => normalize(l.url) === normalize(url)) ?? raise("Unable to find layer")
  const mapping: { [k: string]: string } = {}
  for (const [k, newName] of formData.entries()) {
    console.log(`${k}: ${newName}`)
    if (!k.endsWith("-new")) {
      continue
    }
    const fieldName = k.replace(/-new$/, "")
    console.log(`${k}:   ${fieldName}`)
    const enabled = formData.get(`${fieldName}-enabled`) === "on"
    if (enabled) {
      mapping[fieldName] = newName as string
    }
  }
  layer.column_mapping = mapping
  layer.where_clause = where
  saveMapConfigLocal(mapConfig)
  return mapping
}


type ConfirmDownloadModalProps = {
  open: boolean
}

export default function ConfirmDownloadModal({
  open
}: ConfirmDownloadModalProps) {

  return (
    <Modal show={open} size="md" popup onClose={() => history.back()}>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Your email" />
            </div>
            <TextInput id="email" placeholder="name@company.com" required />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Your password" />
            </div>
            <TextInput id="password" type="password" required />
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <a href="/modal" className="text-sm text-cyan-700 hover:underline dark:text-cyan-500">
              Lost Password?
            </a>
          </div>
          <div className="w-full">
            <Button>Log in to your account</Button>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
            Not registered?&nbsp;
            <a href="/modal" className="text-cyan-700 hover:underline dark:text-cyan-500">
              Create account
            </a>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
