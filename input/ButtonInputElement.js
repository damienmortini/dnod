export default class ButtonInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "button";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        button {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
      <button>
        <slot></slot>
      </button>
    `;

    this._slot = this.shadowRoot.querySelector("slot");
    this._button = this.shadowRoot.querySelector("button");

    // this._button.onclick = (e) => {
    //   if (this.onclick) {
    //     this.value = this._onclick(e);
    //     this.dispatchEvent(new Event("input", {
    //       bubbles: true,
    //     }));
    //   }
    // };

    if (this.hasAttribute("value")) {
      this.value = this.defaultValue = this.getAttribute("value");
    }
    if (this.hasAttribute("name")) {
      this.name = this.getAttribute("name");
    }
    this.disabled = this.hasAttribute("disabled");
    if (this.hasAttribute("onclick")) {
      this.onclick = this.getAttribute("onclick");
    }
  }

  set name(value) {
    this._name = value;
    this._slot.textContent = value;
  }

  get name() {
    return this._name;
  }

  set value(value) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set disabled(value) {
    this._button.disabled = value;
  }

  get disabled() {
    return this._button.disabled;
  }

  set onclick(value) {
    this._button.onclick = value;
  }

  get onclick() {
    return this._button.onclick;
  }
}

window.customElements.define("dgui-input-button", ButtonInputElement);
