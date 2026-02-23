import { Modal, Table, Button } from "flowbite-react";
import { saveMapConfigLocal } from "../database";

type BrokenLayer = {
  url: string;
  name?: string;
  reason: string;
};

type BrokenLayersModalProps = {
  show: boolean;
  broken: BrokenLayer[];
  retryingBrokenCheck: boolean;
  onRetryCheck: () => void;
  mapConfig: any;
};

export function BrokenLayersModal({
  show,
  broken,
  retryingBrokenCheck,
  onRetryCheck,
  mapConfig,
}: BrokenLayersModalProps) {
  if (broken.length === 0) return null;

  const handleRemoveAll = () => {
    const brokenUrls = new Set(broken.map(b => b.url));
    const next = {
      ...mapConfig,
      layers: mapConfig.layers.filter((l: any) => !brokenUrls.has(l.url))
    };
    saveMapConfigLocal(next);
    window.location.reload();
  };

  return (
    <Modal
      show={show}
      size="xl"
      popup
      onClose={() => {/* block closing to avoid invalid state */}}
    >
      <Modal.Header>Some layers couldn't be loaded</Modal.Header>
      <Modal.Body>
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            One or more saved layers failed to load. They may have been removed, moved, or require authentication now.
            To keep your map stable, remove these broken layers.
          </p>
          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>URL</Table.HeadCell>
                <Table.HeadCell>Reason</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {broken.map((b) => (
                  <Table.Row key={b.url} className="bg-white dark:bg-dark-text-bg">
                    <Table.Cell className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                      {b.name ?? "—"}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-gray-600 dark:text-gray-300 break-all max-w-[360px]">
                      {b.url}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[260px]" title={b.reason}>
                      {b.reason}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onRetryCheck} disabled={retryingBrokenCheck}>
              {retryingBrokenCheck ? "Retrying…" : "Retry check"}
            </Button>
            <Button color="failure" onClick={handleRemoveAll} disabled={retryingBrokenCheck}>
              Remove all broken layers
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
