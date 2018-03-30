import Loader from "../node_modules/dlib/utils/Loader.js";
import GUIElement from "./GUIElement.js";
import GUINodeElement from "./GUINodeElement.js";

class GUIStaticElement extends GUIElement {
  constructor() {
    super();

    this.shadowRoot.innerHTML += `
    <style>
      :host{
        position: absolute;
        top: 0;
        left: 0;
        max-height: 100%;
        overflow: auto;
      }
    </style>
    `;
  }

  connectedCallback() {
    this.addNode({
      label: "GUI",
      name: "main"
    });
  }

  add(...parameters) {
    return this.nodes.get("main").addInput(...parameters);
  }
}

window.customElements.define("dgui-staticgui", GUIStaticElement);

const GUI = document.createElement("dgui-staticgui");
document.body.appendChild(GUI);

GUI.connect();

Loader.load("gui-data.json").then((data) => {
  Object.assign(GUI, data);
});

window.dgui = GUI;
export { GUI };