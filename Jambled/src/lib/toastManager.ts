export class ToastManager {
  elements: HTMLDivElement[];
  toastId;
  constructor() {
    this.elements = [];
    this.toastId = 0;
  }
  addToast(text: string, classes: string = "") {
    const element = document.createElement("div");
    element.textContent = text;
    element.classList.add("toast-message", ...classes.split(" "));
    document.body.append(element);
    const id = `toast-${this.toastId}`;
    element.id = id;
    setTimeout(() => {
      element.classList.add("active");
    }, 0);
    setTimeout(() => {
      element.classList.remove("active");
    }, 3000);
    setTimeout(() => {
      element.remove();
      this.elements = this.elements.filter((x) => x.id != id);
    }, 3500);
    this.elements.push(element);
    this.toastId++;
  }
}
