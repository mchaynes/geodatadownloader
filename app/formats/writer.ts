import { saveAs } from "file-saver";
export class Writer {
  key: string;
  data: string[];
  constructor(key: string) {
    this.key = key;
    this.data = [];
  }

  async write(data: string) {
    this.data.push(data);
  }

  async save() {
    saveAs(new Blob(this.data, { type: "application/geo+json" }), this.key);
  }
}
