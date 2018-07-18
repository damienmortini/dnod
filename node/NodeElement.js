export default class NodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "enabled", "draggable", "x", "y", "width", "height"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        :host([draggable]) {
          border: 1px dotted;
          position: absolute;
          overflow: auto;
          resize: both;
        }

        :host([draggable]:hover) {
          border: 1px dashed;
        }

        :host([draggable]:focus-within) {
          border: 1px solid;
        }

        details summary {
          position: relative;
          padding: 5px;
          outline: none;
          background: lightgrey;
        }
      </style>
      <dgui-draggable-handle draggable="false" data-target="this.getRootNode().host">
        <details>
          <summary></summary>
          <slot></slot>
        </details>
      </dgui-draggable-handle>
    `;

    this._details = this.shadowRoot.querySelector("details");

    this.open = true;
  }

  connectedCallback() {
    this.draggable = true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "disabled":
        this.enabled = this[name] = newValue !== null;
        break;
      case "draggable":
        this.shadowRoot.querySelector("dgui-draggable-handle").setAttribute(name, newValue);
        break;
      default:
        this[name] = newValue;
        break;
    }
  }

  set name(value) {
    this._name = value;
    this._details.querySelector("summary").textContent = this._name;
  }

  get name() {
    return this._name;
  }

  set open(value) {
    this._details.open = value;
  }

  get open() {
    return this._details.open;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = parseFloat(value);
    this._updateBoundingRect();
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = parseFloat(value);
    this._updateBoundingRect();
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = parseFloat(value);
    this._updateBoundingRect();
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = parseFloat(value);
    this._updateBoundingRect();
  }

  _updateBoundingRect() {
    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;
    this.style.width = `${this.width}px`;
    this.style.height = `${this.height}px`;
  }

  toJSON() {
    return {
      name: this.name,
    };
  }
}

window.customElements.define("dgui-node", NodeElement);
