let activeConnector = null;

/**
 * Node Connector element used to link input elements together
 * @attribute data-source
 * @attribute data-destination
 * @example <dnod-node-connector 
 *    data-source="document.getElementById('source')"
 *    data-destination="document.getElementById('destination')"
 *    data-name="connector-1"
 *    data-connect="connector-2 connector-3"
 * ></dnod-node-connector>
 */
class NodeConnectorElement extends HTMLElement {
  /**
   * Observed Attributes
   * @private
   * @member {Array.<String>}
   */
  static get observedAttributes() {
    return ["data-name", "data-source", "data-destination", "data-connect"];
  }

  /**
   * @abstract
   */
  constructor() {
    super();

    this.connectedElements = new Set();

    this._name = "";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
          cursor: pointer;
        }
        input {
          cursor: pointer;
          display: inline-block;
          margin: 5px;
        }
      </style>
      <input type="radio" disabled>
      <slot></slot>
    `;

    this._radio = this.shadowRoot.querySelector("input");

    this._onSourceChangeBinded = this._onSourceChange.bind(this);
  }

  /**
   * Element connected to the DOM
   * @private
   */
  connectedCallback() {
    if (this.source) {
      this.source = this.source;
    }

    if (this.destination) {
      this.destination = this.destination;
    }
    
    this.addEventListener("pointerdown", this._onPointerDown);
  }

  /**
   * Element disconnected to the DOM
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("pointerdown", this._onPointerDown);
  }

  /**
   * Element attribute changed
   * @private
   * @param {string} name 
   * @param {string} oldValue 
   * @param {string} newValue 
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    name = name.replace("data-", "");

    switch (name) {
      case "source":
      case "destination":
        this[name] = new Function(`return ${newValue}`).apply(this);
        break;
      case "connect":

      case "name":
        this[name] = newValue;
        break;
    }
  }

  
  /**
   * Handler that update value when source input change 
   * @private
   * @param {Event} event 
   */
  _onSourceChange(event) {
    this.value = this.source.value;
  }

  /**
   * Pointer down handler
   * @private
   */
  _onPointerDown() {
    if (activeConnector) {
      return;
    }
    activeConnector = this;
    this._connected = true;
    this.dispatchEvent(new CustomEvent("nodeconnectorconnect", {
      bubbles: true,
      composed: true,
      detail: {
        source: this.source ? this : null,
        destination: this.destination ? this : null
      }
    }));
    window.addEventListener("pointerup", this._onWindowPointerUpBinded = this._onWindowPointerUpBinded || this._onWindowPointerUp.bind(this));
  }

  /**
   * Window pointer up handler
   * @private
   * @param {PointerEvent} event 
   */
  _onWindowPointerUp(event) {
    let connector;
    for (const element of event.path) {
      if (element instanceof NodeConnectorElement) {
        connector = element;
        break;
      }
    }

    if (connector === activeConnector) {
      return;
    }

    window.removeEventListener("pointerup", this._onWindowPointerUpBinded);

    if(!connector) {
      activeConnector.disconnect();
      activeConnector = null;
      return;
    }

    const connectorSource = activeConnector.source ? activeConnector : connector;
    const connectorDestination = connector.destination ? connector : activeConnector;

    if(connectorSource.source !== connectorDestination.destination) {
      connectorSource.connect(connectorDestination);
    } else {
      activeConnector.disconnect();
    }

    activeConnector = null;
  }

  /**
   * Connect to another connector
   * @param {NodeConnectorElement} element 
   */
  connect(element) {
    if (element instanceof NodeConnectorElement) {
      element._connected = true;
    }

    if (this.value !== undefined) {
      element.value = this.value;
    }

    this._connected = true;

    this.connectedElements.add(element);

    this.dispatchEvent(new CustomEvent("nodeconnectorconnected", {
      bubbles: true,
      composed: true,
      detail: {
        source: this,
        destination: element
      }
    }));

    element.dispatchEvent(new CustomEvent("nodeconnectorconnected", {
      bubbles: true,
      composed: true,
      detail: {
        source: this,
        destination: element
      }
    }));
  }

  /**
   * Disconnect from another connector
   * @param {NodeConnectorElement} element 
   */
  disconnect(element) {
    if (element) {
      this.connectedElements.delete(element);

      element._connected = false;
      
      element.dispatchEvent(new CustomEvent("nodeconnectordisconnected", {
        bubbles: true,
        composed: true,
        detail: {
          source: this,
          destination: element
        }
      }));
    }

    this._connected = !!this.connectedElements.size;

    this.dispatchEvent(new CustomEvent("nodeconnectordisconnected", {
      bubbles: true,
      composed: true,
      detail: {
        source: this,
        destination: element
      }
    }));
  }

  /**
   * @member {any}
   */
  get value() {
    return this._value;
  }

  set value(value) {
    if (value === this._value) {
      return;
    }
    this._value = value;

    for (const element of this.connectedElements) {
      element.value = this._value;
    }
    if (this.destination) {
      this.destination.value = this._value;
      this.destination.dispatchEvent(new Event("input", {
        bubbles: true,
      }));
      this.destination.dispatchEvent(new Event("change", {
        bubbles: true,
      }));
    }
  }

  /**
   * @member {boolean}
   * @readonly
   */
  get connected() {
    return this._radio.checked;
  }

  set _connected(value) {
    if (this.destination) {
      this.destination.disabled = value;
    }
    this._radio.checked = value;
  }

  /**
   * Source input
   * @member {HTMLInputElement}
   */
  get source() {
    return this._source;
  }

  set source(value) {
    if (this._source) {
      this._source.removeEventListener("input", this._onSourceChangeBinded);
      this._source.removeEventListener("change", this._onSourceChangeBinded);
    }
    this._source = value;
    if (!this._source) {
      return;
    }
    if (this.destination) {
      this.value = this._source.value;
    }
    this._source.addEventListener("input", this._onSourceChangeBinded);
    this._source.addEventListener("change", this._onSourceChangeBinded);
  }

  /**
   * Destination input
   * @member {HTMLInputElement}
   */
  get destination() {
    return this._destination;
  }

  set destination(value) {
    this._destination = value;
    if (this.value !== undefined) {
      this._destination.value = this.value;
    }
  }

  /**
   * Unique name of the connector
   * @member {string}
   */
  get name() {
    return this._name || this.source.name || this.destination.name;
  }
  
  set name(value) {
    this._name = value;
  }
}

window.customElements.define("dnod-node-connector", NodeConnectorElement);

export default NodeConnectorElement;