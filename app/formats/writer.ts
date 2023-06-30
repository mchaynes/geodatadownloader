export class Writer {
  data: string[];
  constructor() {
    this.data = [];
  }

  write(data: string) {
    this.data.push(data);
  }
}
