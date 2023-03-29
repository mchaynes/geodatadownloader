import { saveAs } from "file-saver";
export class Writer {
  key: string;
  data: string[];
  constructor(key: string) {
    this.key = key;
    this.data = [];
  }

  write(data: string) {
    this.data.push(data);
  }

  save(contentType?: string) {
    saveAs(
      new Blob(this.data, { type: contentType ?? "application/geo+json" }),
      this.key
    );
  }
}
