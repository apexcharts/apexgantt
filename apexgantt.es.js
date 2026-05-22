const noop = () => {
};
const kebabCase = (str) => str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
class ChartContext {
  constructor(containerElement, instanceId) {
    this.injectedStyles = /* @__PURE__ */ new Set();
    this.instanceId = instanceId || Math.random().toString(36).substr(2, 9);
    this.context = this.detectContext(containerElement);
    this.chartContainer = containerElement;
  }
  /**
   * Get the chart-specific container for dialogs and tooltips
   * This ensures elements are positioned relative to the specific chart
   */
  getChartContainer() {
    return this.chartContainer;
  }
  /**
   * Get container for chart-scoped elements (dialogs, tooltips)
   * These should be positioned relative to the chart, not the shadow root
   */
  getChartScopedContainer() {
    if (this.context === document) {
      return document.body || document.getElementsByTagName("body")[0];
    }
    return this.chartContainer || this.context;
  }
  /**
   * Auto-detect if element is inside Shadow DOM
   */
  detectContext(element) {
    const root = element.getRootNode();
    return root instanceof ShadowRoot ? root : document;
  }
  /**
   * Get the current context (Document or ShadowRoot)
   */
  getContext() {
    return this.context;
  }
  /**
   * Get instance ID
   */
  getInstanceId() {
    return this.instanceId;
  }
  /**
   * Check if we're operating in Shadow DOM
   */
  isShadowDOM() {
    return this.context instanceof ShadowRoot;
  }
  // DOM Creation Methods
  createElement(tagName) {
    return document.createElement(tagName);
  }
  createElementNS(namespace, qualifiedName) {
    return document.createElementNS(namespace, qualifiedName);
  }
  createTextNode(data) {
    return document.createTextNode(data);
  }
  // DOM Query Methods
  getElementById(id) {
    if (this.context === document) {
      return document.getElementById(id);
    }
    return this.context.querySelector(`#${id}`);
  }
  getElementsByClassName(className) {
    if (this.context === document) {
      return document.getElementsByClassName(className);
    }
    const nodeList = this.context.querySelectorAll(`.${className}`);
    const elements = Array.from(nodeList);
    return {
      item: (index) => elements[index] || null,
      get length() {
        return elements.length;
      },
      [Symbol.iterator]: () => elements[Symbol.iterator](),
      ...Object.fromEntries(elements.map((el, i) => [i, el]))
    };
  }
  querySelector(selector) {
    return this.context.querySelector(selector);
  }
  querySelectorAll(selector) {
    return this.context.querySelectorAll(selector);
  }
  // Container Methods
  getAppendContainer() {
    if (this.context === document) {
      return document.body || document.getElementsByTagName("body")[0];
    }
    return this.context;
  }
  /**
   * Get the bounding rect of the chart container
   * Useful for positioning dialogs within chart bounds
   */
  getChartBounds() {
    var _a;
    return ((_a = this.chartContainer) == null ? void 0 : _a.getBoundingClientRect()) || new DOMRect();
  }
  getBody() {
    if (this.context === document) {
      return document.body || document.getElementsByTagName("body")[0];
    }
    const shadowRoot = this.context;
    return shadowRoot.host;
  }
  // Event Methods
  dispatchEvent(event) {
    if (this.context === document) {
      document.dispatchEvent(event);
    } else {
      this.context.dispatchEvent(event);
    }
  }
  addEventListener(type, listener, options) {
    if (this.context === document) {
      document.addEventListener(type, listener, options);
    } else {
      if (type === "mousemove" || type === "mouseup" || type === "keydown") {
        document.addEventListener(type, listener, options);
      } else {
        this.context.addEventListener(type, listener, options);
      }
    }
  }
  removeEventListener(type, listener, options) {
    if (this.context === document) {
      document.removeEventListener(type, listener, options);
    } else {
      if (type === "mousemove" || type === "mouseup" || type === "keydown") {
        document.removeEventListener(type, listener, options);
      } else {
        this.context.removeEventListener(type, listener, options);
      }
    }
  }
  // Style Management
  injectStyles(styleContent, styleId, options = {}) {
    const { force = false, priority = "normal" } = options;
    if (!force && this.injectedStyles.has(styleId)) {
      return;
    }
    if (force) {
      const existingStyle2 = this.context.querySelector(`#${styleId}`);
      if (existingStyle2) {
        existingStyle2.remove();
        this.injectedStyles.delete(styleId);
      }
    }
    const existingStyle = this.context.querySelector(`#${styleId}`);
    if (existingStyle && !force) {
      this.injectedStyles.add(styleId);
      return;
    }
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = styleContent;
    if (priority !== "normal") {
      style.setAttribute("data-priority", priority);
    }
    if (this.context === document) {
      document.head.appendChild(style);
    } else {
      const shadowRoot = this.context;
      if (priority === "high") {
        shadowRoot.insertBefore(style, shadowRoot.firstChild);
      } else {
        shadowRoot.appendChild(style);
      }
    }
    this.injectedStyles.add(styleId);
  }
  injectStylesheets(stylesheets) {
    stylesheets.forEach(({ content, id, options }) => {
      this.injectStyles(content, id, options);
    });
  }
  hasInjectedStyles(styleId) {
    return this.injectedStyles.has(styleId);
  }
  removeStyles(styleId) {
    const style = this.context.querySelector(`#${styleId}`);
    if (style) {
      style.remove();
      this.injectedStyles.delete(styleId);
    }
  }
  removeAllStyles() {
    this.injectedStyles.forEach((styleId) => {
      const style = this.context.querySelector(`#${styleId}`);
      if (style) {
        style.remove();
      }
    });
    this.injectedStyles.clear();
  }
  getInjectedStyleIds() {
    return Array.from(this.injectedStyles);
  }
  // Active element getter with context awareness
  getActiveElement() {
    if (this.context === document) {
      return document.activeElement;
    }
    const shadowRoot = this.context;
    return shadowRoot.activeElement || document.activeElement;
  }
  destroy() {
    this.removeAllStyles();
    this.injectedStyles.clear();
  }
}
class BaseChart {
  constructor(element, instanceId) {
    if (!element) {
      throw new Error("Container element is required");
    }
    this.element = element;
    this.chartContext = new ChartContext(element, instanceId);
  }
  /**
   * Get the chart context instance
   */
  getContext() {
    return this.chartContext;
  }
  /**
   * Check if we're in Shadow DOM
   */
  isShadowDOM() {
    return this.chartContext.isShadowDOM();
  }
  /**
   * Get tooltip container appropriate for current DOM context
   */
  getTooltipContainer() {
    return this.chartContext.getAppendContainer();
  }
  /**
   * Inject styles into appropriate context
   */
  injectStyles(styles, styleId) {
    this.chartContext.injectStyles(styles, styleId);
  }
  /**
   * Create element in current context
   */
  createElement(tagName) {
    return this.chartContext.createElement(tagName);
  }
  /**
   * Query selector in current context
   */
  querySelector(selector) {
    return this.chartContext.querySelector(selector);
  }
  /**
   * Add event listener in current context
   */
  addEventListener(type, listener, options) {
    this.chartContext.addEventListener(type, listener, options);
  }
  /**
   * Remove event listener in current context
   */
  removeEventListener(type, listener, options) {
    this.chartContext.removeEventListener(type, listener, options);
  }
  /**
   * Dispatch event in current context
   */
  dispatchEvent(event) {
    this.chartContext.dispatchEvent(event);
  }
  /**
   * Clean up method
   */
  destroy() {
    this.chartContext.destroy();
  }
  /**
   * Get instance ID
   */
  getInstanceId() {
    return this.chartContext.getInstanceId();
  }
}
const cons = globalThis.console;
function logError(message) {
  cons.error(message);
}
const _LicenseManager = class _LicenseManager {
  /**
   * Decode license data from encoded string
   * This is a simple base64 + JSON approach - you can make it more sophisticated
   */
  static decodeLicenseData(encodedData) {
    try {
      const decodedString = window.atob(encodedData);
      const data = JSON.parse(decodedString);
      if (!data.issueDate || !data.expiryDate || !data.plan) {
        return null;
      }
      return {
        domains: Array.isArray(data.domains) ? data.domains : void 0,
        expiryDate: data.expiryDate,
        issueDate: data.issueDate,
        plan: data.plan,
        valid: true
      };
    } catch {
      return null;
    }
  }
  /**
   * Generate a license key (for your internal use)
   * You would use this on your server/admin panel to generate keys for customers
   */
  static generateLicenseKey(issueDate, expiryDate, plan = "standard", domains) {
    const licenseData = {
      expiryDate,
      issueDate,
      plan
    };
    if (domains && domains.length > 0) {
      licenseData["domains"] = domains;
    }
    const encodedData = window.btoa(JSON.stringify(licenseData));
    return `APEX-${encodedData}`;
  }
  /**
   * Get current license validation result
   */
  static getLicenseStatus() {
    if (!this.licenseKey) {
      return { expired: false, valid: false };
    }
    if (!this.validationResult) {
      this.validationResult = this.validateLicense(this.licenseKey);
    }
    return this.validationResult;
  }
  /**
   * Check if current license is valid
   */
  static isLicenseValid() {
    if (!this.licenseKey) {
      return false;
    }
    if (!this.validationResult) {
      this.validationResult = this.validateLicense(this.licenseKey);
    }
    return this.validationResult.valid;
  }
  /**
   * Set the global license key
   */
  static setLicense(key) {
    this.licenseKey = key;
    this.validationResult = this.validateLicense(key);
    if (!this.validationResult.valid) {
      logError(`[Apex] ${this.validationResult.message}`);
    }
  }
  /**
   * Validate license key format and content
   */
  static validateLicense(key) {
    try {
      if (!key.startsWith("APEX-")) {
        return {
          expired: false,
          message: 'Invalid license key format. License key must start with "APEX-".',
          valid: false
        };
      }
      const separatorIndex = key.indexOf("-");
      const encodedData = separatorIndex !== -1 ? key.slice(separatorIndex + 1) : "";
      if (!encodedData) {
        return {
          expired: false,
          message: "Invalid license key format. Expected format: APEX-{encoded-data}.",
          valid: false
        };
      }
      const licenseData = this.decodeLicenseData(encodedData);
      if (!licenseData) {
        return {
          expired: false,
          message: "Invalid license key. Unable to decode license data.",
          valid: false
        };
      }
      const now = /* @__PURE__ */ new Date();
      const expiryDate = new Date(licenseData.expiryDate);
      if (expiryDate < now) {
        return {
          data: licenseData,
          expired: true,
          message: `License expired on ${licenseData.expiryDate}. Please renew your license.`,
          valid: false
        };
      }
      if (licenseData.domains && licenseData.domains.length > 0) {
        const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";
        const isDomainAllowed = licenseData.domains.some(
          (domain) => currentHostname === domain || currentHostname.endsWith(`.${domain}`)
        );
        if (!isDomainAllowed) {
          return {
            data: licenseData,
            expired: false,
            message: `License is not valid for this domain (${currentHostname}). Allowed domains: ${licenseData.domains.join(", ")}.`,
            valid: false
          };
        }
      }
      return {
        data: licenseData,
        expired: false,
        valid: true
      };
    } catch {
      return {
        expired: false,
        message: "Invalid license key format or corrupted data.",
        valid: false
      };
    }
  }
};
_LicenseManager.licenseKey = null;
_LicenseManager.validationResult = null;
let LicenseManager = _LicenseManager;
const ToolbarStyle = `
  #toolbar {
    display: flex;
    gap: 2px;
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 100;
    user-select: none;
    background: var(--toolbar-bg-color, rgba(255, 255, 255, 0.92));
    border: 1px solid var(--toolbar-border-color, rgba(0, 0, 0, 0.08));
    border-radius: 10px;
    padding: 4px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .toolbar-item {
    align-items: center;
    background-color: transparent;
    border: none;
    border-radius: 6px;
    color: var(--toolbar-icon-color, #444);
    cursor: pointer;
    display: flex;
    height: 30px;
    justify-content: center;
    width: 30px;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    position: relative;
    flex-shrink: 0;
  }

  .toolbar-item:hover {
    background-color: var(--toolbar-hover-bg-color, rgba(0, 0, 0, 0.06));
    color: var(--toolbar-icon-hover-color, #111);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .toolbar-item:active {
    transform: translateY(0);
    box-shadow: none;
    background-color: var(--toolbar-active-bg-color, rgba(0, 0, 0, 0.1));
  }

  .toolbar-item:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--button-bg-color, #0066cc);
  }

  .toolbar-item svg {
    width: 15px;
    height: 15px;
    pointer-events: none;
    flex-shrink: 0;
  }

  .toolbar-item[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Tooltip */
  .toolbar-item::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--tooltip-bg-color, rgba(30, 30, 30, 0.92));
    color: var(--tooltip-text-color, #fff);
    padding: 5px 9px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 1000;
    letter-spacing: 0.01em;
  }

  .toolbar-item::before {
    content: '';
    position: absolute;
    bottom: calc(100% + 3px);
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--tooltip-bg-color, rgba(30, 30, 30, 0.92));
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 1000;
  }

  .toolbar-item:hover::after,
  .toolbar-item:hover::before {
    opacity: 1;
  }

  /* Shadow DOM specific adjustments */
  :host #toolbar {
    display: flex;
    gap: 2px;
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 100;
  }
`;
const _Watermark = class _Watermark {
  /**
   * Create a repeating diagonal watermark pattern
   */
  static createWatermarkPattern() {
    const text = this.WATERMARK_TEXT;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="middle" 
          text-anchor="middle"
          font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
          font-size="18"
          font-weight="600"
          fill="rgba(134, 134, 134, 0.1)"
          transform="rotate(-35, 100, 60)"
        >${text}</text>
      </svg>
    `;
    return `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}")`;
  }
  /**
   * Add watermark to a container element
   */
  static add(container) {
    this.remove(container);
    const watermark = document.createElement("div");
    watermark.setAttribute(this.WATERMARK_ATTR, "");
    Object.assign(watermark.style, {
      backgroundImage: this.createWatermarkPattern(),
      backgroundRepeat: "repeat",
      bottom: "0",
      left: "0",
      msUserSelect: "none",
      pointerEvents: "none",
      position: "absolute",
      right: "0",
      top: "0",
      userSelect: "none",
      webkitUserSelect: "none",
      zIndex: "10000"
    });
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    container.appendChild(watermark);
  }
  /**
   * Check if watermark exists in container
   */
  static exists(container) {
    return !!container.querySelector(`[${this.WATERMARK_ATTR}]`);
  }
  /**
   * Remove watermark from a container element
   */
  static remove(container) {
    const existingWatermark = container.querySelector(`[${this.WATERMARK_ATTR}]`);
    if (existingWatermark) {
      existingWatermark.remove();
    }
  }
};
_Watermark.WATERMARK_ATTR = "data-apexcharts-watermark";
_Watermark.WATERMARK_TEXT = "APEXCHARTS";
let Watermark = _Watermark;
function getParentElement(element) {
  const rootNode = element.getRootNode();
  if (rootNode instanceof ShadowRoot) {
    return rootNode.host;
  }
  return element.parentElement;
}
function getCumulativeTransform(element) {
  let scaleX = 1;
  let scaleY = 1;
  let translateX = 0;
  let translateY = 0;
  let currentElement = element.parentElement;
  while (currentElement && currentElement !== document.body && currentElement !== document.documentElement) {
    const style = window.getComputedStyle(currentElement);
    const cssScale = style.scale;
    if (cssScale && cssScale !== "none") {
      const scaleValues = cssScale.split(" ").map(parseFloat);
      if (scaleValues.length === 1) {
        scaleX *= scaleValues[0];
        scaleY *= scaleValues[0];
      } else if (scaleValues.length >= 2) {
        scaleX *= scaleValues[0];
        scaleY *= scaleValues[1];
      }
    }
    const transform = style.transform;
    if (transform && transform !== "none") {
      try {
        const matrix = new DOMMatrix(transform);
        scaleX *= matrix.a;
        scaleY *= matrix.d;
        translateX += matrix.e;
        translateY += matrix.f;
      } catch {
      }
    }
    currentElement = getParentElement(currentElement);
  }
  return { scaleX, scaleY, translateX, translateY };
}
function getElementTransform(element) {
  const style = window.getComputedStyle(element);
  let scaleX = 1;
  let scaleY = 1;
  let translateX = 0;
  let translateY = 0;
  let rotation = 0;
  const cssScale = style.scale;
  if (cssScale && cssScale !== "none") {
    const scaleValues = cssScale.split(" ").map(parseFloat);
    if (scaleValues.length === 1) {
      scaleX = scaleValues[0];
      scaleY = scaleValues[0];
    } else if (scaleValues.length >= 2) {
      scaleX = scaleValues[0];
      scaleY = scaleValues[1];
    }
  }
  const transform = style.transform;
  if (transform && transform !== "none") {
    try {
      const matrix = new DOMMatrix(transform);
      scaleX *= matrix.a;
      scaleY *= matrix.d;
      translateX = matrix.e;
      translateY = matrix.f;
      rotation = Math.atan2(matrix.b, matrix.a);
    } catch {
    }
  }
  return { scaleX, scaleY, translateX, translateY, rotation };
}
function getTransformAwareBoundingRect(element, relativeTo) {
  const elementRect = element.getBoundingClientRect();
  const relativeRect = relativeTo.getBoundingClientRect();
  const containerTransform = getCumulativeTransform(relativeTo);
  const elementOwnTransform = getElementTransform(element);
  const scaleX = containerTransform.scaleX || 1;
  const scaleY = containerTransform.scaleY || 1;
  const left = (elementRect.left - relativeRect.left) / scaleX;
  const top = (elementRect.top - relativeRect.top) / scaleY;
  const width = elementRect.width / scaleX;
  const height = elementRect.height / scaleY;
  if (Math.abs(elementOwnTransform.rotation) > 0.01) {
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    return {
      left: centerX,
      right: centerX,
      top: centerY,
      bottom: centerY,
      width: 0,
      height: 0
    };
  }
  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    width,
    height
  };
}
const ARIA_HIDDEN = "aria-hidden";
const getTooltip = (context, tooltipId = "apex-tooltip-container") => {
  let tooltipElement = context.getElementById(tooltipId);
  if (!tooltipElement) {
    tooltipElement = context.createElement("div");
    tooltipElement.id = tooltipId;
    tooltipElement.setAttribute("role", "tooltip");
    tooltipElement.setAttribute(ARIA_HIDDEN, "true");
    const appendContainer = context.getAppendContainer();
    appendContainer.appendChild(tooltipElement);
  }
  return tooltipElement;
};
const calculateCursorFollowingTooltip = (mouseX, mouseY, tooltipWidth = 300, tooltipHeight = 120, offsetX = 20, offsetY = 20) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  let x = mouseX + offsetX + scrollX;
  let y = mouseY + offsetY + scrollY;
  if (mouseX + offsetX + tooltipWidth > viewportWidth) {
    x = mouseX - tooltipWidth - offsetX + scrollX;
  }
  if (mouseY + offsetY + tooltipHeight > viewportHeight) {
    y = mouseY - tooltipHeight - offsetY + scrollY;
  }
  x = Math.max(scrollX + 5, x);
  y = Math.max(scrollY + 5, y);
  return { x, y };
};
const generateStyles = (styleObject = {}) => {
  const styles = [];
  for (const styleKey in styleObject) {
    const styleString = `${kebabCase(styleKey)}: ${styleObject[styleKey]};`;
    styles.push(styleString);
  }
  return styles.join(" ");
};
function createBox(context, { className = "", content, style = {} } = {}) {
  const box = createElement(context, "div", { className, innerHTML: content || "" });
  box.setAttribute("style", generateStyles(style));
  return box;
}
function createElement(context, name, options = {}) {
  const element = context.createElement(name);
  return Object.assign(element, options);
}
function adjustColorBrightness(hex, adjust) {
  if (!hex)
    return "#000000";
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex.split("").map((c2) => c2 + c2).join("");
  const num = parseInt(hex, 16);
  const r = (num >> 16 & 255) / 255;
  const g = (num >> 8 & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r)
      h = ((g - b) / delta % 6 + 6) % 6;
    else if (max === g)
      h = (b - r) / delta + 2;
    else
      h = (r - g) / delta + 4;
    h *= 60;
  }
  const newH = ((h + (adjust.h ?? 0)) % 360 + 360) % 360;
  const newS = Math.min(1, Math.max(0, s + (adjust.s ?? 0) / 100));
  const newL = Math.min(1, Math.max(0, l + (adjust.l ?? 0) / 100));
  const c = (1 - Math.abs(2 * newL - 1)) * newS;
  const x = c * (1 - Math.abs(newH / 60 % 2 - 1));
  const m = newL - c / 2;
  let r2 = 0, g2 = 0, b2 = 0;
  if (newH < 60) {
    r2 = c;
    g2 = x;
  } else if (newH < 120) {
    r2 = x;
    g2 = c;
  } else if (newH < 180) {
    g2 = c;
    b2 = x;
  } else if (newH < 240) {
    g2 = x;
    b2 = c;
  } else if (newH < 300) {
    r2 = x;
    b2 = c;
  } else {
    r2 = c;
    b2 = x;
  }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dayjs_min = { exports: {} };
(function(module, exports) {
  !function(t, e) {
    module.exports = e();
  }(commonjsGlobal, function() {
    var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
      var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
      return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
    } }, m = function(t2, e2, n2) {
      var r2 = String(t2);
      return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
    }, v = { s: m, z: function(t2) {
      var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
      return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
    }, m: function t2(e2, n2) {
      if (e2.date() < n2.date())
        return -t2(n2, e2);
      var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
      return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
    }, a: function(t2) {
      return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
    }, p: function(t2) {
      return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
    }, u: function(t2) {
      return void 0 === t2;
    } }, g = "en", D = {};
    D[g] = M;
    var p = "$isDayjsObject", S = function(t2) {
      return t2 instanceof _ || !(!t2 || !t2[p]);
    }, w = function t2(e2, n2, r2) {
      var i2;
      if (!e2)
        return g;
      if ("string" == typeof e2) {
        var s2 = e2.toLowerCase();
        D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
        var u2 = e2.split("-");
        if (!i2 && u2.length > 1)
          return t2(u2[0]);
      } else {
        var a2 = e2.name;
        D[a2] = e2, i2 = a2;
      }
      return !r2 && i2 && (g = i2), i2 || !r2 && g;
    }, O = function(t2, e2) {
      if (S(t2))
        return t2.clone();
      var n2 = "object" == typeof e2 ? e2 : {};
      return n2.date = t2, n2.args = arguments, new _(n2);
    }, b = v;
    b.l = w, b.i = S, b.w = function(t2, e2) {
      return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
    };
    var _ = function() {
      function M2(t2) {
        this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
      }
      var m2 = M2.prototype;
      return m2.parse = function(t2) {
        this.$d = function(t3) {
          var e2 = t3.date, n2 = t3.utc;
          if (null === e2)
            return /* @__PURE__ */ new Date(NaN);
          if (b.u(e2))
            return /* @__PURE__ */ new Date();
          if (e2 instanceof Date)
            return new Date(e2);
          if ("string" == typeof e2 && !/Z$/i.test(e2)) {
            var r2 = e2.match($);
            if (r2) {
              var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
              return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
            }
          }
          return new Date(e2);
        }(t2), this.init();
      }, m2.init = function() {
        var t2 = this.$d;
        this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
      }, m2.$utils = function() {
        return b;
      }, m2.isValid = function() {
        return !(this.$d.toString() === l);
      }, m2.isSame = function(t2, e2) {
        var n2 = O(t2);
        return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
      }, m2.isAfter = function(t2, e2) {
        return O(t2) < this.startOf(e2);
      }, m2.isBefore = function(t2, e2) {
        return this.endOf(e2) < O(t2);
      }, m2.$g = function(t2, e2, n2) {
        return b.u(t2) ? this[e2] : this.set(n2, t2);
      }, m2.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, m2.valueOf = function() {
        return this.$d.getTime();
      }, m2.startOf = function(t2, e2) {
        var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
          var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
          return r2 ? i2 : i2.endOf(a);
        }, $2 = function(t3, e3) {
          return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
        }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
        switch (f2) {
          case h:
            return r2 ? l2(1, 0) : l2(31, 11);
          case c:
            return r2 ? l2(1, M3) : l2(0, M3 + 1);
          case o:
            var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
            return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
          case a:
          case d:
            return $2(v2 + "Hours", 0);
          case u:
            return $2(v2 + "Minutes", 1);
          case s:
            return $2(v2 + "Seconds", 2);
          case i:
            return $2(v2 + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, m2.endOf = function(t2) {
        return this.startOf(t2, false);
      }, m2.$set = function(t2, e2) {
        var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
        if (o2 === c || o2 === h) {
          var y2 = this.clone().set(d, 1);
          y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
        } else
          l2 && this.$d[l2]($2);
        return this.init(), this;
      }, m2.set = function(t2, e2) {
        return this.clone().$set(t2, e2);
      }, m2.get = function(t2) {
        return this[b.p(t2)]();
      }, m2.add = function(r2, f2) {
        var d2, l2 = this;
        r2 = Number(r2);
        var $2 = b.p(f2), y2 = function(t2) {
          var e2 = O(l2);
          return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
        };
        if ($2 === c)
          return this.set(c, this.$M + r2);
        if ($2 === h)
          return this.set(h, this.$y + r2);
        if ($2 === a)
          return y2(1);
        if ($2 === o)
          return y2(7);
        var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
        return b.w(m3, this);
      }, m2.subtract = function(t2, e2) {
        return this.add(-1 * t2, e2);
      }, m2.format = function(t2) {
        var e2 = this, n2 = this.$locale();
        if (!this.isValid())
          return n2.invalidDate || l;
        var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
          return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
        }, d2 = function(t3) {
          return b.s(s2 % 12 || 12, t3, "0");
        }, $2 = f2 || function(t3, e3, n3) {
          var r3 = t3 < 12 ? "AM" : "PM";
          return n3 ? r3.toLowerCase() : r3;
        };
        return r2.replace(y, function(t3, r3) {
          return r3 || function(t4) {
            switch (t4) {
              case "YY":
                return String(e2.$y).slice(-2);
              case "YYYY":
                return b.s(e2.$y, 4, "0");
              case "M":
                return a2 + 1;
              case "MM":
                return b.s(a2 + 1, 2, "0");
              case "MMM":
                return h2(n2.monthsShort, a2, c2, 3);
              case "MMMM":
                return h2(c2, a2);
              case "D":
                return e2.$D;
              case "DD":
                return b.s(e2.$D, 2, "0");
              case "d":
                return String(e2.$W);
              case "dd":
                return h2(n2.weekdaysMin, e2.$W, o2, 2);
              case "ddd":
                return h2(n2.weekdaysShort, e2.$W, o2, 3);
              case "dddd":
                return o2[e2.$W];
              case "H":
                return String(s2);
              case "HH":
                return b.s(s2, 2, "0");
              case "h":
                return d2(1);
              case "hh":
                return d2(2);
              case "a":
                return $2(s2, u2, true);
              case "A":
                return $2(s2, u2, false);
              case "m":
                return String(u2);
              case "mm":
                return b.s(u2, 2, "0");
              case "s":
                return String(e2.$s);
              case "ss":
                return b.s(e2.$s, 2, "0");
              case "SSS":
                return b.s(e2.$ms, 3, "0");
              case "Z":
                return i2;
            }
            return null;
          }(t3) || i2.replace(":", "");
        });
      }, m2.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, m2.diff = function(r2, d2, l2) {
        var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
          return b.m(y2, m3);
        };
        switch (M3) {
          case h:
            $2 = D2() / 12;
            break;
          case c:
            $2 = D2();
            break;
          case f:
            $2 = D2() / 3;
            break;
          case o:
            $2 = (g2 - v2) / 6048e5;
            break;
          case a:
            $2 = (g2 - v2) / 864e5;
            break;
          case u:
            $2 = g2 / n;
            break;
          case s:
            $2 = g2 / e;
            break;
          case i:
            $2 = g2 / t;
            break;
          default:
            $2 = g2;
        }
        return l2 ? $2 : b.a($2);
      }, m2.daysInMonth = function() {
        return this.endOf(c).$D;
      }, m2.$locale = function() {
        return D[this.$L];
      }, m2.locale = function(t2, e2) {
        if (!t2)
          return this.$L;
        var n2 = this.clone(), r2 = w(t2, e2, true);
        return r2 && (n2.$L = r2), n2;
      }, m2.clone = function() {
        return b.w(this.$d, this);
      }, m2.toDate = function() {
        return new Date(this.valueOf());
      }, m2.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, m2.toISOString = function() {
        return this.$d.toISOString();
      }, m2.toString = function() {
        return this.$d.toUTCString();
      }, M2;
    }(), k = _.prototype;
    return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
      k[t2[1]] = function(e2) {
        return this.$g(e2, t2[0], t2[1]);
      };
    }), O.extend = function(t2, e2) {
      return t2.$i || (t2(e2, _, O), t2.$i = true), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
      return O(1e3 * t2);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
  });
})(dayjs_min);
var dayjs_minExports = dayjs_min.exports;
const dayjs = /* @__PURE__ */ getDefaultExportFromCjs(dayjs_minExports);
var isSameOrBefore$1 = { exports: {} };
(function(module, exports) {
  !function(e, i) {
    module.exports = i();
  }(commonjsGlobal, function() {
    return function(e, i) {
      i.prototype.isSameOrBefore = function(e2, i2) {
        return this.isSame(e2, i2) || this.isBefore(e2, i2);
      };
    };
  });
})(isSameOrBefore$1);
var isSameOrBeforeExports = isSameOrBefore$1.exports;
const isSameOrBefore = /* @__PURE__ */ getDefaultExportFromCjs(isSameOrBeforeExports);
var minMax$1 = { exports: {} };
(function(module, exports) {
  !function(e, n) {
    module.exports = n();
  }(commonjsGlobal, function() {
    return function(e, n, t) {
      var i = function(e2, n2) {
        if (!n2 || !n2.length || 1 === n2.length && !n2[0] || 1 === n2.length && Array.isArray(n2[0]) && !n2[0].length)
          return null;
        var t2;
        1 === n2.length && n2[0].length > 0 && (n2 = n2[0]);
        t2 = (n2 = n2.filter(function(e3) {
          return e3;
        }))[0];
        for (var i2 = 1; i2 < n2.length; i2 += 1)
          n2[i2].isValid() && !n2[i2][e2](t2) || (t2 = n2[i2]);
        return t2;
      };
      t.max = function() {
        var e2 = [].slice.call(arguments, 0);
        return i("isAfter", e2);
      }, t.min = function() {
        var e2 = [].slice.call(arguments, 0);
        return i("isBefore", e2);
      };
    };
  });
})(minMax$1);
var minMaxExports = minMax$1.exports;
const minMax = /* @__PURE__ */ getDefaultExportFromCjs(minMaxExports);
var quarterOfYear$1 = { exports: {} };
(function(module, exports) {
  !function(t, n) {
    module.exports = n();
  }(commonjsGlobal, function() {
    var t = "month", n = "quarter";
    return function(e, i) {
      var r = i.prototype;
      r.quarter = function(t2) {
        return this.$utils().u(t2) ? Math.ceil((this.month() + 1) / 3) : this.month(this.month() % 3 + 3 * (t2 - 1));
      };
      var s = r.add;
      r.add = function(e2, i2) {
        return e2 = Number(e2), this.$utils().p(i2) === n ? this.add(3 * e2, t) : s.bind(this)(e2, i2);
      };
      var u = r.startOf;
      r.startOf = function(e2, i2) {
        var r2 = this.$utils(), s2 = !!r2.u(i2) || i2;
        if (r2.p(e2) === n) {
          var o = this.quarter() - 1;
          return s2 ? this.month(3 * o).startOf(t).startOf("day") : this.month(3 * o + 2).endOf(t).endOf("day");
        }
        return u.bind(this)(e2, i2);
      };
    };
  });
})(quarterOfYear$1);
var quarterOfYearExports = quarterOfYear$1.exports;
const quarterOfYear = /* @__PURE__ */ getDefaultExportFromCjs(quarterOfYearExports);
var weekday$1 = { exports: {} };
(function(module, exports) {
  !function(e, t) {
    module.exports = t();
  }(commonjsGlobal, function() {
    return function(e, t) {
      t.prototype.weekday = function(e2) {
        var t2 = this.$locale().weekStart || 0, i = this.$W, n = (i < t2 ? i + 7 : i) - t2;
        return this.$utils().u(e2) ? n : this.subtract(n, "day").add(e2, "day");
      };
    };
  });
})(weekday$1);
var weekdayExports = weekday$1.exports;
const weekday = /* @__PURE__ */ getDefaultExportFromCjs(weekdayExports);
var weekOfYear$1 = { exports: {} };
(function(module, exports) {
  !function(e, t) {
    module.exports = t();
  }(commonjsGlobal, function() {
    var e = "week", t = "year";
    return function(i, n, r) {
      var f = n.prototype;
      f.week = function(i2) {
        if (void 0 === i2 && (i2 = null), null !== i2)
          return this.add(7 * (i2 - this.week()), "day");
        var n2 = this.$locale().yearStart || 1;
        if (11 === this.month() && this.date() > 25) {
          var f2 = r(this).startOf(t).add(1, t).date(n2), s = r(this).endOf(e);
          if (f2.isBefore(s))
            return 1;
        }
        var a = r(this).startOf(t).date(n2).startOf(e).subtract(1, "millisecond"), o = this.diff(a, e, true);
        return o < 0 ? r(this).startOf("week").week() : Math.ceil(o);
      }, f.weeks = function(e2) {
        return void 0 === e2 && (e2 = null), this.week(e2);
      };
    };
  });
})(weekOfYear$1);
var weekOfYearExports = weekOfYear$1.exports;
const weekOfYear = /* @__PURE__ */ getDefaultExportFromCjs(weekOfYearExports);
const nativeConsole = globalThis.console;
const logger = {
  warn(...args) {
    nativeConsole.warn(...args);
  },
  error(...args) {
    nativeConsole.error(...args);
  }
};
class ColumnRenderManager {
  constructor() {
    this.cleanups = /* @__PURE__ */ new Map();
    this.observer = null;
  }
  /**
   * Run a custom renderer for a cell and track any returned cleanup.
   * Idempotent: calling again for the same cell runs the prior cleanup first.
   */
  dispatch(renderer, ctx, el) {
    this.cleanupCell(el);
    let result;
    try {
      result = renderer(ctx, el);
    } catch (error) {
      logger.error("Column renderer threw:", error);
      return;
    }
    if (typeof result === "string") {
      el.innerHTML = result;
    } else if (typeof result === "function") {
      this.cleanups.set(el, result);
    }
  }
  /**
   * Begin watching the given root element for removed nodes. When a node
   * is removed, any tracked cleanups for cells inside it are invoked.
   */
  observe(root) {
    this.disconnect();
    if (typeof MutationObserver === "undefined")
      return;
    this.observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.removedNodes.forEach((n) => {
          if (n instanceof HTMLElement)
            this.cleanupSubtree(n);
        });
      }
    });
    this.observer.observe(root, { childList: true, subtree: true });
  }
  /** Stop the MutationObserver. Does not run cleanups. */
  disconnect() {
    var _a;
    (_a = this.observer) == null ? void 0 : _a.disconnect();
    this.observer = null;
  }
  /**
   * Run all tracked cleanups synchronously and clear state, but keep the
   * observer attached. Call before any operation that wholesale replaces the
   * task-list DOM (full re-render) so cleanups don't depend on the
   * MutationObserver microtask firing.
   */
  flushCleanups() {
    const fns = Array.from(this.cleanups.values());
    this.cleanups.clear();
    fns.forEach((fn) => this.invokeCleanup(fn));
  }
  /** Run all tracked cleanups and clear state. Call from `gantt.destroy()`. */
  destroy() {
    this.disconnect();
    this.flushCleanups();
  }
  /** Run cleanup for a single cell (if any) and stop tracking it. */
  cleanupCell(el) {
    const fn = this.cleanups.get(el);
    if (!fn)
      return;
    this.cleanups.delete(el);
    this.invokeCleanup(fn);
  }
  /** Walk the subtree of `root` and clean up all tracked cells inside it. */
  cleanupSubtree(root) {
    if (this.cleanups.size === 0)
      return;
    const toClean = [];
    this.cleanups.forEach((_fn, el) => {
      if (root === el || root.contains(el))
        toClean.push(el);
    });
    toClean.forEach((el) => this.cleanupCell(el));
  }
  invokeCleanup(fn) {
    try {
      fn();
    } catch (error) {
      logger.error("Column renderer cleanup threw:", error);
    }
  }
}
function resolveBarLabelLeadingPadding(config) {
  if (typeof config.leadingPadding === "number" && config.leadingPadding >= 0) {
    return config.leadingPadding;
  }
  return config.position === "left" ? 120 : 0;
}
function resolveBarLabelPosition(config, task, barWidthPx, fontSize) {
  const position = config.position ?? "right";
  if (position !== "auto")
    return position;
  if (config.render)
    return "right";
  const field = config.field ?? "name";
  const value = task[field];
  if (value == null)
    return "inside";
  const text = String(value);
  const fontPx = parseFloat(fontSize);
  const charWidth = (Number.isFinite(fontPx) ? fontPx : 14) * 0.55;
  const estimated = text.length * charWidth;
  return estimated + 12 > barWidthPx ? "right" : "inside";
}
function applyBarLabelContent(label, config, task) {
  if (config.render) {
    const result = config.render(task);
    if (result == null) {
      const field2 = config.field ?? "name";
      label.textContent = String(task[field2] ?? "");
      return;
    }
    if (typeof result === "string") {
      label.innerHTML = result;
    } else {
      label.replaceChildren(result);
    }
    return;
  }
  const field = config.field ?? "name";
  label.textContent = String(task[field] ?? "");
}
function getBarElement(context, taskId) {
  const chartInstanceId = context.getInstanceId();
  const selector = `.bar-container .bar-timeline[data-taskid="${taskId}"][data-chart-instance="${chartInstanceId}"]`;
  const element = context.querySelector(selector);
  if (!element) {
    logger.warn(`[${chartInstanceId}] Bar element not found for task: ${taskId}`);
  }
  return element;
}
function getBarRowElement(context, taskId) {
  const chartInstanceId = context.getInstanceId();
  const selector = `.timeline-body .timeline-data-row[data-taskid="${taskId}"][data-chart-instance="${chartInstanceId}"]`;
  const element = context.querySelector(selector);
  if (!element) {
    logger.warn(`[${chartInstanceId}] Bar row element not found for task: ${taskId}`);
  }
  return element;
}
const GanttEvents = {
  /**
   * emits when a task is being updated (before completion)
   */
  TASK_UPDATE: "taskUpdate",
  /**
   * emits when form validation fails
   */
  TASK_VALIDATION_ERROR: "taskValidationError",
  /**
   * emits after a task update completes successfully
   */
  TASK_UPDATE_SUCCESS: "taskUpdateSuccess",
  /**
   * emits when a task update fails
   */
  TASK_UPDATE_ERROR: "taskUpdateError",
  /**
   * emits when a task bar is dragged to a new position
   */
  TASK_DRAGGED: "taskDragged",
  /**
   * emits when a task bar is resized via handles
   */
  TASK_RESIZED: "taskResized",
  /**
   * emits when the in-bar progress handle is dragged to a new value
   */
  TASK_PROGRESS_CHANGED: "taskProgressChanged",
  /**
   * emits when the set of selected tasks changes
   */
  SELECTION_CHANGE: "selectionChange",
  /**
   * emits when a dependency arrow is created, updated, or removed
   */
  DEPENDENCY_ARROW_UPDATE: "dependencyArrowUpdate"
};
const MS_PER_DAY$6 = 864e5;
const MS_PER_HOUR$3 = 36e5;
const MS_PER_MINUTE$3 = 6e4;
function snapMs$1(unit, value) {
  const base = unit === "minute" ? MS_PER_MINUTE$3 : unit === "hour" ? MS_PER_HOUR$3 : MS_PER_DAY$6;
  return base * Math.max(1, value);
}
class BarDragManager {
  constructor(taskId, options, pixelsPerMs, chartContext, dataManager) {
    this.taskId = taskId;
    this.options = options;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.dragState = {
      childTasks: [],
      pixelsPerSnap: 0,
      msPerSnap: 0,
      initialLeft: 0,
      initialPosition: 0,
      initialStartTime: "",
      initialEndTime: "",
      isDragging: false,
      startX: 0
    };
    this.task = null;
    const initialTask = this.dataManager.getTaskById(taskId);
    if (!initialTask) {
      throw new Error(`BarDragManager: Task with id "${taskId}" not found`);
    }
    const ms = snapMs$1(this.options.snapUnit, this.options.snapValue);
    this.dragState.msPerSnap = ms;
    this.dragState.pixelsPerSnap = pixelsPerMs * ms;
  }
  calculateFinalPosition(e) {
    const { pixelsPerSnap, initialLeft, initialPosition } = this.dragState;
    const dx = e.clientX - initialPosition;
    const snapsMoved = Math.round(dx / pixelsPerSnap);
    const calculatedLeft = initialLeft + snapsMoved * pixelsPerSnap;
    return { calculatedLeft, snapsMoved };
  }
  shiftTimestamp(ts, snapsMoved) {
    const fmt = this.options.inputDateFormat;
    const next = dayjs(ts, fmt).add(snapsMoved * this.dragState.msPerSnap, "millisecond");
    return next.format(fmt);
  }
  createMouseDownHandler(barElement) {
    return (e) => {
      this.task = this.dataManager.getTaskById(this.taskId);
      if (!this.task)
        return;
      this.dragState = {
        ...this.dragState,
        initialLeft: parseInt(barElement.style.left) || 0,
        initialPosition: e.clientX,
        initialStartTime: this.task.startTime,
        initialEndTime: this.task.endTime,
        isDragging: true,
        startX: e.clientX
      };
      barElement.classList.add("dragging");
      barElement.setAttribute("aria-grabbed", "true");
      this.dragState.childTasks = this.dataManager.getNestedChildTasks(this.task.id).map((childTask) => {
        const childElement = getBarElement(this.chartContext, childTask.id);
        return childElement ? {
          ...childTask,
          element: childElement,
          left: parseInt(childElement.style.left) || 0,
          width: parseInt(childElement.style.width) || 0
        } : childTask;
      });
    };
  }
  createMouseMoveHandler(barElement) {
    return (e) => {
      if (!this.dragState.isDragging)
        return;
      requestAnimationFrame(() => {
        const dx = e.clientX - this.dragState.startX;
        const currentLeft = parseInt(barElement.style.left) || 0;
        this.moveBar(barElement, currentLeft, dx);
        if (this.task) {
          this.dataManager.updateDependencyArrows(this.task.id, this.chartContext);
        }
        this.moveChildBars(dx);
        this.dragState.startX = e.clientX;
      });
    };
  }
  createMouseUpHandler(barElement, onUpdate) {
    return (e) => {
      if (!this.dragState.isDragging)
        return;
      this.dragState.isDragging = false;
      barElement.classList.remove("dragging");
      barElement.setAttribute("aria-grabbed", "false");
      if (!this.task)
        return;
      const { calculatedLeft, snapsMoved } = this.calculateFinalPosition(e);
      if (snapsMoved === 0) {
        this.dragState = {
          ...this.dragState,
          isDragging: false
        };
        return;
      }
      const newStart = this.shiftTimestamp(this.task.startTime, snapsMoved);
      const newEnd = this.shiftTimestamp(this.task.endTime, snapsMoved);
      const affectedChildTasks = this.dragState.childTasks.map((childTask) => ({
        taskId: childTask.id,
        newStartTime: this.shiftTimestamp(childTask.startTime, snapsMoved),
        newEndTime: childTask.endTime ? this.shiftTimestamp(childTask.endTime, snapsMoved) : null
      })).filter(
        (child) => child.newEndTime !== null
      );
      const daysMoved = snapsMoved * this.dragState.msPerSnap / MS_PER_DAY$6;
      this.emitTaskDraggedEvent(daysMoved, newStart, newEnd, affectedChildTasks);
      this.updateTaskPosition(barElement, calculatedLeft, snapsMoved, onUpdate);
      this.updateChildrenPositions(calculatedLeft, snapsMoved, onUpdate);
    };
  }
  emitTaskDraggedEvent(daysMoved, newStartTime, newEndTime, affectedChildTasks) {
    if (!this.task)
      return;
    const eventDetail = {
      taskId: this.task.id,
      oldStartTime: this.dragState.initialStartTime,
      oldEndTime: this.dragState.initialEndTime,
      newStartTime,
      newEndTime,
      daysMoved,
      affectedChildTasks,
      timestamp: Date.now()
    };
    const event = new CustomEvent(GanttEvents.TASK_DRAGGED, {
      detail: eventDetail,
      bubbles: true,
      composed: true,
      cancelable: false
    });
    const chartContainer = this.chartContext.getChartContainer();
    if (chartContainer) {
      chartContainer.dispatchEvent(event);
    }
  }
  moveBar(element, currentLeft, dx) {
    element.style.left = `${currentLeft + dx}px`;
  }
  moveChildBars(dx) {
    this.dragState.childTasks.forEach((childTask) => {
      if (childTask.element) {
        const childLeft = parseInt(childTask.element.style.left) || 0;
        childTask.element.style.left = `${childLeft + dx}px`;
        this.dataManager.updateDependencyArrows(childTask.id, this.chartContext);
      }
    });
  }
  updateChildrenPositions(parentCalculatedLeft, snapsMoved, onUpdate) {
    this.dragState.childTasks.forEach((childTask) => {
      const childElement = getBarElement(this.chartContext, childTask.id);
      if (childElement) {
        const diff = parentCalculatedLeft - this.dragState.initialLeft;
        childElement.style.left = `${(childTask.left ?? 0) + diff}px`;
        const childNewStart = this.shiftTimestamp(childTask.startTime, snapsMoved);
        const childNewEnd = childTask.endTime ? this.shiftTimestamp(childTask.endTime, snapsMoved) : null;
        this.dataManager.updateDependencyArrows(childTask.id, this.chartContext);
        onUpdate == null ? void 0 : onUpdate(childTask.id, {
          endTime: childNewEnd ?? void 0,
          startTime: childNewStart
        });
      }
    });
  }
  updateTaskPosition(element, calculatedLeft, snapsMoved, onUpdate) {
    if (!this.task)
      return;
    element.style.left = `${calculatedLeft}px`;
    const newStart = this.shiftTimestamp(this.task.startTime, snapsMoved);
    const newEnd = this.shiftTimestamp(this.task.endTime, snapsMoved);
    this.dataManager.updateDependencyArrows(this.task.id, this.chartContext);
    onUpdate == null ? void 0 : onUpdate(this.task.id, { endTime: newEnd, startTime: newStart });
  }
  makeDraggable(barElement, onUpdate) {
    const handleMouseDown = this.createMouseDownHandler(barElement);
    const handleMouseMove = this.createMouseMoveHandler(barElement);
    const handleMouseUp = this.createMouseUpHandler(barElement, onUpdate);
    barElement.addEventListener("mousedown", handleMouseDown);
    this.chartContext.addEventListener("mousemove", handleMouseMove);
    this.chartContext.addEventListener("mouseup", handleMouseUp);
    return () => {
      barElement.removeEventListener("mousedown", handleMouseDown);
      this.chartContext.removeEventListener("mousemove", handleMouseMove);
      this.chartContext.removeEventListener("mouseup", handleMouseUp);
    };
  }
}
class BarProgressManager {
  constructor(taskId, options, chartContext, dataManager) {
    this.taskId = taskId;
    this.options = options;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.state = {
      initialProgress: 0,
      initialClientX: 0,
      barWidth: 0,
      isDragging: false,
      currentProgress: 0
    };
    this.task = null;
    const initialTask = this.dataManager.getTaskById(taskId);
    if (!initialTask) {
      throw new Error(`BarProgressManager: Task with id "${taskId}" not found`);
    }
  }
  clamp(value) {
    if (value < 0)
      return 0;
    if (value > 100)
      return 100;
    return value;
  }
  updateVisuals(barElement, progress) {
    const progressBar = barElement.querySelector(".bar-timeline-progress");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    const handle = barElement.querySelector(".bar-progress-handle");
    if (handle) {
      handle.style.left = `${progress}%`;
      handle.setAttribute("aria-valuenow", String(Math.round(progress)));
    }
    const label = barElement.querySelector(".bar-progress-handle-label");
    if (label) {
      label.style.left = `${progress}%`;
      label.textContent = `${Math.round(progress)}%`;
    }
  }
  createMouseDownHandler(barElement, handleEl) {
    return (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.task = this.dataManager.getTaskById(this.taskId);
      if (!this.task)
        return;
      const barWidth = parseInt(barElement.style.width) || barElement.offsetWidth || 0;
      if (barWidth <= 0)
        return;
      this.state = {
        initialProgress: this.task.progress ?? 0,
        initialClientX: e.clientX,
        barWidth,
        isDragging: true,
        currentProgress: this.task.progress ?? 0
      };
      barElement.classList.add("progress-dragging");
      handleEl.classList.add("dragging");
    };
  }
  createMouseMoveHandler(barElement) {
    return (e) => {
      if (!this.state.isDragging)
        return;
      requestAnimationFrame(() => {
        const dx = e.clientX - this.state.initialClientX;
        const dPercent = dx / this.state.barWidth * 100;
        const next = this.clamp(this.state.initialProgress + dPercent);
        this.state.currentProgress = next;
        this.updateVisuals(barElement, next);
      });
    };
  }
  createMouseUpHandler(barElement, handleEl, onUpdate) {
    return (_e) => {
      if (!this.state.isDragging)
        return;
      this.state.isDragging = false;
      barElement.classList.remove("progress-dragging");
      handleEl.classList.remove("dragging");
      if (!this.task)
        return;
      const oldProgress = this.state.initialProgress;
      const newProgress = Math.round(this.state.currentProgress);
      this.updateVisuals(barElement, newProgress);
      if (newProgress === oldProgress)
        return;
      onUpdate == null ? void 0 : onUpdate(this.task.id, { progress: newProgress });
      this.emitTaskProgressChangedEvent(oldProgress, newProgress);
    };
  }
  emitTaskProgressChangedEvent(oldProgress, newProgress) {
    if (!this.task)
      return;
    const detail = {
      taskId: this.task.id,
      oldProgress,
      newProgress,
      timestamp: Date.now()
    };
    const event = new CustomEvent(GanttEvents.TASK_PROGRESS_CHANGED, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: false
    });
    const chartContainer = this.chartContext.getChartContainer();
    if (chartContainer) {
      chartContainer.dispatchEvent(event);
    }
  }
  makeProgressDraggable(barElement, handleEl, onUpdate) {
    const handleMouseDown = this.createMouseDownHandler(barElement, handleEl);
    const handleMouseMove = this.createMouseMoveHandler(barElement);
    const handleMouseUp = this.createMouseUpHandler(barElement, handleEl, onUpdate);
    handleEl.addEventListener("mousedown", handleMouseDown);
    this.chartContext.addEventListener("mousemove", handleMouseMove);
    this.chartContext.addEventListener("mouseup", handleMouseUp);
    return () => {
      handleEl.removeEventListener("mousedown", handleMouseDown);
      this.chartContext.removeEventListener("mousemove", handleMouseMove);
      this.chartContext.removeEventListener("mouseup", handleMouseUp);
    };
  }
}
const MS_PER_DAY$5 = 864e5;
const MS_PER_HOUR$2 = 36e5;
const MS_PER_MINUTE$2 = 6e4;
function snapMs(unit, value) {
  const base = unit === "minute" ? MS_PER_MINUTE$2 : unit === "hour" ? MS_PER_HOUR$2 : MS_PER_DAY$5;
  return base * Math.max(1, value);
}
class BarResizeManager {
  constructor(taskId, options, pixelsPerMs, chartContext, dataManager) {
    this.taskId = taskId;
    this.options = options;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.interactionState = {
      pixelsPerSnap: 0,
      msPerSnap: 0,
      initialLeft: 0,
      initialPosition: 0,
      initialWidth: 0,
      initialStartTime: "",
      initialEndTime: "",
      isResizing: false,
      resizeHandle: null,
      startX: 0
    };
    this.task = null;
    const initialTask = this.dataManager.getTaskById(taskId);
    if (!initialTask) {
      throw new Error(`BarResizeManager: Task with id "${taskId}" not found`);
    }
    const ms = snapMs(this.options.snapUnit, this.options.snapValue);
    this.interactionState.msPerSnap = ms;
    this.interactionState.pixelsPerSnap = pixelsPerMs * ms;
  }
  shiftTimestamp(ts, snapsMoved) {
    const fmt = this.options.inputDateFormat;
    return dayjs(ts, fmt).add(snapsMoved * this.interactionState.msPerSnap, "millisecond").format(fmt);
  }
  createMouseMoveHandler(barElement) {
    return (e) => {
      if (!this.interactionState.isResizing)
        return;
      requestAnimationFrame(() => {
        const dx = e.clientX - this.interactionState.startX;
        const { pixelsPerSnap, resizeHandle } = this.interactionState;
        const currentLeft = parseInt(barElement.style.left) || 0;
        const currentWidth = parseInt(barElement.style.width) || 0;
        if (resizeHandle === "left") {
          const newLeft = Math.max(0, currentLeft + dx);
          const newWidth = currentWidth - (newLeft - currentLeft);
          if (newWidth >= pixelsPerSnap) {
            barElement.style.left = `${newLeft}px`;
            barElement.style.width = `${newWidth}px`;
          }
        } else {
          const newWidth = Math.max(pixelsPerSnap, currentWidth + dx);
          barElement.style.width = `${newWidth}px`;
        }
        if (!this.task)
          return;
        this.dataManager.updateDependencyArrows(this.task.id, this.chartContext);
        this.interactionState.startX = e.clientX;
      });
    };
  }
  createMouseUpHandler(barElement, onUpdate) {
    return (e) => {
      if (!this.interactionState.isResizing)
        return;
      if (!this.task)
        return;
      barElement.classList.remove("resizing");
      const { pixelsPerSnap, msPerSnap, initialLeft, initialPosition, initialWidth, resizeHandle } = this.interactionState;
      const dx = e.clientX - initialPosition;
      const oldStartTime = this.interactionState.initialStartTime;
      const oldEndTime = this.interactionState.initialEndTime;
      let newStartTime = oldStartTime;
      let newEndTime = oldEndTime;
      let durationChange = 0;
      if (resizeHandle === "left") {
        let snapsChange = Math.round(dx / pixelsPerSnap);
        let calculatedLeft = initialLeft + snapsChange * pixelsPerSnap;
        let calculatedWidth = initialWidth - snapsChange * pixelsPerSnap;
        if (calculatedWidth < pixelsPerSnap) {
          calculatedWidth = pixelsPerSnap;
          calculatedLeft = initialLeft + initialWidth - pixelsPerSnap;
          snapsChange = Math.round((calculatedLeft - initialLeft) / pixelsPerSnap);
        }
        if (snapsChange === 0) {
          this.interactionState = {
            ...this.interactionState,
            isResizing: false,
            resizeHandle: null
          };
          return;
        }
        barElement.style.left = `${calculatedLeft}px`;
        barElement.style.width = `${calculatedWidth}px`;
        newStartTime = this.shiftTimestamp(this.task.startTime, snapsChange);
        durationChange = -snapsChange * msPerSnap / MS_PER_DAY$5;
        onUpdate == null ? void 0 : onUpdate(this.task.id, { startTime: newStartTime });
      } else {
        let snapsWidth = Math.round(dx / pixelsPerSnap);
        let calculatedWidth = initialWidth + snapsWidth * pixelsPerSnap;
        if (calculatedWidth < pixelsPerSnap) {
          calculatedWidth = pixelsPerSnap;
          snapsWidth = Math.round((calculatedWidth - initialWidth) / pixelsPerSnap);
        }
        if (snapsWidth === 0) {
          this.interactionState = {
            ...this.interactionState,
            isResizing: false,
            resizeHandle: null
          };
          return;
        }
        barElement.style.width = `${calculatedWidth}px`;
        newEndTime = this.shiftTimestamp(this.task.endTime, snapsWidth);
        durationChange = snapsWidth * msPerSnap / MS_PER_DAY$5;
        onUpdate == null ? void 0 : onUpdate(this.task.id, { endTime: newEndTime });
      }
      if (resizeHandle !== null) {
        this.emitTaskResizedEvent(resizeHandle, oldStartTime, oldEndTime, newStartTime, newEndTime, durationChange);
      }
      this.dataManager.updateDependencyArrows(this.task.id, this.chartContext);
      this.interactionState = {
        ...this.interactionState,
        isResizing: false,
        resizeHandle: null
      };
    };
  }
  emitTaskResizedEvent(resizeHandle, oldStartTime, oldEndTime, newStartTime, newEndTime, durationChange) {
    if (!this.task)
      return;
    const eventDetail = {
      taskId: this.task.id,
      resizeHandle,
      oldStartTime,
      oldEndTime,
      newStartTime,
      newEndTime,
      durationChange,
      timestamp: Date.now()
    };
    const event = new CustomEvent(GanttEvents.TASK_RESIZED, {
      detail: eventDetail,
      bubbles: true,
      composed: true,
      cancelable: false
    });
    const chartContainer = this.chartContext.getChartContainer();
    if (chartContainer) {
      chartContainer.dispatchEvent(event);
    }
  }
  createResizeMouseDownHandler(barElement) {
    return (e, handle) => {
      e.stopPropagation();
      this.task = this.dataManager.getTaskById(this.taskId);
      if (!this.task)
        return;
      this.interactionState = {
        ...this.interactionState,
        initialLeft: parseInt(barElement.style.left) || 0,
        initialPosition: e.clientX,
        initialWidth: parseInt(barElement.style.width) || 0,
        initialStartTime: this.task.startTime,
        initialEndTime: this.task.endTime,
        isResizing: true,
        resizeHandle: handle,
        startX: e.clientX
      };
      barElement.classList.add("resizing");
    };
  }
  makeResizable(barElement, onUpdate) {
    const leftHandle = barElement.querySelector(".handle-left");
    const rightHandle = barElement.querySelector(".handle-right");
    const handleResizeMouseDown = this.createResizeMouseDownHandler(barElement);
    const handleMouseMove = this.createMouseMoveHandler(barElement);
    const handleMouseUp = this.createMouseUpHandler(barElement, onUpdate);
    leftHandle == null ? void 0 : leftHandle.addEventListener("mousedown", (e) => handleResizeMouseDown(e, "left"));
    rightHandle == null ? void 0 : rightHandle.addEventListener("mousedown", (e) => handleResizeMouseDown(e, "right"));
    this.chartContext.addEventListener("mousemove", handleMouseMove);
    this.chartContext.addEventListener("mouseup", handleMouseUp);
    return () => {
      leftHandle == null ? void 0 : leftHandle.removeEventListener("mousedown", (e) => handleResizeMouseDown(e, "left"));
      rightHandle == null ? void 0 : rightHandle.removeEventListener("mousedown", (e) => handleResizeMouseDown(e, "right"));
      this.chartContext.removeEventListener("mousemove", handleMouseMove);
      this.chartContext.removeEventListener("mouseup", handleMouseUp);
    };
  }
}
class Dialog {
  constructor(chartContext, options) {
    this.chartContext = chartContext;
    this.options = options;
    this.overlay = null;
    this.keydownHandler = null;
    this.clickOutsideHandler = null;
    this.createDialog();
    this.setupEventListeners();
  }
  createDialog() {
    const chartInstanceId = this.chartContext.getInstanceId();
    const existingContainer = this.chartContext.getElementById(`${this.options.id}-container`);
    if (existingContainer) {
      this.container = existingContainer;
      const dialog2 = this.container.querySelector(".gantt-dialog");
      this.updateDialogContent(dialog2);
      return;
    }
    this.container = this.chartContext.createElement("div");
    this.container.id = `${this.options.id}-container`;
    this.container.className = "gantt-dialog-container";
    this.container.setAttribute("role", "dialog");
    this.container.setAttribute("aria-modal", "true");
    this.container.setAttribute("aria-labelledby", `${this.options.id}-title`);
    this.container.setAttribute("data-chart-instance", chartInstanceId);
    if (this.options.modal) {
      this.overlay = this.chartContext.createElement("div");
      this.overlay.className = "dialog-overlay";
      this.container.appendChild(this.overlay);
    }
    const dialog = this.chartContext.createElement("div");
    dialog.id = this.options.id;
    dialog.className = "gantt-dialog";
    this.createDialogStructure(dialog);
    if (this.options.width) {
      dialog.style.width = this.options.width;
    }
    if (this.options.height) {
      dialog.style.height = this.options.height;
    }
    this.container.appendChild(dialog);
    if (this.options.positionRelativeToChart !== false) {
      this.positionRelativeToChart();
    }
    const appendTarget = this.options.positionRelativeToChart !== false ? this.chartContext.getChartContainer() : this.chartContext.getAppendContainer();
    appendTarget == null ? void 0 : appendTarget.appendChild(this.container);
  }
  createDialogStructure(dialog) {
    dialog.innerHTML = `
    <div class="dialog-header">
      <h2 id="${this.options.id}-title-${this.chartContext.getInstanceId()}" class="dialog-title">${this.options.title || ""}</h2>
      <button class="dialog-close" aria-label="Close dialog" type="button">&times;</button>
    </div>
    <div class="dialog-content"></div>
  `;
    this.updateDialogContent(dialog);
  }
  /**
   * Position dialog relative to the chart container
   */
  positionRelativeToChart() {
    const chartContainer = this.chartContext.getChartContainer();
    if (chartContainer) {
      const computedStyle = window.getComputedStyle(chartContainer);
      if (computedStyle.position === "static") {
        chartContainer.style.position = "relative";
      }
    }
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.zIndex = "999";
  }
  setupEventListeners() {
    const closeButton = this.container.querySelector(".dialog-close");
    closeButton == null ? void 0 : closeButton.addEventListener("click", () => this.hide());
    if (this.options.closeOnEscape) {
      this.keydownHandler = (e) => {
        if (e.key === "Escape" && this.isVisible()) {
          e.preventDefault();
          this.hide();
        }
      };
      this.chartContext.addEventListener("keydown", this.keydownHandler);
    }
    if (this.options.closeOnClickOutside && this.overlay) {
      this.clickOutsideHandler = (e) => {
        if (e.target === this.overlay) {
          this.hide();
        }
      };
      this.overlay.addEventListener("click", this.clickOutsideHandler);
    }
    this.container.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && this.isVisible()) {
        this.trapFocus(e);
      }
    });
  }
  trapFocus(e) {
    const focusableElements = this.container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = this.chartContext.getActiveElement();
    if (e.shiftKey) {
      if (activeElement === firstElement) {
        e.preventDefault();
        lastElement == null ? void 0 : lastElement.focus();
      }
    } else {
      if (activeElement === lastElement) {
        e.preventDefault();
        firstElement == null ? void 0 : firstElement.focus();
      }
    }
  }
  updateDialogContent(dialog) {
    const contentContainer = dialog.querySelector(".dialog-content");
    const titleElement = dialog.querySelector(".dialog-title");
    if (titleElement) {
      titleElement.textContent = this.options.title || "";
    }
    if (contentContainer) {
      contentContainer.innerHTML = "";
      if (typeof this.options.content === "string") {
        contentContainer.innerHTML = this.options.content;
      } else if (this.options.content instanceof HTMLElement) {
        contentContainer.appendChild(this.options.content);
      }
    }
  }
  cleanupEventListeners() {
    if (this.keydownHandler) {
      this.chartContext.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.clickOutsideHandler && this.overlay) {
      this.overlay.removeEventListener("click", this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }
  destroy() {
    this.cleanupEventListeners();
    this.container.remove();
  }
  hide() {
    this.container.classList.remove("show", "animate");
    const previouslyFocused = this.chartContext.querySelector("[data-dialog-trigger]");
    previouslyFocused == null ? void 0 : previouslyFocused.focus();
  }
  isVisible() {
    return this.container.classList.contains("show");
  }
  setContent(content) {
    const contentContainer = this.container.querySelector(".dialog-content");
    if (contentContainer) {
      contentContainer.innerHTML = "";
      if (typeof content === "string") {
        contentContainer.innerHTML = content;
      } else {
        contentContainer.appendChild(content);
      }
    }
  }
  show() {
    const activeElement = this.chartContext.getActiveElement();
    activeElement == null ? void 0 : activeElement.setAttribute("data-dialog-trigger", "true");
    this.container.classList.add("show", "animate");
    const firstFocusable = this.container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable == null ? void 0 : firstFocusable.focus();
  }
}
class TaskForm {
  constructor(chartContext, dataManager, task, containerElement, onSubmit, dateFormat = "MM-DD-YYYY") {
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.task = task;
    this.containerElement = containerElement;
    this.onSubmit = onSubmit;
    this.dateFormat = dateFormat;
    this.errors = [];
    this.submitButton = null;
    this.form = this.createForm();
  }
  emitEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: false
    });
    this.containerElement.dispatchEvent(event);
  }
  clearError(field) {
    var _a;
    const input = this.form.querySelector(`[name="${field}"]`);
    const errorDiv = (_a = input.parentElement) == null ? void 0 : _a.querySelector(".form-error");
    errorDiv == null ? void 0 : errorDiv.remove();
    input.classList.remove("invalid");
    this.errors = this.errors.filter((error) => error.field !== field);
    this.updateSubmitButton();
  }
  createForm() {
    const form = this.chartContext.createElement("form");
    form.className = "task-form";
    form.innerHTML = `
      <div class="form-group">
        <label for="name">Task Name</label>
        <input type="text" id="name" name="name" value="${this.task.name}">
      </div>

      <div class="form-group">
        <label for="startTime">Start Date</label>
        <input type="date" id="startTime" name="startTime" value="${this.formatDate(this.task.startTime)}">
      </div>

      <div class="form-group">
        <label for="endTime">End Date</label>
        <input type="date" id="endTime" name="endTime" value="${this.formatDate(this.task.endTime)}">
      </div>

      <div class="form-group">
        <label for="progress">Progress (%)</label>
        <input type="number" id="progress" name="progress" min="0" max="100" value="${this.task.progress}">
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Update</button>
      </div>
    `;
    form.addEventListener("submit", this.handleSubmit.bind(this));
    this.setupFieldValidation(form);
    return form;
  }
  formatDate(date) {
    return dayjs(date, this.dateFormat).format("YYYY-MM-DD");
  }
  handleSubmit(e) {
    e.preventDefault();
    if (this.errors.length > 0) {
      this.emitEvent(GanttEvents.TASK_VALIDATION_ERROR, {
        taskId: this.task.id,
        errors: this.errors,
        timestamp: Date.now()
      });
      return;
    }
    try {
      const formData = new FormData(this.form);
      const updatedTask = {
        ...this.task,
        endTime: dayjs(formData.get("endTime")).format(this.dateFormat),
        name: formData.get("name"),
        progress: Number(formData.get("progress")),
        startTime: dayjs(formData.get("startTime")).format(this.dateFormat)
      };
      const fullUpdatedTask = this.dataManager.getTaskById(this.task.id) ?? this.task;
      this.emitEvent(GanttEvents.TASK_UPDATE, {
        taskId: this.task.id,
        updates: updatedTask,
        updatedTask: { ...fullUpdatedTask, ...updatedTask },
        timestamp: Date.now()
      });
      this.onSubmit(updatedTask);
      this.emitEvent(GanttEvents.TASK_UPDATE_SUCCESS, {
        taskId: this.task.id,
        updatedTask: { ...fullUpdatedTask, ...updatedTask },
        timestamp: Date.now()
      });
    } catch (error) {
      logger.warn(`[TaskForm] Error updating task ${this.task.id}:`, error);
      this.emitEvent(GanttEvents.TASK_UPDATE_ERROR, {
        taskId: this.task.id,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now()
      });
    }
  }
  setupFieldValidation(form) {
    const nameInput = form.querySelector('[name="name"]');
    const startInput = form.querySelector('[name="startTime"]');
    const endInput = form.querySelector('[name="endTime"]');
    const progressInput = form.querySelector('[name="progress"]');
    nameInput == null ? void 0 : nameInput.addEventListener("change", () => {
      const error = this.validateName(nameInput.value);
      if (error) {
        this.showError("name", error);
      } else {
        this.clearError("name");
      }
    });
    const validateDateInputs = () => {
      const { endError, startError } = this.validateDates(startInput.value, endInput.value);
      if (startError) {
        this.showError("startTime", startError);
      } else {
        this.clearError("startTime");
      }
      if (endError) {
        this.showError("endTime", endError);
      } else {
        this.clearError("endTime");
      }
    };
    startInput == null ? void 0 : startInput.addEventListener("change", validateDateInputs);
    endInput == null ? void 0 : endInput.addEventListener("change", validateDateInputs);
    progressInput == null ? void 0 : progressInput.addEventListener("change", () => {
      const error = this.validateProgress(Number(progressInput.value));
      if (error) {
        this.showError("progress", error);
      } else {
        this.clearError("progress");
      }
    });
  }
  showError(field, message) {
    var _a, _b;
    const input = this.form.querySelector(`[name="${field}"]`);
    const errorDiv = this.chartContext.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.textContent = message;
    const existingError = (_a = input.parentElement) == null ? void 0 : _a.querySelector(".form-error");
    existingError == null ? void 0 : existingError.remove();
    (_b = input.parentElement) == null ? void 0 : _b.appendChild(errorDiv);
    input.classList.add("invalid");
    this.errors.push({ field, message });
    this.updateSubmitButton();
  }
  updateSubmitButton() {
    if (!this.submitButton) {
      this.submitButton = this.form.querySelector(".btn-primary");
    }
    if (this.submitButton) {
      const hasErrors = this.errors.length > 0;
      this.submitButton.disabled = hasErrors;
      this.submitButton.classList.toggle("btn-disabled", hasErrors);
    }
  }
  validateDates(startTime, endTime) {
    const errors = { endError: null, startError: null };
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    if (!startTime) {
      errors.startError = "Start date is required";
    }
    if (!endTime) {
      errors.endError = "End date is required";
    }
    if (start.isValid() && end.isValid() && end.isBefore(start)) {
      errors.endError = "End date must be after start date";
    }
    return errors;
  }
  validateName(name) {
    if (!name.trim()) {
      return "Task name is required";
    }
    return null;
  }
  validateProgress(progress) {
    if (!progress && progress !== 0) {
      return "Progress is required";
    }
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return "Progress must be between 0 and 100";
    }
    return null;
  }
  getElement() {
    return this.form;
  }
}
function formatHasTime(format) {
  return /[HhmsS]/.test(format);
}
const BAR_GAP = 12;
const ARROW_HALF = 5;
const ARROW_EDGE_INSET = 14;
const VIEWPORT_MARGIN = 6;
function calculateAnchoredTooltipPosition(barRect, tooltipWidth, tooltipHeight, viewport) {
  const barCenterX = barRect.left + barRect.width / 2;
  const spaceAbove = barRect.top;
  const neededVertical = tooltipHeight + BAR_GAP + VIEWPORT_MARGIN;
  const placement = spaceAbove >= neededVertical ? "above" : "below";
  let leftViewport = barCenterX - tooltipWidth / 2;
  const maxLeft = viewport.width - tooltipWidth - VIEWPORT_MARGIN;
  leftViewport = Math.min(Math.max(VIEWPORT_MARGIN, leftViewport), Math.max(VIEWPORT_MARGIN, maxLeft));
  const topViewport = placement === "above" ? barRect.top - tooltipHeight - BAR_GAP : barRect.top + barRect.height + BAR_GAP;
  let arrowLeft = barCenterX - leftViewport;
  arrowLeft = Math.min(Math.max(ARROW_EDGE_INSET, arrowLeft), tooltipWidth - ARROW_EDGE_INSET);
  return {
    left: leftViewport + viewport.scrollX,
    top: topViewport + viewport.scrollY,
    placement,
    arrowLeft: arrowLeft - ARROW_HALF
  };
}
function buildAnchoredTooltipHTML(innerContent, bgColor, _borderColor, fontColor, arrowLeft, placement) {
  const arrowClass = placement === "above" ? "arrow-below" : "arrow-above";
  const contentStyle = `background-color: ${bgColor}; color: ${fontColor};`;
  const arrowStyle = `left: ${arrowLeft}px; background-color: ${bgColor};`;
  return `<div class="tooltip-content" style="${contentStyle}">${innerContent}</div><div class="tooltip-arrow ${arrowClass}" style="${arrowStyle}"></div>`;
}
const pendingHides = /* @__PURE__ */ new Map();
function showAnchoredTooltip(context, tooltipId, barElement, innerContent, options) {
  const pending = pendingHides.get(tooltipId);
  if (pending !== void 0) {
    clearTimeout(pending);
    pendingHides.delete(tooltipId);
  }
  const tooltipElement = getTooltip(context, tooltipId);
  tooltipElement.classList.add("apexgantt-tooltip");
  tooltipElement.innerHTML = buildAnchoredTooltipHTML(
    innerContent,
    options.bgColor,
    options.borderColor,
    options.fontColor,
    0,
    "above"
  );
  const fontStyles = [
    options.fontFamily ? `font-family: ${options.fontFamily};` : "",
    options.fontSize ? `font-size: ${options.fontSize};` : "",
    options.fontWeight ? `font-weight: ${options.fontWeight};` : ""
  ].filter(Boolean).join(" ");
  tooltipElement.setAttribute(
    "style",
    `position: absolute; left: -9999px; top: -9999px; visibility: hidden; opacity: 0; display: block; ${fontStyles}`
  );
  const barRect = barElement.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const position = calculateAnchoredTooltipPosition(
    { left: barRect.left, top: barRect.top, width: barRect.width, height: barRect.height },
    tooltipRect.width,
    tooltipRect.height,
    {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX || document.documentElement.scrollLeft,
      scrollY: window.scrollY || document.documentElement.scrollTop
    }
  );
  tooltipElement.innerHTML = buildAnchoredTooltipHTML(
    innerContent,
    options.bgColor,
    options.borderColor,
    options.fontColor,
    position.arrowLeft,
    position.placement
  );
  tooltipElement.setAttribute(
    "style",
    `position: absolute; left: ${position.left}px; top: ${position.top}px; ${fontStyles}`
  );
  tooltipElement.classList.add("visible");
  tooltipElement.setAttribute("aria-hidden", "false");
}
function showCursorTooltip(context, tooltipId, clientX, clientY, innerContent, options) {
  const pending = pendingHides.get(tooltipId);
  if (pending !== void 0) {
    clearTimeout(pending);
    pendingHides.delete(tooltipId);
  }
  const tooltipElement = getTooltip(context, tooltipId);
  tooltipElement.classList.add("apexgantt-tooltip");
  const contentStyle = `background-color: ${options.bgColor}; color: ${options.fontColor};`;
  tooltipElement.innerHTML = `<div class="tooltip-content" style="${contentStyle}">${innerContent}</div>`;
  const fontStyles = [
    options.fontFamily ? `font-family: ${options.fontFamily};` : "",
    options.fontSize ? `font-size: ${options.fontSize};` : "",
    options.fontWeight ? `font-weight: ${options.fontWeight};` : "",
    options.maxWidth ? `max-width: ${options.maxWidth}px;` : ""
  ].filter(Boolean).join(" ");
  tooltipElement.setAttribute(
    "style",
    `position: absolute; left: -9999px; top: -9999px; visibility: hidden; opacity: 0; display: block; ${fontStyles}`
  );
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const { x, y } = calculateCursorFollowingTooltip(
    clientX,
    clientY,
    tooltipRect.width,
    tooltipRect.height,
    options.cursorOffsetX ?? 12,
    options.cursorOffsetY ?? 16
  );
  tooltipElement.setAttribute("style", `position: absolute; left: ${x}px; top: ${y}px; ${fontStyles}`);
  tooltipElement.classList.add("visible");
  tooltipElement.setAttribute("aria-hidden", "false");
}
function hideAnchoredTooltip(context, tooltipId) {
  const pending = pendingHides.get(tooltipId);
  if (pending !== void 0) {
    clearTimeout(pending);
    pendingHides.delete(tooltipId);
  }
  const tooltipElement = context.getElementById(tooltipId);
  if (!tooltipElement)
    return;
  tooltipElement.removeAttribute("style");
  tooltipElement.classList.remove("visible");
  tooltipElement.setAttribute("aria-hidden", "true");
  tooltipElement.innerHTML = "";
}
function scheduleAnchoredTooltipHide(context, tooltipId, delayMs = 100) {
  const existing = pendingHides.get(tooltipId);
  if (existing !== void 0)
    clearTimeout(existing);
  const id = setTimeout(() => {
    pendingHides.delete(tooltipId);
    hideAnchoredTooltip(context, tooltipId);
  }, delayMs);
  pendingHides.set(tooltipId, id);
}
const BASELINE_BAR_HEIGHT = 6;
const BASELINE_GAP = 2;
class Bar {
  constructor(task, geometry, options, index, chartContext, dataManager) {
    this.task = task;
    this.geometry = geometry;
    this.options = options;
    this.index = index;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.tooltipHandler = null;
  }
  static calculateWidth(task, geometry, options) {
    const { barMargin, rowHeight } = options;
    if (task.type === TaskType.Milestone) {
      return (rowHeight - barMargin) / 2;
    }
    const startDate = dayjs(task.showSummaryBar ? task.summaryStart : task.startTime);
    const endDate = dayjs(task.showSummaryBar ? task.summaryEnd : task.endTime);
    const startMs = startDate.valueOf();
    const endMs = formatHasTime(options.inputDateFormat) ? endDate.valueOf() : endDate.add(1, "day").valueOf();
    return (endMs - startMs) * geometry.pixelsPerMs;
  }
  static calculateX(task, geometry, options) {
    const startTime = task.showSummaryBar ? task.summaryStart : task.startTime;
    const xValue = geometry.xForDate(startTime);
    let margin = 0;
    if (task.type === TaskType.Milestone) {
      const { barMargin, rowHeight } = options;
      margin = (rowHeight - barMargin) / 4 * -1;
    }
    return xValue + margin;
  }
  hasBaseline() {
    var _a;
    return !!(((_a = this.options.baseline) == null ? void 0 : _a.enabled) && this.task.baseline);
  }
  calculateHeight() {
    const { barMargin, rowHeight } = this.options;
    if (this.task.type === TaskType.Milestone) {
      return (rowHeight - barMargin) / 2;
    }
    if (this.hasBaseline()) {
      return rowHeight - barMargin * 2 - BASELINE_BAR_HEIGHT - BASELINE_GAP;
    }
    return rowHeight - barMargin * 2;
  }
  attachHoverTooltip(target, buildContent) {
    if (!this.options.enableTooltip) {
      return;
    }
    const { tooltipBGColor, tooltipBorderColor, fontColor, fontFamily, fontSize, fontWeight, tooltipId } = this.options;
    const showTooltip = () => {
      const content = buildContent();
      if (!content)
        return;
      showAnchoredTooltip(this.chartContext, tooltipId, target, content, {
        bgColor: tooltipBGColor,
        borderColor: tooltipBorderColor,
        fontColor,
        fontFamily,
        fontSize,
        fontWeight
      });
    };
    const hideTooltip = () => {
      scheduleAnchoredTooltipHide(this.chartContext, tooltipId);
    };
    target.addEventListener("mouseenter", showTooltip);
    target.addEventListener("mouseleave", hideTooltip);
  }
  setupTooltip(barTimeline) {
    const { tooltipTemplate, inputDateFormat } = this.options;
    this.attachHoverTooltip(barTimeline, () => {
      if (!tooltipTemplate)
        return null;
      const currentTask = this.dataManager.getTaskById(this.task.id);
      if (!currentTask)
        return null;
      return tooltipTemplate(currentTask, inputDateFormat);
    });
  }
  setupBaselineTooltip(baselineBar) {
    const { inputDateFormat } = this.options;
    this.attachHoverTooltip(baselineBar, () => {
      const currentTask = this.dataManager.getTaskById(this.task.id);
      const baseline = currentTask == null ? void 0 : currentTask.baseline;
      if (!currentTask || !baseline)
        return null;
      const start = dayjs(baseline.start).format(inputDateFormat);
      const end = dayjs(baseline.end).format(inputDateFormat);
      return `
        <div>
          <strong>Baseline:</strong>
          <span>${currentTask.name}</span>
        </div>
        <div>
          <strong>Start:</strong>
          <span>${start}</span>
        </div>
        <div>
          <strong>End:</strong>
          <span>${end}</span>
        </div>
      `;
    });
  }
  setupTaskEdit(barTimeline, onUpdate) {
    if (!this.options.enableTaskEdit)
      return;
    const chartInstanceId = this.chartContext.getInstanceId();
    barTimeline.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      event.preventDefault();
      const task = this.dataManager.getTaskById(this.task.id);
      if (!task) {
        logger.error(`[${chartInstanceId}] Task not found in dataManager: ${this.task.id}`);
        return;
      }
      const chartElement = this.chartContext.getChartContainer();
      if (!chartElement)
        return;
      const taskForm = new TaskForm(
        this.chartContext,
        this.dataManager,
        task,
        chartElement,
        (updatedTask) => {
          onUpdate == null ? void 0 : onUpdate(task.id, updatedTask);
          dialog.hide();
        },
        this.options.inputDateFormat
      );
      const dialogId = `taskDialog-${chartInstanceId}-${this.task.id}`;
      const dialog = new Dialog(this.chartContext, {
        closeOnClickOutside: false,
        closeOnEscape: true,
        content: taskForm.getElement(),
        id: dialogId,
        modal: true,
        title: `Edit Task: ${this.task.name}`,
        width: "400px",
        positionRelativeToChart: true
      });
      dialog.show();
    });
  }
  setupInteractions(barTimeline, onUpdate) {
    const { enableTaskDrag, enableTaskResize, enableProgressDrag } = this.options;
    if (enableTaskDrag) {
      this.makeDraggable(barTimeline, onUpdate);
    }
    if (enableTaskResize && this.task.type === TaskType.Task) {
      const barHandleLeft = createBox(this.chartContext, { className: "bar-handle handle-left" });
      const barHandleRight = createBox(this.chartContext, { className: "bar-handle handle-right" });
      barTimeline.append(barHandleLeft, barHandleRight);
      this.makeResizable(barTimeline, onUpdate);
    }
    if (enableProgressDrag && this.task.type === TaskType.Task) {
      const progressHandle = createBox(this.chartContext, { className: "bar-progress-handle" });
      const progress = this.task.progress ?? 0;
      progressHandle.setAttribute("style", `left: ${progress}%;`);
      progressHandle.setAttribute("role", "slider");
      progressHandle.setAttribute("aria-label", `${this.task.name} progress`);
      progressHandle.setAttribute("aria-valuemin", "0");
      progressHandle.setAttribute("aria-valuemax", "100");
      progressHandle.setAttribute("aria-valuenow", String(Math.round(progress)));
      barTimeline.append(progressHandle);
      const progressLabel = createBox(this.chartContext, { className: "bar-progress-handle-label" });
      progressLabel.setAttribute("style", `left: ${progress}%;`);
      progressLabel.setAttribute("aria-hidden", "true");
      progressLabel.textContent = `${Math.round(progress)}%`;
      barTimeline.append(progressLabel);
      this.makeProgressDraggable(barTimeline, progressHandle, onUpdate);
    }
  }
  /**
   * Build small "rollup" markers for each leaf descendant of a summary task,
   * positioned along the parent's row at each child's date range. Shown below
   * the summary bar so children stay visible at a glance even when the parent
   * is collapsed. Returns `[]` for non-summary rows or when there are no
   * dated leaf descendants.
   */
  drawRollups() {
    if (!this.options.enableRollups || !this.task.showSummaryBar)
      return [];
    const { rowHeight, barBackgroundColor, milestoneColor } = this.options;
    const ROLLUP_HEIGHT = 4;
    const ROLLUP_GAP = 2;
    const SUMMARY_BAR_HEIGHT = 8;
    const DIAMOND_SIZE = 7;
    const summaryTop = Math.round((rowHeight - SUMMARY_BAR_HEIGHT) / 2);
    const bandTop = summaryTop + SUMMARY_BAR_HEIGHT + ROLLUP_GAP + this.index * rowHeight;
    const bandCenter = bandTop + ROLLUP_HEIGHT / 2;
    const descendants = this.dataManager.getNestedChildTasks(this.task.id);
    const elements = [];
    for (const child of descendants) {
      if (child.showSummaryBar)
        continue;
      if (!child.startTime)
        continue;
      const isMilestone = child.type === TaskType.Milestone;
      const rollup = createBox(this.chartContext, { className: "bar-rollup" });
      if (isMilestone) {
        const centerX = this.geometry.xForDate(child.startTime);
        const fillColor = child.barBackgroundColor || milestoneColor;
        rollup.classList.add("bar-rollup-milestone");
        rollup.setAttribute(
          "style",
          generateStyles({
            backgroundColor: fillColor,
            borderRadius: "1px",
            height: `${DIAMOND_SIZE}px`,
            left: `${centerX - DIAMOND_SIZE / 2}px`,
            opacity: "0.85",
            pointerEvents: "none",
            position: "absolute",
            top: `${bandCenter - DIAMOND_SIZE / 2}px`,
            transform: "rotate(45deg)",
            width: `${DIAMOND_SIZE}px`
          })
        );
      } else {
        if (!child.endTime)
          continue;
        const left = Bar.calculateX(child, this.geometry, this.options);
        const width = Math.max(2, Bar.calculateWidth(child, this.geometry, this.options));
        const fillColor = child.barBackgroundColor || barBackgroundColor;
        rollup.setAttribute(
          "style",
          generateStyles({
            backgroundColor: fillColor,
            borderRadius: "2px",
            height: `${ROLLUP_HEIGHT}px`,
            left: `${left}px`,
            opacity: "0.7",
            pointerEvents: "none",
            position: "absolute",
            top: `${bandTop}px`,
            width: `${width}px`
          })
        );
      }
      rollup.setAttribute("data-rollup-for", this.task.id);
      rollup.setAttribute("aria-hidden", "true");
      elements.push(rollup);
    }
    return elements;
  }
  drawSummaryBar(onToggleCollapse) {
    const { summaryBarColor, rowHeight } = this.options;
    const summaryBar = createBox(this.chartContext, { className: "bar-timeline bar-summary" });
    const SUMMARY_BAR_HEIGHT = 8;
    const color = this.task.barBackgroundColor || summaryBarColor;
    const progressColor = adjustColorBrightness(color, { l: -15 });
    const left = Bar.calculateX(this.task, this.geometry, this.options);
    const width = Bar.calculateWidth(this.task, this.geometry, this.options);
    const top = Math.round((rowHeight - SUMMARY_BAR_HEIGHT) / 2) + this.index * rowHeight;
    const progress = this.task.progress ?? 0;
    const leftCapColor = progress > 0 ? progressColor : color;
    const rightCapColor = progress >= 100 ? progressColor : color;
    const canToggle = !!onToggleCollapse && this.dataManager.hasChildren(this.task.id);
    const styles = generateStyles({
      "--summary-bar-color": color,
      "--summary-cap-left-color": leftCapColor,
      "--summary-cap-right-color": rightCapColor,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      ...canToggle ? { cursor: "pointer" } : {}
    });
    summaryBar.setAttribute("style", styles);
    summaryBar.setAttribute("data-taskid", this.task.id);
    summaryBar.setAttribute("data-chart-instance", this.chartContext.getInstanceId());
    summaryBar.setAttribute("role", canToggle ? "button" : "group");
    summaryBar.setAttribute(
      "aria-label",
      canToggle ? `${this.task.name} (summary) — ${this.task.collapsed ? "expand" : "collapse"}` : `${this.task.name} (summary)`
    );
    summaryBar.setAttribute("aria-expanded", this.task.collapsed ? "false" : "true");
    summaryBar.setAttribute("tabindex", "0");
    if (progress > 0) {
      const barProgress = createBox(this.chartContext, { className: "bar-timeline-progress" });
      const progressStyles = generateStyles({
        backgroundColor: progressColor,
        width: `${progress}%`
      });
      barProgress.setAttribute("style", progressStyles);
      summaryBar.appendChild(barProgress);
    }
    this.setupTooltip(summaryBar);
    if (canToggle && onToggleCollapse) {
      const toggle = () => {
        this.dataManager.toggleTask(this.task.id);
        onToggleCollapse();
      };
      summaryBar.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
      });
      summaryBar.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    }
    return summaryBar;
  }
  drawBar(onUpdate = noop, onToggleCollapse) {
    if (this.task.showSummaryBar) {
      return this.drawSummaryBar(onToggleCollapse);
    }
    const { barBackgroundColor, barBorderRadius, barLabel: barLabelConfig } = this.options;
    const barTimeline = createBox(this.chartContext, { className: "bar-timeline" });
    const barWidthPx = Bar.calculateWidth(this.task, this.geometry, this.options);
    const labelPosition = resolveBarLabelPosition(barLabelConfig, this.task, barWidthPx, this.options.fontSize);
    const labelClassName = ["bar-label"];
    if (labelPosition !== "inside") {
      labelClassName.push("bar-label-outside", `bar-label-outside-${labelPosition}`);
    }
    if (barLabelConfig.className) {
      labelClassName.push(barLabelConfig.className);
    }
    const barLabel = createBox(this.chartContext, { className: labelClassName.join(" ") });
    applyBarLabelContent(barLabel, barLabelConfig, this.task);
    const barProgress = createBox(this.chartContext, { className: "bar-timeline-progress" });
    const taskBarColor = this.task.barBackgroundColor || barBackgroundColor;
    const barTimelineStyles = generateStyles(this.getBarStyles(taskBarColor));
    const barProgressStyles = generateStyles({
      backgroundColor: adjustColorBrightness(taskBarColor, { l: -15 }),
      borderRadius: barBorderRadius,
      width: `${this.task.progress}%`
    });
    const chartInstanceId = this.chartContext.getInstanceId();
    barTimeline.setAttribute("data-taskid", this.task.id);
    barTimeline.setAttribute("data-chart-instance", chartInstanceId);
    barProgress.setAttribute("style", barProgressStyles);
    barTimeline.setAttribute("style", barTimelineStyles);
    const startDate = dayjs(this.task.startTime);
    const endDate = dayjs(this.task.endTime);
    const startReadable = startDate.format("MMMM D, YYYY");
    const endReadable = endDate.format("MMMM D, YYYY");
    const startTs = startDate.valueOf();
    const endTs = endDate.valueOf();
    const durationDays2 = endDate.diff(startDate, "day");
    const { enableTaskDrag, enableTaskResize, enableTaskEdit } = this.options;
    const isResizable = enableTaskResize && this.task.type === TaskType.Task;
    const isInteractive = enableTaskDrag || isResizable;
    if (isInteractive || enableTaskEdit) {
      barTimeline.classList.add("bar-interactive");
    }
    if (isInteractive) {
      barTimeline.setAttribute("role", "slider");
      barTimeline.setAttribute("aria-label", `${this.task.name}: ${startReadable} to ${endReadable}`);
      barTimeline.setAttribute("aria-valuenow", startTs.toString());
      barTimeline.setAttribute("aria-valuemin", startTs.toString());
      barTimeline.setAttribute("aria-valuemax", endTs.toString());
      barTimeline.setAttribute("aria-valuetext", `${startReadable} to ${endReadable}, ${durationDays2} days`);
      barTimeline.setAttribute("aria-grabbed", "false");
      if (enableTaskDrag) {
        barTimeline.setAttribute("aria-dropeffect", "move");
      }
    } else {
      barTimeline.setAttribute("role", "progressbar");
      barTimeline.setAttribute(
        "aria-label",
        `${this.task.name}: ${startReadable} to ${endReadable}, ${this.task.progress}% complete`
      );
      barTimeline.setAttribute("aria-valuenow", this.task.progress.toString());
      barTimeline.setAttribute("aria-valuemin", "0");
      barTimeline.setAttribute("aria-valuemax", "100");
    }
    barTimeline.setAttribute("tabindex", "0");
    if (this.task.type !== TaskType.Milestone) {
      barTimeline.append(barLabel);
    }
    barTimeline.append(barProgress);
    this.setupTaskEdit(barTimeline, onUpdate);
    this.setupTooltip(barTimeline);
    this.setupInteractions(barTimeline, onUpdate);
    barTimeline.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        barTimeline.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      }
    });
    return barTimeline;
  }
  /**
   * Renders a thin baseline bar positioned below the actual bar, using the
   * planned (baseline) start/end dates. The actual bar shrinks via
   * `calculateHeight()` to leave room for the baseline bar beneath it.
   *
   * Returns null if baseline rendering is disabled or the task has no baseline.
   * The element carries `pointer-events: none` so it never interferes with
   * drag/resize interactions on the main bar.
   */
  drawBaselineBar() {
    if (!this.hasBaseline()) {
      return null;
    }
    const { barBorderRadius, barMargin, rowHeight } = this.options;
    const baselineColor = this.options.baseline.color;
    const taskBaseline = this.task.baseline;
    const baselineTask = {
      ...this.task,
      startTime: taskBaseline.start,
      endTime: taskBaseline.end,
      type: TaskType.Task
    };
    const left = Bar.calculateX(baselineTask, this.geometry, this.options);
    const width = Bar.calculateWidth(baselineTask, this.geometry, this.options);
    const actualBarHeight = this.calculateHeight();
    const top = barMargin + actualBarHeight + BASELINE_GAP + this.index * rowHeight;
    const baselineBar = createBox(this.chartContext, { className: "bar-baseline" });
    baselineBar.setAttribute("aria-hidden", "true");
    baselineBar.setAttribute("data-taskid-baseline", this.task.id);
    const styles = generateStyles({
      backgroundColor: baselineColor,
      borderRadius: barBorderRadius,
      cursor: "default",
      height: `${BASELINE_BAR_HEIGHT}px`,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`
    });
    baselineBar.setAttribute("style", styles);
    this.setupBaselineTooltip(baselineBar);
    return baselineBar;
  }
  getBarStyles(barBgColor) {
    const { barBackgroundColor, barBorderRadius, barMargin, barTextColor, milestoneColor, rowHeight } = this.options;
    const left = Bar.calculateX(this.task, this.geometry, this.options);
    const width = Bar.calculateWidth(this.task, this.geometry, this.options);
    const height = this.calculateHeight();
    const effectiveBarColor = barBgColor || barBackgroundColor;
    if (this.task.type === TaskType.Milestone) {
      const fillColor = this.task.barBackgroundColor || milestoneColor;
      return {
        backgroundColor: fillColor,
        borderRadius: "2px",
        color: barTextColor,
        height: `${height}px`,
        left: `${left}px`,
        top: `${rowHeight / 3 - barMargin / 2 + this.index * rowHeight}px`,
        transform: "rotate(45deg)",
        width: `${width}px`
      };
    }
    return {
      backgroundColor: effectiveBarColor,
      borderRadius: barBorderRadius,
      color: barTextColor,
      height: `${height}px`,
      left: `${left}px`,
      top: `${barMargin + this.index * rowHeight}px`,
      width: `${width}px`
    };
  }
  makeDraggable(barElement, onUpdate) {
    const dragManager = new BarDragManager(
      this.task.id,
      this.options,
      this.geometry.pixelsPerMs,
      this.chartContext,
      this.dataManager
    );
    dragManager.makeDraggable(barElement, onUpdate);
  }
  makeResizable(barElement, onUpdate) {
    const resizeManager = new BarResizeManager(
      this.task.id,
      this.options,
      this.geometry.pixelsPerMs,
      this.chartContext,
      this.dataManager
    );
    resizeManager.makeResizable(barElement, onUpdate);
  }
  makeProgressDraggable(barElement, handleEl, onUpdate) {
    const progressManager = new BarProgressManager(this.task.id, this.options, this.chartContext, this.dataManager);
    progressManager.makeProgressDraggable(barElement, handleEl, onUpdate);
  }
  cleanup() {
    if (this.tooltipHandler) {
      this.tooltipHandler.cleanup();
      this.tooltipHandler = null;
    }
  }
}
function escapeHtml(value) {
  if (value === null || value === void 0)
    return "";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function progressRingSvg(options) {
  const {
    value: rawValue,
    size = 28,
    strokeWidth = 3,
    progressColor = "#3B82F6",
    trackColor = "#E5E7EB",
    showLabel = true,
    labelColor
  } = options;
  const value = Math.max(0, Math.min(100, Number.isFinite(rawValue) ? rawValue : 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const dashOffset = circumference * (1 - value / 100);
  const labelHtml = showLabel ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="${Math.round(size * 0.32)}" font-weight="600" fill="${labelColor ? escapeHtml(labelColor) : "currentColor"}">${value}</text>` : "";
  return `<svg class="apexgantt-progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${value} percent complete" style="vertical-align:middle"><circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${escapeHtml(trackColor)}" stroke-width="${strokeWidth}" fill="none" /><circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${escapeHtml(progressColor)}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" transform="rotate(-90 ${cx} ${cy})" />` + labelHtml + `</svg>`;
}
var ColumnKey = /* @__PURE__ */ ((ColumnKey2) => {
  ColumnKey2["Duration"] = "duration";
  ColumnKey2["EndTime"] = "endTime";
  ColumnKey2["Name"] = "name";
  ColumnKey2["Progress"] = "progress";
  ColumnKey2["ProgressRing"] = "progressRing";
  ColumnKey2["StartTime"] = "startTime";
  ColumnKey2["Wbs"] = "wbs";
  return ColumnKey2;
})(ColumnKey || {});
const BUILT_IN_COLUMN_KEYS = new Set(Object.values(ColumnKey));
function isBuiltInColumnKey(key) {
  return BUILT_IN_COLUMN_KEYS.has(key);
}
const ColumnKeyTitleMap = {
  [
    "duration"
    /* Duration */
  ]: "Duration",
  [
    "endTime"
    /* EndTime */
  ]: "End",
  [
    "name"
    /* Name */
  ]: "Task Name",
  [
    "progress"
    /* Progress */
  ]: "Progress",
  [
    "progressRing"
    /* ProgressRing */
  ]: "Progress",
  [
    "startTime"
    /* StartTime */
  ]: "Start",
  [
    "wbs"
    /* Wbs */
  ]: "WBS"
};
const ColumnList = [
  {
    key: "name",
    title: ColumnKeyTitleMap[
      "name"
      /* Name */
    ],
    minWidth: "120px",
    flexGrow: 3
  },
  {
    key: "startTime",
    title: ColumnKeyTitleMap[
      "startTime"
      /* StartTime */
    ],
    minWidth: "70px",
    flexGrow: 1.5
  },
  {
    key: "duration",
    title: ColumnKeyTitleMap[
      "duration"
      /* Duration */
    ],
    minWidth: "50px",
    flexGrow: 1
  },
  {
    key: "progress",
    title: ColumnKeyTitleMap[
      "progress"
      /* Progress */
    ],
    minWidth: "50px",
    flexGrow: 1
  }
];
function generateGridTemplateColumns(columns) {
  return columns.map((col) => {
    const minWidth = col.minWidth || "30px";
    const flexGrow = col.flexGrow || 1;
    return `minmax(${minWidth}, ${flexGrow}fr)`;
  }).join(" ");
}
const MS_PER_DAY$4 = 864e5;
const MS_PER_HOUR$1 = 36e5;
const MS_PER_MINUTE$1 = 6e4;
function snapMsLocal(unit) {
  return unit === "minute" ? MS_PER_MINUTE$1 : unit === "hour" ? MS_PER_HOUR$1 : MS_PER_DAY$4;
}
function durationLabel(snap) {
  return snap.unit === "minute" ? "m" : snap.unit === "hour" ? "h" : "d";
}
function getTaskTextByColumn(task, columnKey, inputDateFormat, snap) {
  const taskColumnValue = task[columnKey];
  const effectiveStart = task.showSummaryBar ? task.summaryStart : task.startTime;
  const effectiveEnd = task.showSummaryBar ? task.summaryEnd : task.endTime;
  if (columnKey === "startTime") {
    return effectiveStart ? dayjs(effectiveStart).format(inputDateFormat) : "";
  }
  if (columnKey === "endTime") {
    return effectiveEnd ? dayjs(effectiveEnd).format(inputDateFormat) : "";
  }
  if (columnKey === "duration") {
    const effective = snap ?? { unit: "day", value: 1 };
    const suffix = durationLabel(effective);
    if (!effectiveStart || !effectiveEnd)
      return `0 ${suffix}`;
    const startMs = dayjs(effectiveStart).valueOf();
    const endMs = dayjs(effectiveEnd).valueOf();
    const stepMs = snapMsLocal(effective.unit) * Math.max(1, effective.value);
    const inclusiveBump = formatHasTime(inputDateFormat) ? 0 : stepMs;
    const units = Math.max(0, Math.round((endMs - startMs + inclusiveBump) / stepMs));
    return `${units} ${suffix}`;
  }
  if (columnKey === "progress") {
    const progress = task.progress ?? 0;
    return `${progress}%`;
  }
  if (columnKey === "progressRing") {
    return progressRingSvg({ value: task.progress ?? 0 });
  }
  if (columnKey === "wbs") {
    return task.wbs ?? "";
  }
  return taskColumnValue;
}
function getTaskRowElement(context, taskId) {
  const chartInstanceId = context.getInstanceId();
  const selector = `.tasks-container .tasks-data-row[data-taskid="${taskId}"][data-chart-instance="${chartInstanceId}"]`;
  const element = context.querySelector(selector);
  if (!element) {
    logger.warn(`[${chartInstanceId}] Task row element not found for task: ${taskId}`);
  }
  return element;
}
function getRowBackgroundColor(index, rowBackgroundColors) {
  if (!(rowBackgroundColors == null ? void 0 : rowBackgroundColors.length))
    return "transparent";
  return rowBackgroundColors[index % rowBackgroundColors.length];
}
function setTaskRowBackgroundColor(context, taskId, bgColor) {
  const taskElement = getTaskRowElement(context, taskId);
  const timelineElement = getBarRowElement(context, taskId);
  if (taskElement) {
    taskElement.style.backgroundColor = bgColor;
  }
  if (timelineElement) {
    timelineElement.style.backgroundColor = bgColor;
  }
}
const getTaskElements = (context, taskId) => {
  const taskRow = getTaskRowElement(context, taskId);
  const taskBar = getBarElement(context, taskId);
  const taskBarRow = getBarRowElement(context, taskId);
  return {
    taskBar,
    taskBarRow,
    taskRow
  };
};
const updateTaskInUI = (context, dataManager, taskId, updates, options, geometry) => {
  const { taskBar, taskBarRow, taskRow } = getTaskElements(context, taskId);
  if (!taskRow || !taskBar)
    return;
  const updatedTask = dataManager.updateTask(taskId, updates);
  if (!updatedTask)
    return;
  const cells = taskRow.querySelectorAll(".tasks-data-cell");
  cells.forEach((cell) => {
    const columnId = cell.getAttribute("data-columnid");
    if (columnId) {
      cell.innerHTML = getTaskTextByColumn(updatedTask, columnId, options.inputDateFormat, {
        unit: options.snapUnit,
        value: options.snapValue
      });
      if (columnId === "name") {
        if (dataManager.hasChildren(taskId)) {
          const chevron = context.createElement("span");
          chevron.className = `task-toggle-icon ${updatedTask.collapsed ? "collapsed" : "expanded"}`;
          chevron.addEventListener("click", () => {
            dataManager.toggleTask(taskId);
          });
          cell.prepend(chevron);
        } else {
          const spacer = context.createElement("span");
          spacer.className = "task-toggle-icon-blank";
          cell.prepend(spacer);
        }
      }
    }
  });
  if (updates.rowBackgroundColor && taskBarRow) {
    taskRow.style.backgroundColor = updates.rowBackgroundColor;
    taskBarRow.style.backgroundColor = updates.rowBackgroundColor;
  }
  if (updates.barBackgroundColor) {
    taskBar.style.backgroundColor = updates.barBackgroundColor;
  }
  if (updates.startTime || updates.endTime) {
    const left = Bar.calculateX(updatedTask, geometry, options);
    const width = Bar.calculateWidth(updatedTask, geometry, options);
    taskBar.style.left = `${left}px`;
    taskBar.style.width = `${width}px`;
  }
  if (updates.progress !== void 0) {
    const progressBar = taskBar.querySelector(".bar-timeline-progress");
    if (progressBar) {
      progressBar.style.width = `${updates.progress}%`;
    }
    if (updates.barBackgroundColor) {
      progressBar.style.backgroundColor = adjustColorBrightness(updates.barBackgroundColor, { l: -15 });
    }
    const progressHandle = taskBar.querySelector(".bar-progress-handle");
    if (progressHandle) {
      progressHandle.style.left = `${updates.progress}%`;
      progressHandle.setAttribute("aria-valuenow", String(Math.round(updates.progress)));
    }
    const progressLabel = taskBar.querySelector(".bar-progress-handle-label");
    if (progressLabel) {
      progressLabel.style.left = `${updates.progress}%`;
      progressLabel.textContent = `${Math.round(updates.progress)}%`;
    }
  }
  if (updates.name !== void 0) {
    const label = taskBar.querySelector(".bar-label");
    if (label) {
      applyBarLabelContent(label, options.barLabel, updatedTask);
    }
  }
  dataManager.updateDependencyArrows(taskId, context);
};
const refreshSummaryAncestors = (context, dataManager, taskId, options, geometry) => {
  const chartInstanceId = context.getInstanceId();
  const start = dataManager.getTaskById(taskId);
  if (!start)
    return;
  let cursor = start.parentId ? dataManager.getTaskById(start.parentId) ?? null : null;
  while (cursor) {
    if (cursor.showSummaryBar) {
      const ancestor = cursor;
      const rowSel = `.tasks-container .tasks-data-row[data-taskid="${ancestor.id}"][data-chart-instance="${chartInstanceId}"]`;
      const row = context.querySelector(rowSel);
      if (row) {
        row.querySelectorAll(".tasks-data-cell").forEach((cell) => {
          const columnId = cell.getAttribute("data-columnid");
          if (!columnId || columnId === "name")
            return;
          cell.innerHTML = getTaskTextByColumn(ancestor, columnId, options.inputDateFormat, {
            unit: options.snapUnit,
            value: options.snapValue
          });
        });
      }
      const barSel = `.bar-container .bar-timeline[data-taskid="${ancestor.id}"][data-chart-instance="${chartInstanceId}"]`;
      const bar = context.querySelector(barSel);
      if (bar) {
        const left = Bar.calculateX(ancestor, geometry, options);
        const width = Bar.calculateWidth(ancestor, geometry, options);
        bar.style.left = `${left}px`;
        bar.style.width = `${width}px`;
        const progress = ancestor.progress ?? 0;
        const baseColor = ancestor.barBackgroundColor || options.summaryBarColor;
        const progressColor = adjustColorBrightness(baseColor, { l: -15 });
        const leftCapColor = progress > 0 ? progressColor : baseColor;
        const rightCapColor = progress >= 100 ? progressColor : baseColor;
        bar.style.setProperty("--summary-bar-color", baseColor);
        bar.style.setProperty("--summary-cap-left-color", leftCapColor);
        bar.style.setProperty("--summary-cap-right-color", rightCapColor);
        let progressBar = bar.querySelector(".bar-timeline-progress");
        if (progress > 0) {
          if (!progressBar) {
            progressBar = context.createElement("div");
            progressBar.className = "bar-timeline-progress";
            bar.appendChild(progressBar);
          }
          progressBar.style.backgroundColor = progressColor;
          progressBar.style.width = `${progress}%`;
        } else if (progressBar) {
          progressBar.remove();
        }
      }
    }
    if (cursor.showSummaryBar) {
      dataManager.updateDependencyArrows(cursor.id, context);
    }
    cursor = cursor.parentId ? dataManager.getTaskById(cursor.parentId) ?? null : null;
  }
};
const MS_PER_DAY$3 = 864e5;
const MS_PER_HOUR = 36e5;
const MS_PER_MINUTE = 6e4;
function snapUnitMs(unit) {
  return unit === "minute" ? MS_PER_MINUTE : unit === "hour" ? MS_PER_HOUR : MS_PER_DAY$3;
}
const DATA_CHART_INSTANCE$2 = "data-chart-instance";
var TaskType = /* @__PURE__ */ ((TaskType2) => {
  TaskType2["Milestone"] = "milestone";
  TaskType2["Task"] = "task";
  return TaskType2;
})(TaskType || {});
function normaliseDependency(raw) {
  if (typeof raw === "string") {
    return { taskId: raw, type: "FS", lag: 0 };
  }
  return { taskId: raw.taskId, type: raw.type ?? "FS", lag: raw.lag ?? 0 };
}
class Tasks {
  constructor(options, chartContext, dataManager, selectionManager, commitInlineEdit, columnRenderManager) {
    this.options = options;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.selectionManager = selectionManager;
    this.commitInlineEdit = commitInlineEdit;
    this.columnRenderManager = columnRenderManager;
    this.activeInlineEditor = null;
    this.selectionEnabled = options.enableSelection;
    this.showCheckbox = options.enableSelection && options.showCheckboxColumn;
    this.inlineEditEnabled = options.enableInlineEdit && !!commitInlineEdit;
    this.effectiveColumnList = this.mergeColumnConfig();
    this.injectDynamicColumnStyles();
  }
  /**
   * Merges user column config with defaults.
   * When columnConfig is provided, it is authoritative: its order determines
   * render order and only its columns are shown. Each entry is merged with
   * defaults so callers only need to specify overrides.
   * Items with `visible: false` are filtered out.
   * Falls back to the full default list when the result would be empty.
   */
  mergeColumnConfig() {
    if (!this.options.columnConfig || this.options.columnConfig.length === 0) {
      return ColumnList;
    }
    const merged = this.options.columnConfig.map((userCol) => {
      const defaultCol = ColumnList.find((col) => col.key === userCol.key);
      return defaultCol ? { ...defaultCol, ...userCol } : userCol;
    });
    const visible = merged.filter((col) => col.visible !== false);
    if (visible.length === 0) {
      logger.warn("columnConfig resulted in zero visible columns — falling back to defaults");
      return ColumnList;
    }
    return visible;
  }
  /**
   * Dynamic CSS for column widths based on configuration
   */
  injectDynamicColumnStyles() {
    const gridTemplate = generateGridTemplateColumns(this.effectiveColumnList);
    const checkboxCol = this.showCheckbox ? "28px " : "";
    const chartInstanceId = this.chartContext.getInstanceId();
    const dynamicStyles = `
      .tasks-container .tasks-header[data-chart-instance="${chartInstanceId}"] .tasks-header-row {
        grid-template-columns: ${checkboxCol}${gridTemplate};
      }

      .tasks-container .tasks-data-row[data-chart-instance="${chartInstanceId}"] {
        grid-template-columns: ${checkboxCol}${gridTemplate};
      }
    `;
    this.chartContext.injectStyles(dynamicStyles, `tasks-dynamic-columns-${chartInstanceId}`, {
      priority: "high",
      force: true
    });
  }
  generateBody(tasks, reRender, virtualRange) {
    const bodyContainer = createBox(this.chartContext, { className: "tasks-data-container" });
    const totalTasks = virtualRange ? virtualRange.allTasks : tasks;
    bodyContainer.setAttribute("role", "treegrid");
    bodyContainer.setAttribute("aria-label", this.options.taskListAriaLabel ?? "Gantt task list");
    bodyContainer.setAttribute("aria-rowcount", totalTasks.length.toString());
    if (virtualRange) {
      this.generateRowsVirtualized(totalTasks, bodyContainer, reRender, virtualRange.range, virtualRange.rowHeight);
    } else {
      this.generateRows(tasks, bodyContainer, reRender);
    }
    return bodyContainer;
  }
  generateHeader(headerList) {
    const headerContainer = createBox(this.chartContext, { className: "tasks-header" });
    const headerRow = createBox(this.chartContext, { className: "tasks-header-row" });
    const { rowHeight } = this.options;
    const chartInstanceId = this.chartContext.getInstanceId();
    headerContainer.setAttribute(DATA_CHART_INSTANCE$2, chartInstanceId);
    if (this.showCheckbox) {
      const checkboxCell = createBox(this.chartContext, { className: "tasks-header-cell gantt-checkbox-cell" });
      checkboxCell.style.height = `${rowHeight * 2}px`;
      const checkbox = this.chartContext.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "gantt-select-all-checkbox";
      checkbox.setAttribute("aria-label", "Select all tasks");
      checkbox.addEventListener("change", () => {
        if (!this.selectionManager)
          return;
        if (checkbox.checked) {
          this.selectionManager.selectAll();
        } else {
          this.selectionManager.clearSelection();
        }
      });
      checkboxCell.append(checkbox);
      headerRow.append(checkboxCell);
    }
    headerList.forEach((header) => {
      const headerCell = createBox(this.chartContext, {
        className: "tasks-header-cell",
        content: header
      });
      headerCell.style.height = `${rowHeight * 2}px`;
      headerCell.style.color = "var(--text-color)";
      headerRow.append(headerCell);
    });
    headerContainer.append(headerRow);
    headerContainer.style.background = "var(--header-bg-color)";
    return headerContainer;
  }
  /**
   * Whether a given (task, column) pair can be inline-edited.
   * - Disabled entirely when `enableInlineEdit` is off or no commit callback is wired.
   * - Summary bars: only `name` is editable (dates/duration/progress are derived).
   * - Milestones: only `name` and `startTime` are editable (no end/duration/progress).
   * - `EndTime` column: only editable when both start and end are present.
   */
  isCellEditable(task, key) {
    if (!this.inlineEditEnabled)
      return false;
    if (task.showSummaryBar && this.dataManager.hasChildren(task.id)) {
      return key === ColumnKey.Name;
    }
    if (task.type === "milestone") {
      return key === ColumnKey.Name || key === ColumnKey.StartTime;
    }
    return key === ColumnKey.Name || key === ColumnKey.StartTime || key === ColumnKey.EndTime || key === ColumnKey.Duration || key === ColumnKey.Progress;
  }
  /**
   * Wire double-click activation to open the inline editor. We capture only
   * the task ID — the live task is re-read from `dataManager` at open time so
   * the editor never seeds itself from a stale closure (the cell element and
   * its listeners survive `updateTaskInUI`'s `innerHTML` rewrite).
   */
  attachInlineEditHandler(cell, taskId, key) {
    cell.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      const task = this.dataManager.getTaskById(taskId);
      if (!task)
        return;
      this.openInlineEditor(cell, task, key);
    });
  }
  /** Replace the cell content with an `<input>` and wire commit/cancel handlers. */
  openInlineEditor(cell, task, key) {
    if (this.activeInlineEditor) {
      this.activeInlineEditor.blur();
    }
    const input = this.chartContext.createElement("input");
    input.className = "inline-edit-input";
    this.configureEditorInput(input, task, key);
    const originalHTML = cell.innerHTML;
    cell.innerHTML = "";
    cell.appendChild(input);
    let committed = false;
    const commit = () => {
      var _a;
      if (committed)
        return;
      committed = true;
      const updates = this.parseEditorValue(input, task, key);
      this.activeInlineEditor = null;
      if (!updates) {
        cell.innerHTML = originalHTML;
        return;
      }
      (_a = this.commitInlineEdit) == null ? void 0 : _a.call(this, task.id, updates);
    };
    const cancel = () => {
      if (committed)
        return;
      committed = true;
      this.activeInlineEditor = null;
      cell.innerHTML = originalHTML;
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
      if (e.key.startsWith("Arrow"))
        e.stopPropagation();
    });
    input.addEventListener("blur", commit);
    this.activeInlineEditor = input;
    input.focus();
    if (input.type === "text" || input.type === "number") {
      input.select();
    }
  }
  /** Configure input type, value, and constraints based on the column being edited. */
  configureEditorInput(input, task, key) {
    const fmt = this.options.inputDateFormat;
    const hasTime = formatHasTime(fmt);
    const dateInputType = hasTime ? "datetime-local" : "date";
    const dateInputFormat = hasTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD";
    switch (key) {
      case ColumnKey.Name:
        input.type = "text";
        input.value = task.name;
        break;
      case ColumnKey.StartTime:
        input.type = dateInputType;
        input.value = task.startTime ? dayjs(task.startTime, fmt).format(dateInputFormat) : "";
        break;
      case ColumnKey.EndTime:
        input.type = dateInputType;
        input.value = task.endTime ? dayjs(task.endTime, fmt).format(dateInputFormat) : "";
        break;
      case ColumnKey.Duration: {
        input.type = "number";
        input.min = "1";
        input.step = "1";
        input.value = String(this.computeDurationInSnapUnits(task));
        break;
      }
      case ColumnKey.Progress:
        input.type = "number";
        input.min = "0";
        input.max = "100";
        input.step = "1";
        input.value = String(task.progress ?? 0);
        break;
    }
  }
  /**
   * Duration as integer count of snap units between start and end. For
   * day-only formats the end is inclusive (`+1` snap unit when snap=day).
   */
  computeDurationInSnapUnits(task) {
    const fmt = this.options.inputDateFormat;
    const { snapUnit, snapValue } = this.options;
    const start = task.startTime ? dayjs(task.startTime, fmt) : null;
    const end = task.endTime ? dayjs(task.endTime, fmt) : null;
    if (!start || !end || !start.isValid() || !end.isValid())
      return 1;
    const ms = snapUnitMs(snapUnit) * Math.max(1, snapValue);
    const inclusiveBump = formatHasTime(fmt) ? 0 : ms;
    const spanMs = end.valueOf() - start.valueOf() + inclusiveBump;
    return Math.max(1, Math.round(spanMs / ms));
  }
  /**
   * Convert the input's raw value into a partial Task update. Returns `null`
   * when the value is unchanged, empty, or fails validation — the editor is
   * silently cancelled rather than surfacing errors inline.
   */
  parseEditorValue(input, task, key) {
    const fmt = this.options.inputDateFormat;
    const hasTime = formatHasTime(fmt);
    const inputFmt = hasTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD";
    const { snapUnit, snapValue } = this.options;
    const ms = snapUnitMs(snapUnit) * Math.max(1, snapValue);
    switch (key) {
      case ColumnKey.Name: {
        const name = input.value.trim();
        if (!name || name === task.name)
          return null;
        return { name };
      }
      case ColumnKey.StartTime: {
        if (!input.value)
          return null;
        const next = dayjs(input.value, inputFmt);
        if (!next.isValid())
          return null;
        const formatted = next.format(fmt);
        if (formatted === task.startTime)
          return null;
        if (task.type !== "milestone" && task.endTime) {
          const oldStart = dayjs(task.startTime, fmt);
          const oldEnd = dayjs(task.endTime, fmt);
          if (oldStart.isValid() && oldEnd.isValid()) {
            const durationMs = oldEnd.valueOf() - oldStart.valueOf();
            return { startTime: formatted, endTime: next.add(durationMs, "millisecond").format(fmt) };
          }
        }
        return { startTime: formatted };
      }
      case ColumnKey.EndTime: {
        if (!input.value)
          return null;
        const next = dayjs(input.value, inputFmt);
        if (!next.isValid())
          return null;
        const start = dayjs(task.startTime, fmt);
        if (start.isValid() && next.isBefore(start))
          return null;
        const formatted = next.format(fmt);
        if (formatted === task.endTime)
          return null;
        return { endTime: formatted };
      }
      case ColumnKey.Duration: {
        const units = parseInt(input.value, 10);
        if (!Number.isFinite(units) || units < 1)
          return null;
        const start = dayjs(task.startTime, fmt);
        if (!start.isValid())
          return null;
        const offset = (hasTime ? units : units - 1) * ms;
        const newEnd = start.add(offset, "millisecond").format(fmt);
        if (newEnd === task.endTime)
          return null;
        return { endTime: newEnd };
      }
      case ColumnKey.Progress: {
        const raw = parseInt(input.value, 10);
        if (!Number.isFinite(raw))
          return null;
        const progress = Math.max(0, Math.min(100, raw));
        if (progress === (task.progress ?? 0))
          return null;
        return { progress };
      }
      default:
        return null;
    }
  }
  generateRow(task, reRender, rowIndex) {
    var _a;
    const row = createBox(this.chartContext, { className: "tasks-data-row" });
    const { rowHeight } = this.options;
    const chartInstanceId = this.chartContext.getInstanceId();
    row.setAttribute("data-taskid", task.id);
    row.setAttribute(DATA_CHART_INSTANCE$2, chartInstanceId);
    row.style.height = `${rowHeight}px`;
    row.setAttribute("role", "row");
    row.setAttribute("aria-rowindex", rowIndex.toString());
    row.setAttribute("aria-level", (task.level ?? 1).toString());
    row.setAttribute("aria-selected", "false");
    row.setAttribute("tabindex", rowIndex === 1 ? "0" : "-1");
    if (this.dataManager.hasChildren(task.id)) {
      row.setAttribute("aria-expanded", task.collapsed ? "false" : "true");
    }
    if (this.showCheckbox) {
      const checkboxCell = createBox(this.chartContext, { className: "tasks-data-cell gantt-checkbox-cell" });
      checkboxCell.style.height = `${rowHeight}px`;
      const checkbox = this.chartContext.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "gantt-selection-checkbox";
      checkbox.checked = ((_a = this.selectionManager) == null ? void 0 : _a.isSelected(task.id)) ?? false;
      checkbox.setAttribute("aria-label", `Select ${task.name}`);
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!this.selectionManager)
          return;
        this.selectionManager.handleClick(task.id, {
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey
        });
      });
      checkboxCell.append(checkbox);
      row.append(checkboxCell);
    }
    if (this.selectionEnabled && this.selectionManager) {
      const sm = this.selectionManager;
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("gantt-selection-checkbox"))
          return;
        if (e.target.classList.contains("task-toggle-icon"))
          return;
        sm.handleClick(task.id, {
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey
        });
        row.focus();
      });
      row.style.cursor = "pointer";
    }
    let colIndex = 1;
    this.effectiveColumnList.forEach((column) => {
      const { key } = column;
      const builtInKey = isBuiltInColumnKey(key) ? key : null;
      const cell = createBox(this.chartContext, {
        className: "tasks-data-cell",
        content: builtInKey ? getTaskTextByColumn(task, builtInKey, this.options.inputDateFormat, {
          unit: this.options.snapUnit,
          value: this.options.snapValue
        }) : ""
      });
      cell.setAttribute("data-columnid", key);
      cell.setAttribute(DATA_CHART_INSTANCE$2, chartInstanceId);
      cell.style.height = `${rowHeight}px`;
      cell.style.color = "var(--text-color)";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", colIndex.toString());
      const editable = builtInKey ? this.isCellEditable(task, builtInKey) : false;
      cell.setAttribute("aria-readonly", editable ? "false" : "true");
      if (editable && builtInKey) {
        cell.classList.add("inline-editable");
        this.attachInlineEditHandler(cell, task.id, builtInKey);
      }
      colIndex++;
      if (!builtInKey && column.render && this.columnRenderManager) {
        const ctx = {
          task,
          options: this.options,
          rowIndex: rowIndex - 1,
          isSummary: !!task.showSummaryBar && this.dataManager.hasChildren(task.id),
          isMilestone: task.type === "milestone"
          /* Milestone */
        };
        this.columnRenderManager.dispatch(column.render, ctx, cell);
      }
      if (builtInKey === ColumnKey.Name) {
        cell.style.paddingLeft = `${(task.level ?? 0) * 15}px`;
        cell.style.textAlign = "left";
        cell.innerHTML = "";
        if (this.dataManager.hasChildren(task.id)) {
          const chevron = createElement(this.chartContext, "span", {
            className: `task-toggle-icon ${task.collapsed ? "collapsed" : "expanded"}`
          });
          chevron.setAttribute("role", "button");
          chevron.setAttribute("tabindex", "0");
          chevron.setAttribute("aria-label", task.collapsed ? `Expand ${task.name}` : `Collapse ${task.name}`);
          const toggle = () => {
            this.dataManager.toggleTask(task.id);
            reRender();
          };
          chevron.addEventListener("click", toggle);
          chevron.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          });
          cell.append(chevron);
        } else {
          const spacer = createElement(this.chartContext, "span", {
            className: "task-toggle-icon-blank"
          });
          cell.append(spacer);
        }
        const nameSpan = createElement(this.chartContext, "span", {
          textContent: task.name
        });
        cell.append(nameSpan);
      }
      row.append(cell);
    });
    return row;
  }
  generateRows(tasks, bodyContainer, reRender) {
    tasks.forEach((task, index) => {
      const row = this.generateRow(task, reRender, index + 1);
      bodyContainer.appendChild(row);
    });
    this.fillEmptyRows(bodyContainer, tasks.length, reRender);
    return bodyContainer;
  }
  /**
   * Render only the rows within the given visible range, with spacer divs
   * above and below to maintain correct scroll height.
   */
  generateRowsVirtualized(allTasks, bodyContainer, reRender, range, rowHeight) {
    const { startIndex, endIndex } = range;
    const totalRows = allTasks.length;
    const topSpacer = this.chartContext.createElement("div");
    topSpacer.className = "virtualizer-top-spacer";
    topSpacer.style.height = `${startIndex * rowHeight}px`;
    bodyContainer.appendChild(topSpacer);
    const visibleTasks = allTasks.slice(startIndex, endIndex + 1);
    visibleTasks.forEach((task, i) => {
      const absoluteIndex = startIndex + i;
      const row = this.generateRow(task, reRender, absoluteIndex + 1);
      bodyContainer.appendChild(row);
    });
    const bottomHeight = Math.max(0, (totalRows - 1 - endIndex) * rowHeight);
    const bottomSpacer = this.chartContext.createElement("div");
    bottomSpacer.className = "virtualizer-bottom-spacer";
    bottomSpacer.style.height = `${bottomHeight}px`;
    bodyContainer.appendChild(bottomSpacer);
    return bodyContainer;
  }
  fillEmptyRows(bodyContainer, existingRowCount, _reRender) {
    const ganttContainer = this.chartContext.querySelector(".gantt-container");
    if (!ganttContainer)
      return;
    const containerHeight = ganttContainer.clientHeight;
    const rowHeight = this.options.rowHeight;
    const headerHeight = rowHeight * 2;
    const availableHeight = containerHeight - headerHeight;
    const totalRowsNeeded = Math.floor(availableHeight / rowHeight);
    const emptyRowsNeeded = Math.max(0, totalRowsNeeded - existingRowCount);
    for (let i = 0; i < emptyRowsNeeded; i++) {
      const emptyRow = this.generateEmptyRow(i);
      bodyContainer.appendChild(emptyRow);
    }
  }
  generateEmptyRow(index) {
    const row = createBox(this.chartContext, { className: "tasks-data-row tasks-empty-row" });
    const { rowHeight } = this.options;
    const chartInstanceId = this.chartContext.getInstanceId();
    row.setAttribute("data-taskid", `empty-${index}`);
    row.setAttribute(DATA_CHART_INSTANCE$2, chartInstanceId);
    row.style.height = `${rowHeight}px`;
    this.effectiveColumnList.forEach(({ key }) => {
      const cell = createBox(this.chartContext, {
        className: "tasks-data-cell",
        content: ""
      });
      cell.setAttribute("data-columnid", key);
      cell.setAttribute(DATA_CHART_INSTANCE$2, chartInstanceId);
      cell.style.height = `${rowHeight}px`;
      cell.style.color = "var(--text-color)";
      row.append(cell);
    });
    return row;
  }
  render(reRender, virtualRange) {
    const headerRow = this.generateHeader(this.effectiveColumnList.map((col) => col.title));
    const tasks = virtualRange ? virtualRange.allTasks.slice(virtualRange.range.startIndex, virtualRange.range.endIndex + 1) : this.dataManager.getFlatVisibleTasks();
    const dataRows = this.generateBody(tasks, reRender, virtualRange);
    return [headerRow, dataRows];
  }
}
const MS_PER_DAY$2 = 864e5;
const AVG_DAYS_PER_WEEK = 7;
const DEFAULT_PIXELS_PER_MS = 180 / (AVG_DAYS_PER_WEEK * MS_PER_DAY$2);
function toMs(value) {
  if (value == null)
    return dayjs().valueOf();
  if (typeof value === "number")
    return value;
  if (value instanceof Date)
    return value.getTime();
  if (typeof value === "string")
    return dayjs(value).valueOf();
  return value.valueOf();
}
class TimelineGeometry {
  constructor(origin, pixelsPerMs) {
    this.origin = origin;
    this.pixelsPerMs = pixelsPerMs;
  }
  /** Pixel offset of `date` from the timeline origin. */
  xForDate(date) {
    return (toMs(date) - this.origin.valueOf()) * this.pixelsPerMs;
  }
  /** Pixel width spanning `[start, end]` (end-exclusive at ms granularity). */
  widthForRange(start, end) {
    return (toMs(end) - toMs(start)) * this.pixelsPerMs;
  }
  /** Date corresponding to a pixel offset from the origin. */
  dateForX(px) {
    return dayjs(this.origin.valueOf() + px / this.pixelsPerMs);
  }
  /** Pixels in one day at the current scale. */
  get pixelsPerDay() {
    return this.pixelsPerMs * MS_PER_DAY$2;
  }
  /** Inverse: how many ms one pixel represents. */
  get msPerPixel() {
    return 1 / this.pixelsPerMs;
  }
}
const MS_PER_DAY$1 = 864e5;
const QUARTER_MONTHS = {
  1: ["Jan", "Feb", "Mar"],
  2: ["Apr", "May", "Jun"],
  3: ["Jul", "Aug", "Sep"],
  4: ["Oct", "Nov", "Dec"]
};
const TIERS = {
  minute: {
    id: "minute",
    unit: "minute",
    step: 15,
    msPerCell: 15 * 6e4,
    parent: "hour",
    formats: {
      sub: [
        { minWidth: 60, format: (d) => d.format("HH:mm") },
        { minWidth: 0, format: (d) => d.format("mm") }
      ],
      top: [
        { minWidth: 60, format: (d) => d.format("HH:mm") },
        { minWidth: 0, format: (d) => d.format("mm") }
      ]
    }
  },
  hour: {
    id: "hour",
    unit: "hour",
    step: 1,
    msPerCell: 36e5,
    parent: "day",
    formats: {
      sub: [
        { minWidth: 80, format: (d) => d.format("h A") },
        { minWidth: 30, format: (d) => d.format("HH") },
        { minWidth: 0, format: (d) => d.format("h") }
      ],
      top: [
        { minWidth: 180, format: (d) => d.format("ddd DD MMM, h A") },
        { minWidth: 110, format: (d) => d.format("DD MMM, h A") },
        { minWidth: 60, format: (d) => d.format("h A") },
        { minWidth: 0, format: (d) => d.format("HH") }
      ]
    }
  },
  day: {
    id: "day",
    unit: "day",
    step: 1,
    msPerCell: MS_PER_DAY$1,
    parent: "month",
    formats: {
      sub: [
        { minWidth: 80, format: (d) => d.format("DD MMM") },
        { minWidth: 30, format: (d) => d.format("DD") },
        { minWidth: 0, format: (d) => d.format("dd").charAt(0) }
      ],
      top: [
        { minWidth: 150, format: (d) => d.format("ddd DD MMM YYYY") },
        { minWidth: 100, format: (d) => d.format("ddd DD MMM") },
        { minWidth: 60, format: (d) => d.format("DD MMM") },
        { minWidth: 0, format: (d) => d.format("DD/MM") }
      ]
    }
  },
  week: {
    id: "week",
    unit: "week",
    step: 1,
    msPerCell: 7 * MS_PER_DAY$1,
    parent: "month",
    formats: {
      sub: [
        { minWidth: 220, format: (d) => `#${d.week()}, ${d.day(0).format("DD MMM")} - ${d.day(6).format("DD MMM")}` },
        { minWidth: 140, format: (d) => `Wk ${d.week()}, ${d.day(0).format("DD MMM")}` },
        { minWidth: 100, format: (d) => d.day(0).format("DD MMM") },
        { minWidth: 0, format: (d) => `${d.week()}` }
      ],
      top: [
        { minWidth: 220, format: (d) => `#${d.week()}, ${d.day(0).format("DD MMM YYYY")}` },
        { minWidth: 120, format: (d) => `Wk ${d.week()}, ${d.day(0).format("DD MMM")}` },
        { minWidth: 0, format: (d) => `Wk ${d.week()}` }
      ]
    }
  },
  month: {
    id: "month",
    unit: "month",
    step: 1,
    msPerCell: 30.4375 * MS_PER_DAY$1,
    parent: "year",
    formats: {
      sub: [
        { minWidth: 110, format: (d) => d.format("MMMM") },
        { minWidth: 60, format: (d) => d.format("MMM") },
        { minWidth: 0, format: (d) => d.format("M") }
      ],
      top: [
        { minWidth: 130, format: (d) => d.format("MMMM YYYY") },
        { minWidth: 80, format: (d) => d.format("MMM YYYY") },
        { minWidth: 50, format: (d) => d.format("MMM") },
        { minWidth: 0, format: (d) => d.format("MM/YY") }
      ]
    }
  },
  quarter: {
    id: "quarter",
    // dayjs `add(n, 'quarter')` requires the quarterOfYear plugin — already loaded.
    unit: "quarter",
    step: 1,
    msPerCell: 91.3125 * MS_PER_DAY$1,
    parent: "year",
    formats: {
      sub: [
        {
          minWidth: 100,
          format: (d) => {
            const m = QUARTER_MONTHS[d.quarter()];
            return `#${d.quarter()} ${m[0]}-${m[2]}`;
          }
        },
        { minWidth: 50, format: (d) => `#${d.quarter()}` },
        { minWidth: 0, format: (d) => `Q${d.quarter()}` }
      ],
      top: [
        {
          minWidth: 140,
          format: (d) => {
            const m = QUARTER_MONTHS[d.quarter()];
            return `#${d.quarter()} ${m[0]}-${m[2]} ${d.format("YYYY")}`;
          }
        },
        { minWidth: 80, format: (d) => `#${d.quarter()} ${d.format("YYYY")}` },
        { minWidth: 0, format: (d) => `Q${d.quarter()}` }
      ]
    }
  },
  year: {
    id: "year",
    unit: "year",
    step: 1,
    msPerCell: 365.25 * MS_PER_DAY$1,
    parent: null,
    formats: {
      sub: [
        { minWidth: 80, format: (d) => d.format("YYYY") },
        { minWidth: 40, format: (d) => `'${d.format("YY")}` },
        { minWidth: 0, format: (d) => d.format("YY") }
      ],
      top: [{ minWidth: 0, format: (d) => d.format("YYYY") }]
    }
  }
};
const TIER_ORDER = ["minute", "hour", "day", "week", "month", "quarter", "year"];
const MIN_SUB_PX = 80;
const MIN_TOP_PX = 50;
function selectTiers(pixelsPerMs) {
  let sub = TIERS.year;
  for (const id of TIER_ORDER) {
    const tier = TIERS[id];
    if (tier.msPerCell * pixelsPerMs >= MIN_SUB_PX) {
      sub = tier;
      break;
    }
  }
  let top = null;
  if (sub.parent) {
    const parent = TIERS[sub.parent];
    if (parent.msPerCell * pixelsPerMs >= MIN_TOP_PX) {
      top = parent;
    }
  }
  return { top, sub };
}
function alignToStep(d, tier) {
  const aligned = d.startOf(tier.unit);
  if (tier.step <= 1)
    return aligned;
  if (tier.unit === "minute") {
    return aligned.minute(Math.floor(aligned.minute() / tier.step) * tier.step);
  }
  return aligned;
}
function pickFormat(candidates, cellWidth) {
  for (const c of candidates) {
    if (cellWidth >= c.minWidth)
      return c.format;
  }
  return candidates[candidates.length - 1].format;
}
function tileCells(timelineStart, timelineEndExclusive, tier, position, geometry) {
  const cells = [];
  const startMs = timelineStart.valueOf();
  const endMs = timelineEndExclusive.valueOf();
  const candidates = tier.formats[position];
  let cursor = alignToStep(timelineStart, tier);
  while (cursor.valueOf() < endMs) {
    const next = cursor.add(tier.step, tier.unit);
    const cellStartMs = Math.max(cursor.valueOf(), startMs);
    const cellEndMs = Math.min(next.valueOf(), endMs);
    if (cellEndMs > cellStartMs) {
      const width = (cellEndMs - cellStartMs) * geometry.pixelsPerMs;
      const formatFn = pickFormat(candidates, width);
      cells.push({ data: formatFn(cursor), width });
    }
    cursor = next;
  }
  return cells;
}
function timelineSpanForTier(projectStart, projectEnd, sub) {
  return [alignToStep(projectStart, sub), alignToStep(projectEnd, sub).add(sub.step, sub.unit)];
}
function renderTimelineHeader(projectStart, projectEnd, pixelsPerMs) {
  const tiers = selectTiers(pixelsPerMs);
  const span = timelineSpanForTier(projectStart, projectEnd, tiers.sub);
  const geometry = new TimelineGeometry(span[0], pixelsPerMs);
  const sub = tileCells(span[0], span[1], tiers.sub, "sub", geometry);
  const top = tiers.top ? tileCells(span[0], span[1], tiers.top, "top", geometry) : null;
  return { geometry, timelineSpan: span, top, sub, tiers };
}
dayjs.extend(minMax);
const parentNodeKey = "root";
class DataManager {
  constructor(tasks = []) {
    this.dependencies = [];
    this.taskMap = {};
    this.taskTree = {};
    this.arrowLinkInstanceId = null;
    this.userSetSummaryProgress = /* @__PURE__ */ new Set();
    this.setTasks(tasks);
  }
  buildTaskTree(tasks) {
    const taskTree = {
      [parentNodeKey]: []
    };
    tasks.forEach((task) => {
      var _a;
      this.taskMap[task.id] = task;
      if (!taskTree[task.id])
        taskTree[task.id] = [];
      if (task.parentId !== void 0 && !taskTree[task.parentId])
        taskTree[task.parentId] = [];
      if (task.dependency) {
        const { taskId, type, lag } = normaliseDependency(task.dependency);
        this.addDependency(taskId, task.id, type, lag);
      }
      if (task.parentId) {
        (_a = taskTree[task.parentId]) == null ? void 0 : _a.push(task.id);
      } else {
        taskTree[parentNodeKey].push(task.id);
      }
    });
    this.taskTree = taskTree;
  }
  applyShowSummaryBarDefaults() {
    Object.keys(this.taskTree).forEach((taskId) => {
      var _a;
      if (taskId === "root")
        return;
      const task = this.taskMap[taskId];
      if (!task)
        return;
      const hasChildren = ((_a = this.taskTree[taskId]) == null ? void 0 : _a.length) > 0;
      if (!task.startTime && !task.endTime && !hasChildren) {
        throw new Error(`Task "${taskId}" has no startTime/endTime and no children. Provide dates or add child tasks.`);
      }
      if (task.showSummaryBar !== false && hasChildren) {
        this.taskMap[taskId] = { ...task, showSummaryBar: true };
      }
    });
  }
  processLevel() {
    const traverseTasks = (tasks, level) => {
      tasks.forEach((task) => {
        this.taskMap[task.id] = {
          ...task,
          level
        };
        const children = this.taskTree[task.id].map((childId) => this.taskMap[childId]);
        if (Array.isArray(children)) {
          traverseTasks(children, level + 1);
        }
      });
    };
    traverseTasks(
      this.getTasks().filter((task) => !task.parentId),
      1
    );
  }
  /**
   * Assigns a Work Breakdown Structure code to every task based on its
   * position in the tree: `'1'`, `'1.1'`, `'1.2.1'`, `'2'`, etc. Walks from
   * the synthetic root so siblings are numbered in their current sort order.
   * Must be called after `buildTaskTree` and any sort/level pass that may
   * have reordered children.
   */
  processWbs() {
    const walk = (parentId, prefix) => {
      const childIds = this.taskTree[parentId] ?? [];
      childIds.forEach((childId, index) => {
        const wbs = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        const task = this.taskMap[childId];
        if (!task)
          return;
        this.taskMap[childId] = { ...task, wbs };
        walk(childId, wbs);
      });
    };
    walk(parentNodeKey, "");
  }
  sortTasksByDate(field) {
    const summaryField = field === "startTime" ? "summaryStart" : "summaryEnd";
    const sortFunction = (a, b) => {
      const aDate = a[field] || (a.showSummaryBar ? a[summaryField] : void 0);
      const bDate = b[field] || (b.showSummaryBar ? b[summaryField] : void 0);
      const aVal = aDate ? new Date(aDate).getTime() : Infinity;
      const bVal = bDate ? new Date(bDate).getTime() : Infinity;
      return aVal - bVal;
    };
    const sortRecursively = (tasks, parentId) => {
      tasks.sort(sortFunction);
      if (parentId) {
        this.taskTree[parentId] = tasks.map((t) => t.id);
      }
      tasks.forEach((task) => {
        const children = this.taskTree[task.id].map((id) => this.getTaskById(id)).filter((t) => t !== null);
        if (children && children.length > 0) {
          sortRecursively(children, task.id);
        }
      });
    };
    const nodes = this.taskTree[parentNodeKey].map((id) => this.getTaskById(id)).filter((t) => t !== null);
    sortRecursively(nodes, parentNodeKey);
  }
  validateTask(taskInput) {
    if (!taskInput.id) {
      throw new Error("Task must have an id");
    }
    if (taskInput.showSummaryBar || !taskInput.startTime && !taskInput.endTime) {
      return {
        ...taskInput,
        startTime: taskInput.startTime ?? "",
        endTime: taskInput.endTime ?? "",
        progress: taskInput.progress ?? 0,
        type: taskInput.type ?? TaskType.Task,
        level: 1
      };
    }
    if (taskInput.type === "milestone") {
      if (!taskInput.startTime) {
        throw new Error("Milestone must have an id and start date");
      }
    } else if (!taskInput.startTime || !taskInput.endTime) {
      throw new Error("Task must have an id, start, and end date");
    }
    return {
      ...taskInput,
      endTime: taskInput.endTime || taskInput.startTime,
      progress: taskInput.progress ?? 0,
      type: taskInput.type ?? TaskType.Task,
      level: 1
    };
  }
  computeSummaryDates() {
    const collectLeafDates = (taskId) => {
      const childIds = this.taskTree[taskId] || [];
      if (childIds.length === 0) {
        const task = this.taskMap[taskId];
        if ((task == null ? void 0 : task.startTime) && task.endTime) {
          return { starts: [dayjs(task.startTime)], ends: [dayjs(task.endTime)] };
        }
        return { ends: [], starts: [] };
      }
      const starts = [];
      const ends = [];
      childIds.forEach((childId) => {
        const child = this.taskMap[childId];
        if (!child)
          return;
        if (child.showSummaryBar) {
          const nested = collectLeafDates(childId);
          starts.push(...nested.starts);
          ends.push(...nested.ends);
        } else {
          if (child.startTime)
            starts.push(dayjs(child.startTime));
          if (child.endTime)
            ends.push(dayjs(child.endTime));
          const nested = collectLeafDates(childId);
          starts.push(...nested.starts);
          ends.push(...nested.ends);
        }
      });
      return { ends, starts };
    };
    Object.values(this.taskMap).forEach((task) => {
      if (!task.showSummaryBar)
        return;
      const { ends, starts } = collectLeafDates(task.id);
      if (starts.length === 0 || ends.length === 0)
        return;
      const summaryStart = dayjs.min(starts);
      const summaryEnd = dayjs.max(ends);
      this.taskMap[task.id] = {
        ...this.taskMap[task.id],
        summaryStart: summaryStart.format("YYYY-MM-DD"),
        summaryEnd: summaryEnd.format("YYYY-MM-DD")
      };
    });
  }
  /**
   * Computes progress for summary bars as a duration-weighted average of leaf
   * descendants. Recurses bottom-up so nested summaries roll up correctly.
   * Only overwrites progress when the user did not explicitly set one.
   */
  computeSummaryProgress() {
    const computeForTask = (taskId) => {
      const task = this.taskMap[taskId];
      if (!task)
        return { totalDuration: 0, weightedProgress: 0 };
      const childIds = this.taskTree[taskId] || [];
      if (childIds.length === 0) {
        if (!task.startTime || !task.endTime)
          return { totalDuration: 0, weightedProgress: 0 };
        const duration = Math.max(1, dayjs(task.endTime).diff(dayjs(task.startTime), "day") + 1);
        return { totalDuration: duration, weightedProgress: duration * (task.progress ?? 0) };
      }
      let totalDuration = 0;
      let weightedProgress = 0;
      childIds.forEach((childId) => {
        const sub = computeForTask(childId);
        totalDuration += sub.totalDuration;
        weightedProgress += sub.weightedProgress;
      });
      if (task.showSummaryBar && !this.userSetSummaryProgress.has(task.id) && totalDuration > 0) {
        this.taskMap[task.id] = {
          ...task,
          progress: Math.round(weightedProgress / totalDuration)
        };
      }
      return { totalDuration, weightedProgress };
    };
    (this.taskTree[parentNodeKey] || []).forEach((id) => computeForTask(id));
  }
  addDependency(fromId, toId, type = "FS", lag = 0) {
    this.dependencies.push({ fromId, toId, type, lag });
  }
  addTask(taskInput) {
    const validatedTask = this.validateTask(taskInput);
    this.taskMap[validatedTask.id] = validatedTask;
    this.buildTaskTree(this.getTasks());
    this.applyShowSummaryBarDefaults();
    this.computeSummaryDates();
    this.computeSummaryProgress();
    this.processWbs();
  }
  calculateProgress() {
    const tasks = this.getTasks().filter((task) => !!task.startTime && !!task.endTime);
    const totalDuration = tasks.reduce((sum, task) => sum + dayjs(task.endTime).diff(dayjs(task.startTime), "day"), 0);
    const completedDuration = tasks.reduce(
      (sum, task) => sum + task.progress / 100 * dayjs(task.endTime).diff(dayjs(task.startTime), "day"),
      0
    );
    return totalDuration ? completedDuration / totalDuration * 100 : 0;
  }
  /**
   * Returns the project's date span, padded by `add` sub-tier units at the end.
   * The sub-tier (day/week/month/quarter/year) is derived from `pixelsPerMs`.
   *
   * For empty task lists, returns a 30-cell default range starting today.
   */
  getDateRange(add = 0, pixelsPerMs) {
    const tasks = this.getTasks();
    const sub = selectTiers(pixelsPerMs).sub;
    const subUnit = sub.unit;
    const step = sub.step;
    if (tasks.length === 0) {
      const today = dayjs();
      const startDate = today.startOf(subUnit);
      const endDate = startDate.add((30 + add) * step, subUnit);
      return [startDate, endDate];
    }
    const startDates = tasks.filter((task) => !!task.startTime).map((task) => dayjs(task.startTime));
    const endDates = tasks.filter((task) => !!task.endTime).map((task) => dayjs(task.endTime));
    return [dayjs.min(startDates), dayjs.max(endDates).add(add * step, subUnit)];
  }
  getFlatSortedTasks(tasks, getAll = false) {
    let flatTasks = [];
    tasks.forEach((task) => {
      flatTasks.push(task);
      const children = this.taskTree[task.id].map((childId) => this.taskMap[childId]);
      if ((getAll || !task.collapsed) && Array.isArray(children)) {
        flatTasks = flatTasks.concat(this.getFlatSortedTasks(children, getAll));
      }
    });
    return flatTasks;
  }
  getFlatTasks() {
    return this.getFlatSortedTasks(
      this.taskTree[parentNodeKey].map((id) => this.getTaskById(id)).filter((t) => t !== null),
      true
    );
  }
  getFlatVisibleTasks() {
    return this.getFlatSortedTasks(
      this.taskTree[parentNodeKey].map((id) => this.getTaskById(id)).filter((t) => t !== null)
    );
  }
  getNestedChildTasks(taskId, visibleOnly = false) {
    const result = [];
    const collectChildren = (id) => {
      var _a;
      if (visibleOnly && ((_a = this.taskMap[id]) == null ? void 0 : _a.collapsed)) {
        return;
      }
      const childIds = this.taskTree[id] || [];
      childIds.forEach((childId) => {
        const childTask = this.taskMap[childId];
        if (childTask) {
          result.push(childTask);
          collectChildren(childId);
        }
      });
    };
    collectChildren(taskId);
    return result;
  }
  getTaskById(id) {
    return this.taskMap[id];
  }
  getTaskDependencies(taskId) {
    return {
      incoming: this.dependencies.filter((dep) => dep.toId === taskId),
      outgoing: this.dependencies.filter((dep) => dep.fromId === taskId)
    };
  }
  getTasks() {
    return Object.values(this.taskMap);
  }
  getTopParentTasks() {
    return Object.values(this.taskMap).filter((task) => task.parentId === void 0 && task.type === TaskType.Task);
  }
  hasChildren(id) {
    return this.taskTree[id].length > 0;
  }
  removeDependency(fromId, toId) {
    this.dependencies = this.dependencies.filter((dep) => !(dep.fromId === fromId && dep.toId === toId));
  }
  removeTask(id) {
    delete this.taskMap[id];
    this.userSetSummaryProgress.delete(id);
    this.buildTaskTree(Object.values(this.taskMap));
    this.processWbs();
  }
  setTasks(taskInputs) {
    if (!Array.isArray(taskInputs)) {
      throw new Error("Tasks must be an array");
    }
    this.userSetSummaryProgress = /* @__PURE__ */ new Set();
    const validatedTasks = taskInputs.map((input) => this.validateTask(input));
    this.taskMap = {};
    this.dependencies = [];
    this.buildTaskTree(validatedTasks);
    this.applyShowSummaryBarDefaults();
    this.computeSummaryDates();
    this.computeSummaryProgress();
    this.sortTasksByDate("startTime");
    this.processLevel();
    this.processWbs();
  }
  toggleTask(id) {
    const task = this.getTaskById(id);
    if (!task)
      return;
    this.taskMap[id] = {
      ...task,
      collapsed: !task.collapsed
    };
  }
  setArrowLinkInstanceId(instanceId) {
    this.arrowLinkInstanceId = instanceId;
  }
  updateDependencyArrows(taskId, chartContext) {
    const deps = this.getTaskDependencies(taskId);
    const allDeps = [...deps.incoming, ...deps.outgoing];
    allDeps.forEach((dependency) => {
      const fromTask = this.getTaskById(dependency.fromId);
      const toTask = this.getTaskById(dependency.toId);
      if (fromTask && toTask) {
        const chartInstanceId = (chartContext == null ? void 0 : chartContext.getInstanceId()) || "unknown";
        const eventDetail = {
          fromId: dependency.fromId,
          toId: dependency.toId,
          type: dependency.type,
          lag: dependency.lag,
          chartInstanceId,
          arrowLinkInstanceId: this.arrowLinkInstanceId ?? void 0
        };
        const event = new CustomEvent("dependencyArrowUpdate", {
          detail: eventDetail,
          bubbles: false,
          cancelable: false
        });
        if (chartContext) {
          chartContext.dispatchEvent(event);
        } else {
          logger.warn(`[${chartInstanceId}] No chartContext provided for dependency arrow update`);
          document.dispatchEvent(event);
        }
      }
    });
  }
  getAllDependencies() {
    return this.dependencies;
  }
  updateTask(id, updates) {
    const task = this.taskMap[id];
    if (!task) {
      throw new Error(`Task with id "${id}" not found`);
    }
    if ("progress" in updates) {
      if (updates.progress === void 0) {
        this.userSetSummaryProgress.delete(id);
      } else {
        this.userSetSummaryProgress.add(id);
      }
    }
    const updatedTask = this.validateTask({ ...task, ...updates });
    this.taskMap[id] = updatedTask;
    this.buildTaskTree(this.getTasks());
    this.applyShowSummaryBarDefaults();
    this.computeSummaryDates();
    this.computeSummaryProgress();
    this.processWbs();
    return updatedTask;
  }
}
var Orientation = /* @__PURE__ */ ((Orientation2) => {
  Orientation2["Horizontal"] = "horizontal";
  Orientation2["Vertical"] = "vertical";
  return Orientation2;
})(Orientation || {});
class AnnotationRenderer {
  constructor(options, geometry, chartContext, totalHeight) {
    this.options = options;
    this.geometry = geometry;
    this.chartContext = chartContext;
    this.totalHeight = totalHeight;
  }
  calculateWidth(annotation) {
    const startMs = dayjs(annotation.x1).valueOf();
    const x2 = dayjs(annotation.x2);
    const endMs = formatHasTime(this.options.inputDateFormat) ? x2.valueOf() : x2.add(1, "day").valueOf();
    return (endMs - startMs) * this.geometry.pixelsPerMs;
  }
  calculateX(annotation) {
    return this.geometry.xForDate(annotation.x1);
  }
  drawAnnotation(annotation) {
    const annotationElement = createBox(this.chartContext, { className: "annotation" });
    const xPosition = this.calculateX(annotation);
    const annotationStyles = generateStyles(this.getAnnotationStyles(annotation, xPosition));
    annotationElement.setAttribute("style", annotationStyles);
    if (annotation.label) {
      const label = this.renderLabel(annotation);
      annotationElement.append(label);
    }
    return annotationElement;
  }
  getAnnotationStyles(annotation, x1Position) {
    const { annotationBgColor, annotationBorderColor, annotationBorderWidth } = this.options;
    const { bgColor, borderColor, borderWidth } = annotation;
    let width = 0;
    const updatedBorderWidth = annotation.x2 ? borderWidth ?? annotationBorderWidth : (borderWidth ?? annotationBorderWidth ?? 0) / 2;
    if (annotation.x2) {
      width = this.calculateWidth(annotation);
    }
    return {
      backgroundColor: bgColor || annotationBgColor,
      borderColor: `${borderColor || annotationBorderColor}`,
      borderStyle: "solid",
      borderWidth: `${updatedBorderWidth}px`,
      height: `${this.totalHeight}px`,
      left: `${x1Position}px`,
      position: "absolute",
      top: `0px`,
      width: width ? `${width}px` : "unset",
      zIndex: "10"
    };
  }
  /**
   * Render the label for an annotation.
   */
  renderLabel(annotation) {
    const labelElement = createBox(this.chartContext, { className: "annotation-label" });
    const { annotationBgColor, annotationBorderColor, fontColor, fontFamily, fontSize, fontWeight } = this.options;
    const { bgColor, borderColor } = annotation;
    const { label } = annotation;
    if (!label)
      return labelElement;
    const textColor = label.fontColor || fontColor;
    const labelFontFamily = label.fontFamily || fontFamily;
    const labelFontSize = label.fontSize || fontSize;
    const labelFontWeight = label.fontWeight || fontWeight;
    const labelStyles = generateStyles({
      background: bgColor || annotationBgColor,
      borderColor: `${borderColor || annotationBorderColor}`,
      borderStyle: "solid",
      borderWidth: "1px",
      color: textColor,
      fontFamily: labelFontFamily,
      fontSize: labelFontSize,
      fontWeight: labelFontWeight,
      left: "0px",
      padding: "2px 5px",
      position: "absolute",
      top: "-1px",
      width: "max-content",
      zIndex: "1"
    });
    labelElement.setAttribute("style", labelStyles);
    labelElement.innerText = label.text ?? "";
    return labelElement;
  }
  /**
   * Render all annotations. Pass `extras` to inject library-driven annotations
   * (e.g. project boundary lines) alongside the user-supplied list.
   */
  render(extras = []) {
    const elements = [];
    [...this.options.annotations, ...extras].forEach((annotation) => {
      elements.push(this.drawAnnotation(annotation));
    });
    return elements;
  }
}
const BaseDefaults = {
  annotationBorderDashArray: [],
  annotationBorderWidth: 2,
  annotationOrientation: Orientation.Horizontal,
  annotations: [],
  enableProjectBoundary: false,
  projectBoundaryColor: "#7C3AED",
  barBorderRadius: "5px",
  barLabel: { position: "right", field: "name" },
  barMargin: 8,
  baseline: {
    enabled: false,
    color: "#BBD5DA"
  },
  canvasStyle: "border: 1px solid #CACED0; box-sizing: border-box",
  dependencies: {},
  enableCriticalPath: false,
  enableCrosshair: false,
  cellBorderWidth: "1px",
  columnLines: true,
  enableInlineEdit: false,
  enableProgressDrag: true,
  enableRollups: false,
  enableSelection: false,
  enableExport: true,
  toolbarItems: [],
  enableResize: true,
  enableTaskDrag: true,
  enableTaskEdit: false,
  enableTaskResize: true,
  enableTooltip: true,
  fontFamily: "sans-serif",
  fontSize: "14px",
  fontWeight: "400",
  height: "500px",
  inputDateFormat: "MM-DD-YYYY",
  rowHeight: 38,
  series: [],
  showCheckboxColumn: true,
  snapUnit: "day",
  snapValue: 1,
  tasksContainerWidth: 425,
  tooltipId: "apexgantt-tooltip-container",
  tooltipTemplate(task, dateFormat) {
    const items = [
      `<div>
        <strong>Task:</strong>
        <span>${task.name}</span>
      </div>
      `
    ];
    if (task.type === TaskType.Task) {
      items.push(`
        <div>
          <strong>Start:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.StartTime, dateFormat)}</span>
        </div>
        <div>
          <strong>End:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.EndTime, dateFormat)}</span>
        </div>
        <div>
          <strong>Duration:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.Duration, dateFormat)}</span>
        </div>
        <div>
          <strong>Progress:</strong>
          <span>${task.progress}%</span>
        </div>
      `);
    } else if (task.type === TaskType.Milestone) {
      items.push(`
        <div>
          <strong>Date:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.StartTime, dateFormat)}</span>
        </div>
      `);
    }
    if (task.dependency) {
      items.push(`
      <div>
        <strong>Depends on:</strong>
        <span>${task.dependency}</span>
      </div>
    `);
    }
    return items.join("");
  },
  width: "100%"
};
const LightThemeDefaults = {
  annotationBgColor: "#DBEAFE",
  annotationBorderColor: "#60A5FA",
  arrowColor: "#94A3B8",
  backgroundColor: "#FFFFFF",
  barBackgroundColor: "#87B7FE",
  barTextColor: "#FFFFFF",
  borderColor: "#DFE0E1",
  cellBorderColor: "#D0D7DE",
  criticalArrowColor: "#E53935",
  criticalBarColor: "#E53935",
  crosshairColor: "#318CE7",
  fontColor: "#000000",
  headerBackground: "#EBF3FB",
  milestoneColor: "#7C3AED",
  rowBackgroundColors: ["#FFFFFF"],
  summaryBarColor: "#B9CECE",
  tooltipBGColor: "#FFFFFF",
  tooltipBorderColor: "#BCBCBC"
};
const DarkThemeDefaults = {
  annotationBgColor: "#4A2D4D",
  annotationBorderColor: "#8B4D8F",
  arrowColor: "#94A3B8",
  backgroundColor: "#1E1E1E",
  barBackgroundColor: "#818CF8",
  barTextColor: "#FFFFFF",
  borderColor: "#3A3A3A",
  cellBorderColor: "#3A3A3A",
  criticalArrowColor: "#F87171",
  criticalBarColor: "#F87171",
  crosshairColor: "#818CF8",
  fontColor: "#E0E0E0",
  headerBackground: "#2A2A2A",
  milestoneColor: "#A78BFA",
  rowBackgroundColors: ["#1E1E1E", "#252525"],
  summaryBarColor: "#8FBCBC",
  tooltipBGColor: "#2D2D2D",
  tooltipBorderColor: "#444444"
};
function getDefaultOptions(theme) {
  const themeDefaults = theme === "dark" ? DarkThemeDefaults : LightThemeDefaults;
  return {
    ...BaseDefaults,
    ...themeDefaults
  };
}
const DefaultOptions$1 = getDefaultOptions("light");
const BAR_ANIMATION_TOTAL_MS = 200;
function isReducedMotion(rootElement) {
  return rootElement.classList.contains("gantt-reduced-motion");
}
function animateBarEntrance(barElement, rowIndex, rootElement) {
  if (isReducedMotion(rootElement))
    return;
  if (typeof barElement.animate !== "function")
    return;
  const delay = Math.min(rowIndex * 30, 500);
  barElement.animate(
    [
      { transformOrigin: "top", transform: "translateY(-8px) scaleY(0)" },
      { transformOrigin: "top", transform: "translateY(0) scaleY(1)" }
    ],
    { duration: 200, easing: "ease-out", delay, fill: "backwards" }
  );
}
function fadeInArrowsSvg(svgElement, rootElement, instant = false, changedIds) {
  if (!svgElement)
    return;
  const reducedMotion = isReducedMotion(rootElement);
  if (changedIds && changedIds.size > 0) {
    const affectedPaths = Array.from(svgElement.querySelectorAll("path[data-edgeid]")).filter(
      (path) => {
        const [fromId, toId] = (path.getAttribute("data-edgeid") ?? "").split("-");
        return changedIds.has(fromId) || changedIds.has(toId);
      }
    );
    if (affectedPaths.length === 0)
      return;
    if (instant || reducedMotion) {
      affectedPaths.forEach((p) => p.style.opacity = "1");
      return;
    }
    affectedPaths.forEach((p) => p.style.opacity = "0");
    setTimeout(() => {
      affectedPaths.forEach((path) => {
        if (typeof path.animate !== "function") {
          path.style.opacity = "1";
          return;
        }
        path.animate([{ opacity: "0" }, { opacity: "1" }], { duration: 150, easing: "ease-out", fill: "forwards" }).finished.then(() => {
          path.style.opacity = "1";
          path.getAnimations().forEach((a) => a.cancel());
        }).catch(() => {
        });
      });
    }, BAR_ANIMATION_TOTAL_MS);
    return;
  }
  if (instant || reducedMotion) {
    svgElement.style.opacity = "1";
    return;
  }
  svgElement.style.opacity = "0";
  setTimeout(() => {
    if (typeof svgElement.animate !== "function") {
      svgElement.style.opacity = "1";
      return;
    }
    svgElement.animate([{ opacity: "0" }, { opacity: "1" }], { duration: 150, easing: "ease-out", fill: "forwards" }).finished.then(() => {
      svgElement.style.opacity = "1";
      svgElement.getAnimations().forEach((a) => a.cancel());
    }).catch(() => {
    });
  }, BAR_ANIMATION_TOTAL_MS);
}
function animateBarZoom(barElement, from, to, rootElement) {
  if (isReducedMotion(rootElement))
    return;
  if (typeof barElement.animate !== "function")
    return;
  if (from.left === to.left && from.width === to.width)
    return;
  const anim = barElement.animate(
    [
      { left: `${from.left}px`, width: `${from.width}px` },
      { left: `${to.left}px`, width: `${to.width}px` }
    ],
    { duration: 200, easing: "ease-in-out", fill: "forwards" }
  );
  anim.finished.then(() => anim.cancel()).catch(() => {
  });
}
const DATA_CHART_INSTANCE$1 = "data-chart-instance";
class TimeLine {
  constructor(pixelsPerMs, options, chartContext, dataManager) {
    this.pixelsPerMs = pixelsPerMs;
    this.options = options;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
  }
  generateHeader(headerData, subHeader) {
    const headerContainer = createBox(this.chartContext, { className: "timeline-header" });
    const headerRow1 = createBox(this.chartContext, { className: "timeline-header-row" });
    const { rowHeight } = this.options;
    const chartInstanceId = this.chartContext.getInstanceId();
    headerContainer.setAttribute(DATA_CHART_INSTANCE$1, chartInstanceId);
    headerContainer.setAttribute("tabindex", "0");
    headerContainer.setAttribute("aria-label", "Timeline header");
    headerData.forEach((header) => {
      const headerCell = createBox(this.chartContext, {
        className: "timeline-header-cell",
        content: header.data,
        style: {
          height: !subHeader ? `${rowHeight * 2}px` : `${rowHeight}px`,
          minWidth: `${header.width}px` || "100%",
          color: "var(--text-color)"
        }
      });
      headerRow1.append(headerCell);
    });
    headerContainer.append(headerRow1);
    if (!subHeader) {
      headerContainer.style.background = "var(--header-bg-color)";
      return headerContainer;
    }
    const headerRow2 = createBox(this.chartContext, { className: "timeline-header-row" });
    subHeader.forEach((cell) => {
      const headerCell = createBox(this.chartContext, {
        className: "timeline-header-cell",
        content: cell.data,
        style: {
          height: `${rowHeight}px`,
          maxWidth: `${cell.width}px`,
          minWidth: `${cell.width}px`,
          color: "var(--text-color)"
        }
      });
      headerRow2.append(headerCell);
    });
    headerContainer.append(headerRow2);
    headerContainer.style.background = "var(--header-bg-color)";
    return headerContainer;
  }
  generateRow(taskId, cells) {
    const row = createBox(this.chartContext, { className: "timeline-data-row" });
    const { rowHeight } = this.options;
    const chartInstanceId = this.chartContext.getInstanceId();
    row.setAttribute("data-taskid", taskId);
    row.setAttribute(DATA_CHART_INSTANCE$1, chartInstanceId);
    cells.forEach((cell) => {
      const headerCell = createBox(this.chartContext, {
        className: "timeline-data-cell",
        // Both maxWidth + minWidth pin the cell to the geometry width — without
        // maxWidth, flex layout can let cells expand under intrinsic-sizing
        // edge cases, leaving the row narrower than the header row and the
        // scrollbar overshooting past the rendered grid.
        style: { height: `${rowHeight}px`, maxWidth: `${cell.width}px`, minWidth: `${cell.width}px` }
      });
      headerCell.setAttribute(DATA_CHART_INSTANCE$1, chartInstanceId);
      row.append(headerCell);
    });
    return row;
  }
  generateRows(tasks, cells) {
    const tableBody = createBox(this.chartContext, { className: "timeline-body" });
    const chartInstanceId = this.chartContext.getInstanceId();
    tableBody.setAttribute(DATA_CHART_INSTANCE$1, chartInstanceId);
    tasks.forEach((task) => {
      const row = this.generateRow(task.id, cells);
      tableBody.append(row);
    });
    this.fillEmptyRows(tableBody, tasks.length, cells);
    return tableBody;
  }
  /**
   * Render only visible timeline rows with spacer divs for scroll height.
   */
  generateRowsVirtualized(allTasks, cells, range, rowHeight) {
    const tableBody = createBox(this.chartContext, { className: "timeline-body" });
    const chartInstanceId = this.chartContext.getInstanceId();
    tableBody.setAttribute(DATA_CHART_INSTANCE$1, chartInstanceId);
    const { startIndex, endIndex } = range;
    const totalRows = allTasks.length;
    const topSpacer = this.chartContext.createElement("div");
    topSpacer.className = "virtualizer-top-spacer";
    topSpacer.style.height = `${startIndex * rowHeight}px`;
    tableBody.appendChild(topSpacer);
    const visibleTasks = allTasks.slice(startIndex, endIndex + 1);
    visibleTasks.forEach((task) => {
      const row = this.generateRow(task.id, cells);
      tableBody.append(row);
    });
    const bottomHeight = Math.max(0, (totalRows - 1 - endIndex) * rowHeight);
    const bottomSpacer = this.chartContext.createElement("div");
    bottomSpacer.className = "virtualizer-bottom-spacer";
    bottomSpacer.style.height = `${bottomHeight}px`;
    tableBody.appendChild(bottomSpacer);
    return tableBody;
  }
  fillEmptyRows(tableBody, existingRowCount, cells) {
    const ganttContainer = this.chartContext.querySelector(".gantt-container");
    if (!ganttContainer)
      return;
    const containerHeight = ganttContainer.clientHeight;
    const rowHeight = this.options.rowHeight;
    const headerHeight = rowHeight * 2;
    const availableHeight = containerHeight - headerHeight;
    const totalRowsNeeded = Math.floor(availableHeight / rowHeight);
    const emptyRowsNeeded = Math.max(0, totalRowsNeeded - existingRowCount);
    for (let i = 0; i < emptyRowsNeeded; i++) {
      const emptyRow = this.generateRow(`empty-${i}`, cells);
      emptyRow.classList.add("timeline-empty-row");
      tableBody.append(emptyRow);
    }
  }
  render(virtualRange, prevVisibleIds = /* @__PURE__ */ new Set(), reRender) {
    const allTasks = virtualRange ? virtualRange.allTasks : this.dataManager.getFlatVisibleTasks();
    const dateRange = this.dataManager.getDateRange(8, this.pixelsPerMs);
    const { top, sub, geometry } = renderTimelineHeader(dateRange[0], dateRange[1], this.pixelsPerMs);
    const headerObjects = top ?? sub;
    const subHeaderObjects = top ? sub : null;
    const headerElement = this.generateHeader(headerObjects, subHeaderObjects);
    const cells = sub;
    let bodyElement;
    if (virtualRange) {
      bodyElement = this.generateRowsVirtualized(allTasks, cells, virtualRange.range, virtualRange.rowHeight);
    } else {
      bodyElement = this.generateRows(allTasks, cells);
    }
    const barContainer = createBox(this.chartContext, { className: "bar-container" });
    const annotationContainer = createBox(this.chartContext, { className: "annotation-container" });
    const rootElement = this.chartContext.getChartContainer();
    if (virtualRange) {
      const { startIndex, endIndex } = virtualRange.range;
      const totalHeight2 = allTasks.length * virtualRange.rowHeight;
      barContainer.style.height = `${totalHeight2}px`;
      barContainer.style.width = "100%";
      const visibleTasks = allTasks.slice(startIndex, endIndex + 1);
      visibleTasks.forEach((task, i) => {
        const absoluteIndex = startIndex + i;
        const bar = new Bar(task, geometry, this.options, absoluteIndex, this.chartContext, this.dataManager);
        const barElement = bar.drawBar((id, updatedTask) => {
          updateTaskInUI(this.chartContext, this.dataManager, id, updatedTask, this.options, geometry);
          refreshSummaryAncestors(this.chartContext, this.dataManager, id, this.options, geometry);
        }, reRender);
        barContainer.append(barElement);
        if (!prevVisibleIds.has(task.id) && rootElement)
          animateBarEntrance(barElement, absoluteIndex, rootElement);
        const baselineElement = bar.drawBaselineBar();
        if (baselineElement) {
          barContainer.append(baselineElement);
        }
        for (const rollup of bar.drawRollups())
          barContainer.append(rollup);
      });
    } else {
      allTasks.forEach((task, index) => {
        const bar = new Bar(task, geometry, this.options, index, this.chartContext, this.dataManager);
        const barElement = bar.drawBar((id, updatedTask) => {
          updateTaskInUI(this.chartContext, this.dataManager, id, updatedTask, this.options, geometry);
          refreshSummaryAncestors(this.chartContext, this.dataManager, id, this.options, geometry);
        }, reRender);
        barContainer.append(barElement);
        if (!prevVisibleIds.has(task.id) && rootElement)
          animateBarEntrance(barElement, index, rootElement);
        const baselineElement = bar.drawBaselineBar();
        if (baselineElement) {
          barContainer.append(baselineElement);
        }
        for (const rollup of bar.drawRollups())
          barContainer.append(rollup);
      });
    }
    const totalHeight = allTasks.length * this.options.rowHeight;
    const boundaryExtras = this.computeProjectBoundaryAnnotations(allTasks);
    const annotationElements = new AnnotationRenderer(this.options, geometry, this.chartContext, totalHeight).render(
      boundaryExtras
    );
    annotationContainer.append(...annotationElements);
    const horizontalScroll = createBox(this.chartContext, { className: "timeline-horizontal-scroll" });
    const scrollContent = createBox(this.chartContext, { className: "timeline-horizontal-scroll-content" });
    const chartInstanceId = this.chartContext.getInstanceId();
    horizontalScroll.id = `timeline-horizontal-scroll-${chartInstanceId}`;
    const contentWidth = cells.reduce((sum, cell) => sum + cell.width, 0);
    scrollContent.style.width = `${contentWidth}px`;
    scrollContent.style.height = "1px";
    horizontalScroll.appendChild(scrollContent);
    return [headerElement, annotationContainer, bodyElement, barContainer, horizontalScroll];
  }
  /**
   * Build the synthetic annotations that mark the project's overall start
   * and end. Returns an empty list when `enableProjectBoundary` is off, when
   * there are no scheduled tasks, or when no task carries a date.
   */
  computeProjectBoundaryAnnotations(allTasks) {
    if (!this.options.enableProjectBoundary || allTasks.length === 0)
      return [];
    let earliestStart;
    let latestEnd;
    let earliestStartMs = Infinity;
    let latestEndMs = -Infinity;
    for (const task of allTasks) {
      const start = task.showSummaryBar ? task.summaryStart ?? task.startTime : task.startTime;
      const end = task.showSummaryBar ? task.summaryEnd ?? task.endTime : task.endTime;
      if (start) {
        const ms = new Date(start).getTime();
        if (Number.isFinite(ms) && ms < earliestStartMs) {
          earliestStartMs = ms;
          earliestStart = start;
        }
      }
      if (end) {
        const ms = new Date(end).getTime();
        if (Number.isFinite(ms) && ms > latestEndMs) {
          latestEndMs = ms;
          latestEnd = end;
        }
      }
    }
    if (!earliestStart || !latestEnd)
      return [];
    const endAnnotationDate = formatHasTime(this.options.inputDateFormat) ? latestEnd : dayjs(latestEnd).add(1, "day").format(this.options.inputDateFormat);
    const color = this.options.projectBoundaryColor || this.options.annotationBorderColor;
    const baseStyle = {
      bgColor: "transparent",
      borderColor: color,
      borderWidth: 2
    };
    return [
      { ...baseStyle, x1: earliestStart },
      { ...baseStyle, x1: endAnnotationDate }
    ];
  }
}
function roundOrthogonalPath(pathString, radius) {
  if (!Number.isFinite(radius) || radius <= 0)
    return pathString;
  const points = parseOrthogonalPath(pathString);
  if (points.length < 3)
    return pathString;
  const out = [`M ${points[0][0]},${points[0][1]}`];
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inDx = cx - px;
    const inDy = cy - py;
    const outDx = nx - cx;
    const outDy = ny - cy;
    const inLen = Math.abs(inDx) + Math.abs(inDy);
    const outLen = Math.abs(outDx) + Math.abs(outDy);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    if (r <= 0 || inDx === 0 && inDy === 0 || outDx === 0 && outDy === 0) {
      out.push(`L ${cx},${cy}`);
      continue;
    }
    const inSignX = inDx === 0 ? 0 : Math.sign(inDx);
    const inSignY = inDy === 0 ? 0 : Math.sign(inDy);
    const outSignX = outDx === 0 ? 0 : Math.sign(outDx);
    const outSignY = outDy === 0 ? 0 : Math.sign(outDy);
    const arcStartX = cx - inSignX * r;
    const arcStartY = cy - inSignY * r;
    const arcEndX = cx + outSignX * r;
    const arcEndY = cy + outSignY * r;
    const cross = inSignX * outSignY - inSignY * outSignX;
    if (cross === 0) {
      out.push(`L ${cx},${cy}`);
      continue;
    }
    const sweep = cross > 0 ? 1 : 0;
    out.push(`L ${arcStartX},${arcStartY}`);
    out.push(`A ${r},${r} 0 0 ${sweep} ${arcEndX},${arcEndY}`);
  }
  const last = points[points.length - 1];
  out.push(`L ${last[0]},${last[1]}`);
  return out.join(" ");
}
function parseOrthogonalPath(pathString) {
  const tokens = pathString.match(/[ML]\s*-?\d+(?:\.\d+)?[,\s]+-?\d+(?:\.\d+)?/g);
  if (!tokens)
    return [];
  const points = [];
  for (const tok of tokens) {
    const m = tok.match(/[ML]\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
    if (!m)
      continue;
    points.push([parseFloat(m[1]), parseFloat(m[2])]);
  }
  return points;
}
const SVG_NS$1 = "http://www.w3.org/2000/svg";
const DefaultOptions = {
  paddingX: 20,
  paddingY: 15
};
class ArrowLink {
  constructor(instanceId) {
    this.elements = [];
    this.chartContext = null;
    this.instanceId = instanceId ?? "arrow_" + crypto.randomUUID().replace(/-/g, "").substring(0, 9);
  }
  getInstanceId() {
    return this.instanceId;
  }
  /**
   * Compute an arrow path from pre-computed rects instead of DOM elements.
   * Used when virtualization is active and some bar elements may not be in the DOM.
   */
  static calculateArrowPathFromRects(fromRect, toRect, options, dependencyType = "FS") {
    const { paddingX = DefaultOptions.paddingX, paddingY = DefaultOptions.paddingY } = options;
    switch (dependencyType) {
      case "SS":
        return ArrowLink.calculateSSPath(fromRect, toRect, paddingX, paddingY);
      case "FF":
        return ArrowLink.calculateFFPath(fromRect, toRect, paddingX, paddingY);
      case "SF":
        return ArrowLink.calculateSFPath(fromRect, toRect, paddingX, paddingY);
      case "FS":
      default:
        return ArrowLink.calculateFSPath(fromRect, toRect, paddingX, paddingY);
    }
  }
  static calculateArrowPath(fromElement, toElement, svg, options, dependencyType = "FS") {
    const fromRect = getTransformAwareBoundingRect(fromElement, svg);
    const toRect = getTransformAwareBoundingRect(toElement, svg);
    const { paddingX = DefaultOptions.paddingX, paddingY = DefaultOptions.paddingY } = options;
    switch (dependencyType) {
      case "SS":
        return ArrowLink.calculateSSPath(fromRect, toRect, paddingX, paddingY);
      case "FF":
        return ArrowLink.calculateFFPath(fromRect, toRect, paddingX, paddingY);
      case "SF":
        return ArrowLink.calculateSFPath(fromRect, toRect, paddingX, paddingY);
      case "FS":
      default:
        return ArrowLink.calculateFSPath(fromRect, toRect, paddingX, paddingY);
    }
  }
  /**
   * Finish-to-Start (FS): A finish → B start.
   * Arrow exits the right edge of A and enters the left edge of B.
   */
  static calculateFSPath(fromRect, toRect, paddingX, paddingY) {
    const fromX = fromRect.right;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.left - 2;
    const toY = toRect.top + toRect.height / 2;
    const pathArray = [`M ${fromX},${fromY}`];
    if (toX > fromX) {
      if (toY !== fromY) {
        const ARROWHEAD_LEN = 4;
        const midX = Math.max(fromX, (fromX + toX - ARROWHEAD_LEN) / 2);
        pathArray.push(`L ${midX},${fromY}`);
        pathArray.push(`L ${midX},${toY}`);
      }
    } else if (toX < fromX) {
      if (toY !== fromY) {
        const midX = fromX + paddingX;
        const midY = fromY + paddingY * (toY < fromY ? -1 : 1);
        const midX2 = toX - paddingX;
        const midY2 = toY + paddingY * (toY < fromY ? 1 : -1);
        pathArray.push(`L ${midX},${fromY}`);
        pathArray.push(`L ${midX},${midY}`);
        pathArray.push(`L ${midX2},${midY}`);
        if (midY2 !== midY)
          pathArray.push(`L ${midX2},${midY2}`);
        pathArray.push(`L ${midX2},${toY}`);
      } else {
        const midX = fromX + paddingX;
        const midY = fromY + paddingY;
        const midX2 = toX - paddingX;
        const midY2 = toY;
        pathArray.push(`L ${midX},${fromY}`);
        pathArray.push(`L ${midX},${midY}`);
        pathArray.push(`L ${midX2},${midY}`);
        pathArray.push(`L ${midX2},${midY2}`);
      }
    }
    pathArray.push(`L ${toX},${toY}`);
    return pathArray.join(" ");
  }
  /**
   * Start-to-Start (SS): A start → B start.
   * Arrow exits the left edge of A and enters the left edge of B.
   * Routes along the left side of both tasks.
   */
  static calculateSSPath(fromRect, toRect, paddingX, paddingY) {
    const fromX = fromRect.left;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.left - 2;
    const toY = toRect.top + toRect.height / 2;
    const leftEdge = Math.min(fromX, toX + 2) - paddingX;
    const pathArray = [`M ${fromX},${fromY}`];
    if (fromY === toY) {
      pathArray.push(`L ${leftEdge},${fromY}`);
      pathArray.push(`L ${leftEdge},${toY}`);
    } else {
      const midY = fromY + paddingY * (toY > fromY ? 1 : -1);
      pathArray.push(`L ${leftEdge},${fromY}`);
      pathArray.push(`L ${leftEdge},${midY}`);
      pathArray.push(`L ${leftEdge},${toY}`);
    }
    pathArray.push(`L ${toX},${toY}`);
    return pathArray.join(" ");
  }
  /**
   * Finish-to-Finish (FF): A finish → B finish.
   * Arrow exits the right edge of A and enters the right edge of B.
   * Routes along the right side of both tasks.
   * The arrowhead arrives from the right (pointing left into B).
   */
  static calculateFFPath(fromRect, toRect, paddingX, paddingY) {
    const fromX = fromRect.right;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.right + 2;
    const toY = toRect.top + toRect.height / 2;
    const rightEdge = Math.max(fromX, toX - 2) + paddingX;
    const pathArray = [`M ${fromX},${fromY}`];
    if (fromY === toY) {
      pathArray.push(`L ${rightEdge},${fromY}`);
      pathArray.push(`L ${rightEdge},${toY}`);
    } else {
      const midY = fromY + paddingY * (toY > fromY ? 1 : -1);
      pathArray.push(`L ${rightEdge},${fromY}`);
      pathArray.push(`L ${rightEdge},${midY}`);
      pathArray.push(`L ${rightEdge},${toY}`);
    }
    pathArray.push(`L ${toX},${toY}`);
    return pathArray.join(" ");
  }
  /**
   * Start-to-Finish (SF): A start → B finish.
   * Arrow exits the left edge of A and enters the right edge of B with a ← arrowhead.
   *
   * Route (A above B):
   *   exit A.left → go left → drop to just below B's bottom → go right past B →
   *   rise into B's mid-Y → arrowhead points left (←)
   *
   * Route (A below B):
   *   exit A.left → go left → rise to just above B's top → go right past B →
   *   drop into B's mid-Y → arrowhead points left (←)
   *
   * By routing via outside B's vertical bounds we never cross through B's bar.
   */
  static calculateSFPath(fromRect, toRect, paddingX, paddingY) {
    const fromX = fromRect.left;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.right + 2;
    const toY = toRect.top + toRect.height / 2;
    const leftAnchor = fromX - paddingX;
    const rightOvershoot = toRect.right + paddingX;
    const pathArray = [`M ${fromX},${fromY}`];
    pathArray.push(`L ${leftAnchor},${fromY}`);
    if (fromY <= toY) {
      const gridLine = fromRect.bottom + paddingY - fromRect.height / 2;
      pathArray.push(`L ${leftAnchor},${gridLine}`);
      pathArray.push(`L ${rightOvershoot},${gridLine}`);
      pathArray.push(`L ${rightOvershoot},${toY}`);
    } else {
      const aboveB = toRect.top - paddingY;
      pathArray.push(`L ${leftAnchor},${aboveB}`);
      pathArray.push(`L ${rightOvershoot},${aboveB}`);
      pathArray.push(`L ${rightOvershoot},${toY}`);
    }
    pathArray.push(`L ${toX},${toY}`);
    return pathArray.join(" ");
  }
  static drawArrow(fromElement, toElement, svg, options, id, instanceId, chartContext, dependencyType = "FS", lagPx = 0) {
    var _a;
    const path = chartContext ? chartContext.createElementNS(SVG_NS$1, "path") : document.createElementNS(SVG_NS$1, "path");
    const rawPath = ArrowLink.calculateArrowPath(fromElement, toElement, svg, options, dependencyType);
    const cornerRadius = ((_a = options.dependencies) == null ? void 0 : _a.cornerRadius) ?? 4;
    const pathString = roundOrthogonalPath(rawPath, cornerRadius);
    path.setAttribute("d", pathString);
    const arrowColor = options.arrowColor || "#94A3B8";
    path.setAttribute("stroke", arrowColor);
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "transparent");
    const markerId = instanceId ? `arrowhead-${instanceId}` : "arrowhead";
    path.setAttribute("marker-end", `url(#${markerId})`);
    path.setAttribute("data-edgeid", id);
    path.setAttribute("data-dependency-type", dependencyType);
    path.addEventListener("mouseout", function() {
      path.setAttribute("stroke", arrowColor);
    });
    if (lagPx !== 0) {
      path.setAttribute("data-lag-px", String(lagPx));
    }
    return path;
  }
  static updateArrow(fromElement, toElement, svg, options, id, dependencyType = "FS") {
    var _a;
    const rawPath = ArrowLink.calculateArrowPath(fromElement, toElement, svg, options, dependencyType);
    const cornerRadius = ((_a = options.dependencies) == null ? void 0 : _a.cornerRadius) ?? 4;
    const pathString = roundOrthogonalPath(rawPath, cornerRadius);
    const visible = svg.querySelector(`[data-edgeid="${id}"]:not([data-arrow-hit])`);
    if (visible)
      visible.setAttribute("d", pathString);
    const hit = svg.querySelector(`[data-edgeid="${id}"][data-arrow-hit]`);
    if (hit)
      hit.setAttribute("d", pathString);
  }
  createMarker(chartContext) {
    const marker = chartContext ? chartContext.createElementNS(SVG_NS$1, "marker") : document.createElementNS(SVG_NS$1, "marker");
    const markerId = `arrowhead-${this.instanceId}`;
    marker.setAttribute("id", markerId);
    marker.setAttribute("markerWidth", "5");
    marker.setAttribute("markerHeight", "5");
    marker.setAttribute("refX", "4");
    marker.setAttribute("refY", "2.5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("fill", "context-stroke");
    const arrowhead = chartContext ? chartContext.createElementNS(SVG_NS$1, "polygon") : document.createElementNS(SVG_NS$1, "polygon");
    arrowhead.setAttribute("points", "0,0 5,2.5 0,5 1, 2.5");
    marker.appendChild(arrowhead);
    return marker;
  }
  render(container, elements, options, chartContext) {
    this.chartContext = chartContext || null;
    const svgId = `timeline-arrows-${this.instanceId}`;
    const existingSvg = container.querySelector(`#${svgId}`);
    let svg = existingSvg;
    if (!svg) {
      svg = chartContext ? chartContext.createElementNS(SVG_NS$1, "svg") : document.createElementNS(SVG_NS$1, "svg");
      svg.setAttribute("id", svgId);
      container.appendChild(svg);
    }
    this.svg = svg;
    this.options = { ...DefaultOptions, ...options };
    this.elements = elements;
    this.svg.setAttribute(
      "style",
      generateStyles({
        // Mirrors `.bar-container` offset so arrows align with bars when
        // left-side bar labels reserve leading space at the timeline start.
        left: "var(--bar-label-leading-padding, 0px)",
        position: "absolute",
        top: "0",
        pointerEvents: "none"
      })
    );
    this.svg.innerHTML = "";
    const defs = chartContext ? chartContext.createElementNS(SVG_NS$1, "defs") : document.createElementNS(SVG_NS$1, "defs");
    const marker = this.createMarker(chartContext);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
    this.svg.setAttribute("width", `${this.options.width}`);
    this.svg.setAttribute("height", `${this.options.height}`);
    this.elements.forEach(({ id, source, target, dependencyType, lagPx }) => {
      this.svg.appendChild(
        ArrowLink.drawArrow(
          source,
          target,
          this.svg,
          this.options,
          id,
          this.instanceId,
          chartContext,
          dependencyType,
          lagPx
        )
      );
    });
    return this.svg;
  }
  /**
   * Render arrows using pre-computed rects instead of DOM elements.
   * Used when virtualization is active so arrows draw correctly even when
   * source/target bars are outside the virtual window and not in the DOM.
   */
  renderFromRects(container, edges, options, chartContext) {
    this.chartContext = chartContext || null;
    const svgId = `timeline-arrows-${this.instanceId}`;
    const existingSvg = container.querySelector(`#${svgId}`);
    let svg = existingSvg;
    if (!svg) {
      svg = chartContext ? chartContext.createElementNS(SVG_NS$1, "svg") : document.createElementNS(SVG_NS$1, "svg");
      svg.setAttribute("id", svgId);
      container.appendChild(svg);
    }
    this.svg = svg;
    this.options = { ...DefaultOptions, ...options };
    this.svg.setAttribute(
      "style",
      generateStyles({
        // Mirrors `.bar-container` offset so arrows align with bars when
        // left-side bar labels reserve leading space at the timeline start.
        left: "var(--bar-label-leading-padding, 0px)",
        position: "absolute",
        top: "0",
        pointerEvents: "none"
      })
    );
    this.svg.innerHTML = "";
    const defs = chartContext ? chartContext.createElementNS(SVG_NS$1, "defs") : document.createElementNS(SVG_NS$1, "defs");
    defs.appendChild(this.createMarker(chartContext));
    this.svg.appendChild(defs);
    this.svg.setAttribute("width", `${this.options.width}`);
    this.svg.setAttribute("height", `${this.options.height}`);
    const arrowColor = options.arrowColor || "#94A3B8";
    const markerId = `arrowhead-${this.instanceId}`;
    const dependencyOpts = this.options.dependencies ?? {};
    const cornerRadius = dependencyOpts.cornerRadius ?? 4;
    const hitWidth = dependencyOpts.hitWidth ?? 0;
    const tooltipTemplate = dependencyOpts.tooltipTemplate;
    const classBuilder = dependencyOpts.classBuilder;
    edges.forEach((edge) => {
      const { id, sourceRect, targetRect, dependencyType = "FS", lagPx = 0, fromTask, toTask, lagDays } = edge;
      const rawPath = ArrowLink.calculateArrowPathFromRects(sourceRect, targetRect, this.options, dependencyType);
      const pathString = roundOrthogonalPath(rawPath, cornerRadius);
      if (hitWidth > 0) {
        const hit = this.createPathElement(chartContext);
        hit.setAttribute("d", pathString);
        hit.setAttribute("stroke", "transparent");
        hit.setAttribute("stroke-width", String(hitWidth));
        hit.setAttribute("stroke-linejoin", "round");
        hit.setAttribute("fill", "none");
        hit.setAttribute("data-edgeid", id);
        hit.setAttribute("data-arrow-hit", "");
        hit.setAttribute("pointer-events", "stroke");
        hit.style.cursor = tooltipTemplate ? "pointer" : "default";
        if (tooltipTemplate && fromTask && toTask) {
          this.attachArrowTooltip(hit, tooltipTemplate, {
            fromTask,
            toTask,
            type: dependencyType,
            lag: lagDays ?? 0
          });
        }
        this.svg.appendChild(hit);
      }
      const path = this.createPathElement(chartContext);
      path.setAttribute("d", pathString);
      path.setAttribute("stroke", arrowColor);
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("fill", "transparent");
      path.setAttribute("marker-end", `url(#${markerId})`);
      path.setAttribute("data-edgeid", id);
      path.setAttribute("data-dependency-type", dependencyType);
      path.setAttribute("pointer-events", "none");
      if (classBuilder && fromTask && toTask) {
        const extra = classBuilder({ fromTask, toTask, type: dependencyType, lag: lagDays ?? 0 });
        const classes = Array.isArray(extra) ? extra.join(" ") : extra ?? "";
        if (classes)
          path.setAttribute("class", classes);
      }
      if (lagPx !== 0) {
        path.setAttribute("data-lag-px", String(lagPx));
      }
      path.addEventListener("mouseout", () => {
        path.setAttribute("stroke", arrowColor);
      });
      this.svg.appendChild(path);
    });
    return this.svg;
  }
  createPathElement(chartContext) {
    return chartContext ? chartContext.createElementNS(SVG_NS$1, "path") : document.createElementNS(SVG_NS$1, "path");
  }
  /**
   * Wire mouseenter/move/leave on a hit-area path so the configured tooltip
   * template renders into the chart's shared tooltip container. The pointer
   * x/y are offset slightly so the tooltip floats above-right of the cursor.
   */
  attachArrowTooltip(hit, template, ctx) {
    if (!this.chartContext)
      return;
    const chartContext = this.chartContext;
    const {
      tooltipId,
      tooltipBgColor,
      tooltipBorderColor,
      tooltipFontColor,
      tooltipFontFamily,
      tooltipFontSize,
      tooltipFontWeight
    } = this.options;
    if (!tooltipId)
      return;
    const show = (event) => {
      const html = template(ctx);
      showCursorTooltip(chartContext, tooltipId, event.clientX, event.clientY, html, {
        bgColor: tooltipBgColor ?? "#FFFFFF",
        borderColor: tooltipBorderColor ?? "#BCBCBC",
        fontColor: tooltipFontColor ?? "#000000",
        fontFamily: tooltipFontFamily ?? "inherit",
        fontSize: tooltipFontSize ?? "12px",
        fontWeight: tooltipFontWeight ?? "400",
        maxWidth: 320
      });
    };
    const hide = () => hideAnchoredTooltip(chartContext, tooltipId);
    hit.addEventListener("mouseenter", show);
    hit.addEventListener("mousemove", show);
    hit.addEventListener("mouseleave", hide);
  }
}
function updateArrow(context, fromId, toId, arrowLinkInstanceId, dependencyType = "FS", rowHeight = 38, dependencies) {
  const chartInstanceId = context.getInstanceId();
  const arrowSource = getBarElement(context, fromId);
  const arrowTarget = getBarElement(context, toId);
  if (!arrowSource || !arrowTarget) {
    logger.warn(`[${chartInstanceId}] Arrow source or target not found: ${fromId} -> ${toId}`);
    return false;
  }
  const timelineBody = context.querySelector(`.timeline-body[data-chart-instance="${chartInstanceId}"]`);
  const svgId = `timeline-arrows-${arrowLinkInstanceId}`;
  const svg = timelineBody == null ? void 0 : timelineBody.querySelector(`#${svgId}`);
  if (!svg) {
    logger.warn(`[${chartInstanceId}] Arrow SVG not found: ${svgId}`);
    return false;
  }
  ArrowLink.updateArrow(
    arrowSource,
    arrowTarget,
    svg,
    {
      paddingX: 20,
      paddingY: rowHeight / 2,
      dependencies
    },
    `${fromId}-${toId}`,
    dependencyType
  );
  return true;
}
const EMPTY_RESULT = {
  criticalTaskIds: /* @__PURE__ */ new Set(),
  criticalEdgeKeys: /* @__PURE__ */ new Set()
};
function durationDays(startTime, endTime) {
  const msPerDay = 864e5;
  const start = new Date(startTime).setHours(0, 0, 0, 0);
  const end = new Date(endTime).setHours(0, 0, 0, 0);
  return Math.round((end - start) / msPerDay) + 1;
}
function computeCriticalPath(tasks, dependencies) {
  if (tasks.length === 0 || dependencies.length === 0) {
    return EMPTY_RESULT;
  }
  const fsDeps = dependencies.filter((d) => d.type === "FS");
  if (fsDeps.length === 0) {
    return EMPTY_RESULT;
  }
  const taskById = /* @__PURE__ */ new Map();
  for (const task of tasks) {
    taskById.set(task.id, task);
  }
  const successors = /* @__PURE__ */ new Map();
  const predecessors = /* @__PURE__ */ new Map();
  const inDegree = /* @__PURE__ */ new Map();
  for (const task of tasks) {
    inDegree.set(task.id, 0);
    successors.set(task.id, []);
    predecessors.set(task.id, []);
  }
  for (const dep of fsDeps) {
    if (!taskById.has(dep.fromId) || !taskById.has(dep.toId))
      continue;
    successors.get(dep.fromId).push(dep);
    predecessors.get(dep.toId).push(dep);
    inDegree.set(dep.toId, (inDegree.get(dep.toId) ?? 0) + 1);
  }
  const queue = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0)
      queue.push(id);
  }
  const topoOrder = [];
  while (queue.length > 0) {
    const id = queue.shift();
    topoOrder.push(id);
    for (const dep of successors.get(id) ?? []) {
      const newDeg = (inDegree.get(dep.toId) ?? 0) - 1;
      inDegree.set(dep.toId, newDeg);
      if (newDeg === 0)
        queue.push(dep.toId);
    }
  }
  if (topoOrder.length !== tasks.length) {
    return EMPTY_RESULT;
  }
  const est = /* @__PURE__ */ new Map();
  const eft = /* @__PURE__ */ new Map();
  for (const id of topoOrder) {
    const task = taskById.get(id);
    if (!task)
      continue;
    const dur = durationDays(task.startTime, task.endTime ?? task.startTime);
    let maxPredEft = 0;
    for (const dep of predecessors.get(id) ?? []) {
      const predEft = eft.get(dep.fromId) ?? 0;
      maxPredEft = Math.max(maxPredEft, predEft + dep.lag + 1);
    }
    est.set(id, maxPredEft);
    eft.set(id, maxPredEft + dur - 1);
  }
  let projectEnd = 0;
  for (const val of eft.values()) {
    if (val > projectEnd)
      projectEnd = val;
  }
  const lft = /* @__PURE__ */ new Map();
  const lst = /* @__PURE__ */ new Map();
  for (const id of [...topoOrder].reverse()) {
    const task = taskById.get(id);
    if (!task)
      continue;
    const dur = durationDays(task.startTime, task.endTime ?? task.startTime);
    const succs = successors.get(id) ?? [];
    let minSuccLst = projectEnd;
    for (const dep of succs) {
      const succLst = lst.get(dep.toId) ?? projectEnd;
      minSuccLst = Math.min(minSuccLst, succLst - dep.lag - 1);
    }
    lft.set(id, minSuccLst);
    lst.set(id, minSuccLst - dur + 1);
  }
  const criticalTaskIds = /* @__PURE__ */ new Set();
  for (const id of topoOrder) {
    const float = (lst.get(id) ?? 0) - (est.get(id) ?? 0);
    if (float === 0) {
      criticalTaskIds.add(id);
    }
  }
  const criticalEdgeKeys = /* @__PURE__ */ new Set();
  for (const dep of fsDeps) {
    if (criticalTaskIds.has(dep.fromId) && criticalTaskIds.has(dep.toId)) {
      const predEft = eft.get(dep.fromId) ?? 0;
      const succEst = est.get(dep.toId) ?? 0;
      if (predEft + dep.lag + 1 === succEst) {
        criticalEdgeKeys.add(`${dep.fromId}->${dep.toId}`);
      }
    }
  }
  return { criticalTaskIds, criticalEdgeKeys };
}
function readCSSVar(element, name) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}
function readGanttCSSVars(element) {
  const v = (name) => readCSSVar(element, name);
  return {
    barFill: v("--apex-gantt-bar-fill"),
    bgColor: v("--apex-gantt-background-color"),
    rowBgEven: v("--apex-gantt-row-bg-even"),
    rowBgOdd: v("--apex-gantt-row-bg-odd"),
    headerBg: v("--apex-gantt-header-bg"),
    gridLine: v("--apex-gantt-grid-line"),
    dependencyLine: v("--apex-gantt-dependency-line"),
    fontFamily: v("--apex-gantt-font-family"),
    fontSize: v("--apex-gantt-font-size"),
    fontColor: v("--apex-gantt-font-color")
  };
}
const SVG_NS = "http://www.w3.org/2000/svg";
function applyStyles(element, styles) {
  if (!element)
    return;
  Object.assign(element.style, styles);
}
function applyStylesToAll(elements, styles) {
  elements.forEach((elem) => applyStyles(elem, styles));
}
function getGanttElements(element) {
  const ganttContainer = element.querySelector(".gantt-container");
  if (!ganttContainer) {
    throw new Error("Gantt container not found");
  }
  const timelineContainer = ganttContainer.querySelector(".timeline-container");
  const tasksContainer = ganttContainer.querySelector(".tasks-container");
  if (!timelineContainer || !tasksContainer) {
    throw new Error("Timeline or tasks container not found");
  }
  return {
    ganttContainer,
    timelineContainer,
    tasksContainer,
    horizontalScroll: ganttContainer.querySelector(".timeline-horizontal-scroll"),
    timelineBodyWrapper: timelineContainer.querySelector(".timeline-body-wrapper"),
    timelineHeader: timelineContainer.querySelector(".timeline-header"),
    timelineBody: timelineContainer.querySelector(".timeline-body"),
    barContainer: timelineContainer.querySelector(".bar-container"),
    annotationContainer: timelineContainer.querySelector(".annotation-container")
  };
}
function calculateExportDimensions(elements) {
  var _a, _b, _c, _d;
  const contentWidth = Math.max(
    ((_a = elements.timelineBody) == null ? void 0 : _a.scrollWidth) || 0,
    ((_b = elements.barContainer) == null ? void 0 : _b.scrollWidth) || 0,
    ((_c = elements.annotationContainer) == null ? void 0 : _c.scrollWidth) || 0,
    ((_d = elements.timelineHeader) == null ? void 0 : _d.scrollWidth) || 0
  );
  const tasksWidth = elements.tasksContainer.scrollWidth;
  const totalWidth = tasksWidth + contentWidth;
  const totalHeight = Math.max(elements.timelineContainer.scrollHeight, elements.tasksContainer.scrollHeight);
  return {
    contentWidth,
    tasksWidth,
    totalWidth,
    totalHeight
  };
}
function extractCSSVariables(element) {
  const computedStyle = window.getComputedStyle(element);
  const cssVars = [];
  for (let i = 0; i < element.style.length; i++) {
    const propertyName = element.style[i];
    if (propertyName.startsWith("--")) {
      const value = element.style.getPropertyValue(propertyName);
      cssVars.push(`${propertyName}: ${value};`);
    }
  }
  const allProperties = Array.from(computedStyle);
  allProperties.forEach((propertyName) => {
    if (propertyName.startsWith("--")) {
      const value = computedStyle.getPropertyValue(propertyName);
      const varDeclaration = `${propertyName}: ${value};`;
      if (!cssVars.includes(varDeclaration)) {
        cssVars.push(varDeclaration);
      }
    }
  });
  if (cssVars.length === 0) {
    return "";
  }
  return `:root {
  ${cssVars.join("\n  ")}
}`;
}
function collectStyles(rootElement) {
  const styles = [];
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
        continue;
      }
      if (sheet.cssRules) {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          styles.push(sheet.cssRules[j].cssText);
        }
      }
    } catch (e) {
      continue;
    }
  }
  const styleTags = document.querySelectorAll("style");
  styleTags.forEach((tag) => {
    if (tag.textContent) {
      styles.push(tag.textContent);
    }
  });
  const cssVariables = extractCSSVariables(rootElement);
  if (cssVariables) {
    styles.unshift(cssVariables);
  }
  return styles.join("\n");
}
function prepareClonedElements(clonedContainer, dimensions) {
  const { contentWidth } = dimensions;
  const clonedHorizontalScroll = clonedContainer.querySelector(".timeline-horizontal-scroll");
  clonedHorizontalScroll == null ? void 0 : clonedHorizontalScroll.remove();
  const clonedTimeline = clonedContainer.querySelector(".timeline-container");
  const clonedTasks = clonedContainer.querySelector(".tasks-container");
  const clonedTimelineBodyWrapper = clonedContainer.querySelector(".timeline-body-wrapper");
  const clonedTimelineHeader = clonedContainer.querySelector(".timeline-header");
  const clonedTimelineBody = clonedContainer.querySelector(".timeline-body");
  const clonedBarContainer = clonedContainer.querySelector(".bar-container");
  const clonedAnnotationContainer = clonedContainer.querySelector(".annotation-container");
  applyStyles(clonedTimeline, {
    overflow: "visible",
    maxWidth: "none",
    width: "auto",
    position: "relative"
  });
  applyStyles(clonedTasks, {
    overflow: "visible",
    height: "auto",
    maxHeight: "none"
  });
  applyStyles(clonedTimelineBodyWrapper, {
    overflow: "visible",
    maxWidth: "none",
    width: `${contentWidth}px`
  });
  if (clonedTimelineBodyWrapper) {
    clonedTimelineBodyWrapper.scrollLeft = 0;
  }
  applyStyles(clonedTimelineHeader, {
    overflow: "visible",
    maxWidth: "none",
    width: `${contentWidth}px`
  });
  if (clonedTimelineHeader) {
    clonedTimelineHeader.scrollLeft = 0;
  }
  applyStylesToAll([clonedTimelineBody, clonedBarContainer, clonedAnnotationContainer], {
    width: `${contentWidth}px`,
    minWidth: `${contentWidth}px`,
    maxWidth: "none"
  });
}
const exportGantt = async (element) => {
  try {
    const elements = getGanttElements(element);
    const dimensions = calculateExportDimensions(elements);
    const clonedContainer = elements.ganttContainer.cloneNode(true);
    prepareClonedElements(clonedContainer, dimensions);
    applyStyles(clonedContainer, {
      display: "flex",
      overflow: "visible",
      width: "fit-content",
      height: "auto"
    });
    const styles = collectStyles(element);
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    clonedContainer.insertBefore(styleElement, clonedContainer.firstChild);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", dimensions.totalWidth.toString());
    svg.setAttribute("height", dimensions.totalHeight.toString());
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", `0 0 ${dimensions.totalWidth} ${dimensions.totalHeight}`);
    const foreignObject = document.createElementNS(SVG_NS, "foreignObject");
    foreignObject.setAttribute("width", dimensions.totalWidth.toString());
    foreignObject.setAttribute("height", dimensions.totalHeight.toString());
    foreignObject.setAttribute("x", "0");
    foreignObject.setAttribute("y", "0");
    foreignObject.appendChild(clonedContainer);
    svg.appendChild(foreignObject);
    const serializer = new XMLSerializer();
    const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gantt-chart-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    logger.error("Error exporting gantt chart:", error);
    throw error;
  }
};
const Icons = {
  zoomIn: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>`,
  zoomOut: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`
};
const Selectors = {
  // Top-level containers
  ganttContainer: ".gantt-container",
  actionsContainer: ".gantt-actions-container",
  // Split-view
  splitBar: ".split-bar-container",
  // Tasks panel
  tasksContainer: ".tasks-container",
  tasksHeader: ".tasks-header",
  tasksBodyWrapper: ".tasks-body-wrapper",
  tasksDataContainer: ".tasks-data-container",
  tasksDataRow: ".tasks-data-row",
  tasksEmptyRow: ".tasks-empty-row",
  tasksDataCell: ".tasks-data-cell",
  // Timeline panel
  timelineContainer: ".timeline-container",
  timelineHeader: ".timeline-header",
  timelineHeaderRow: ".timeline-header-row",
  timelineHeaderCell: ".timeline-header-cell",
  timelineBodyWrapper: ".timeline-body-wrapper",
  timelineBody: ".timeline-body",
  timelineDataRow: ".timeline-data-row",
  timelineEmptyRow: ".timeline-empty-row",
  timelineDataCell: ".timeline-data-cell",
  // Horizontal scrollbar
  horizontalScroll: ".timeline-horizontal-scroll",
  horizontalScrollContent: ".timeline-horizontal-scroll-content",
  // Bar / dependency
  barContainer: ".bar-container",
  // Virtualizer spacers
  virtualizerTopSpacer: ".virtualizer-top-spacer",
  virtualizerBottomSpacer: ".virtualizer-bottom-spacer"
};
class GanttStateManager {
  constructor() {
    this.state = {
      scrollPosition: { horizontal: 0, tasksVertical: 0, timelineVertical: 0 },
      pixelsPerMs: 0,
      collapsedTasks: /* @__PURE__ */ new Set(),
      selectedTaskIds: [],
      hasState: false
    };
  }
  /**
   * capture current state before re-render
   */
  captureState(element, dataManager, pixelsPerMs, selectedTaskIds) {
    const horizontalScroll = element.querySelector(".timeline-horizontal-scroll");
    const splitViewContainer = element.querySelector(".split-view-container");
    this.state.scrollPosition = {
      horizontal: (horizontalScroll == null ? void 0 : horizontalScroll.scrollLeft) || 0,
      tasksVertical: (splitViewContainer == null ? void 0 : splitViewContainer.scrollTop) || 0,
      timelineVertical: (splitViewContainer == null ? void 0 : splitViewContainer.scrollTop) || 0
    };
    this.state.pixelsPerMs = pixelsPerMs;
    this.state.hasState = true;
    this.state.collapsedTasks = new Set(
      dataManager.getFlatTasks().filter((task) => task.collapsed).map((task) => task.id)
    );
    this.state.selectedTaskIds = selectedTaskIds ?? [];
  }
  /**
   * restore state after re-render
   */
  restoreState(element, skipScroll = false) {
    if (!skipScroll) {
      requestAnimationFrame(() => {
        const horizontalScroll = element.querySelector(".timeline-horizontal-scroll");
        const splitViewContainer = element.querySelector(".split-view-container");
        if (horizontalScroll) {
          horizontalScroll.scrollLeft = this.state.scrollPosition.horizontal;
        }
        if (splitViewContainer) {
          splitViewContainer.scrollTop = this.state.scrollPosition.tasksVertical;
        }
        const timelineHeader = element.querySelector(".timeline-header");
        if (timelineHeader) {
          timelineHeader.scrollLeft = this.state.scrollPosition.horizontal;
        }
      });
    }
  }
  /**
   * Get stored zoom level (pixels per ms).
   */
  getPixelsPerMs() {
    return this.state.pixelsPerMs;
  }
  /**
   * Get stored selected task IDs
   */
  getSelectedTaskIds() {
    return this.state.selectedTaskIds;
  }
  hasState() {
    return this.state.hasState;
  }
  clearState() {
    this.state = {
      scrollPosition: { horizontal: 0, tasksVertical: 0, timelineVertical: 0 },
      pixelsPerMs: 0,
      collapsedTasks: /* @__PURE__ */ new Set(),
      selectedTaskIds: [],
      hasState: false
    };
  }
}
const OPTIONAL_TASK_FIELDS = [
  "endTime",
  "progress",
  "type",
  "parentId",
  "dependency",
  "barBackgroundColor",
  "rowBackgroundColor",
  "collapsed"
];
class DataParser {
  /**
   * Extract value from nested object using dot notation path
   * @param obj - source object
   * @param path - dot notation path (e.g., 'project.task.title')
   * @returns Extracted value
   */
  static getNestedValue(obj, path) {
    if (!obj || !path) {
      return void 0;
    }
    const keys = path.split(".");
    let result = obj;
    for (const key of keys) {
      if (result === null || result === void 0) {
        return void 0;
      }
      result = result[key];
    }
    return result;
  }
  /**
   * single parsing value configuration
   * @param obj - Source object
   * @param parsingValue - Either a string path or object with key and transform
   * @returns Processed value
   */
  static processParsingValue(obj, parsingValue) {
    if (typeof parsingValue === "string") {
      return this.getNestedValue(obj, parsingValue);
    }
    const { key, transform } = parsingValue;
    const value = this.getNestedValue(obj, key);
    if (transform && typeof transform === "function") {
      try {
        return transform(value);
      } catch (error) {
        logger.warn(`DataParser: Transform function failed for key "${key}":`, error);
        return value;
      }
    }
    return value;
  }
  /**
   * Build a TaskInput from a raw item using the provided config.
   * Returns null if required fields are missing or cannot be extracted.
   */
  static buildTaskInput(item, config, index) {
    const id = this.processParsingValue(item, config.id);
    const name = this.processParsingValue(item, config.name);
    const startTime = this.processParsingValue(item, config.startTime);
    if (!id || !name || !startTime) {
      logger.warn(`DataParser: Skipping item at index ${index} - missing required fields`, {
        id,
        name,
        startTime,
        rawItem: item
      });
      return null;
    }
    const taskInput = { id, name, startTime };
    for (const field of OPTIONAL_TASK_FIELDS) {
      if (config[field] !== void 0) {
        const value = this.processParsingValue(item, config[field]);
        if (value !== void 0) {
          taskInput[field] = value;
        }
      }
    }
    return taskInput;
  }
  /**
   * Parse an array of raw data objects into TaskInput array
   * @param data - Array of raw data objects
   * @param config - Parsing configuration mapping
   * @returns Array of TaskInput objects
   */
  static parse(data, config) {
    if (!Array.isArray(data)) {
      logger.warn("DataParser: Data must be an array");
      return [];
    }
    if (!config) {
      logger.warn("DataParser: Parsing config is required");
      return [];
    }
    return data.map((item, index) => {
      try {
        return this.buildTaskInput(item, config, index);
      } catch (error) {
        logger.warn(`DataParser: Error parsing item at index ${index}:`, error, item);
        return null;
      }
    }).filter((task) => task !== null);
  }
  /**
   * validate parsing configuration
   * @param config - parsing configuration to validate
   * @returns true if valid, false otherwise
   */
  static validateConfig(config) {
    if (!config) {
      return false;
    }
    if (!config.id || !config.name || !config.startTime) {
      logger.warn("DataParser: Parsing config must include id, name, and startTime");
      return false;
    }
    return true;
  }
}
const CROSSHAIR_CLASS = "gantt-crosshair";
const CROSSHAIR_LABEL_CLASS = "gantt-crosshair-label";
class CrosshairManager {
  constructor(options, domCache, chartContext) {
    this.options = options;
    this.domCache = domCache;
    this.chartContext = chartContext;
    this.bodyLine = null;
    this.label = null;
    this.mouseMoveHandler = null;
    this.mouseLeaveHandler = null;
    this.scrollHandler = null;
    this.headerMoveHandler = null;
    this.headerLeaveHandler = null;
    this.rafId = null;
    this.lastClientX = null;
    this.geometry = null;
    this.subTier = "day";
  }
  updateOptions(options) {
    this.options = options;
  }
  /**
   * Attach the crosshair elements + listeners. Safe to call repeatedly — this
   * tears down any previous attachment first.
   */
  attach(geometry, subTier) {
    this.detach();
    if (!this.options.enableCrosshair)
      return;
    const wrapper = this.domCache.timelineBodyWrapper;
    const header = this.domCache.timelineHeader;
    const body = wrapper == null ? void 0 : wrapper.querySelector(Selectors.timelineBody);
    if (!wrapper || !body)
      return;
    this.geometry = geometry;
    this.subTier = subTier;
    this.bodyLine = this.createLine();
    body.appendChild(this.bodyLine);
    if (header) {
      const headerRows = header.querySelectorAll(Selectors.timelineHeaderRow);
      const labelHost = headerRows[headerRows.length - 1] ?? header;
      this.label = this.chartContext.createElement("div");
      this.label.className = CROSSHAIR_LABEL_CLASS;
      this.label.style.background = this.options.crosshairColor;
      this.label.style.display = "none";
      labelHost.appendChild(this.label);
    }
    this.mouseMoveHandler = (e) => this.onMouseMove(e);
    this.mouseLeaveHandler = () => this.hide();
    this.scrollHandler = () => this.onScroll();
    wrapper.addEventListener("mousemove", this.mouseMoveHandler);
    wrapper.addEventListener("mouseleave", this.mouseLeaveHandler);
    wrapper.addEventListener("scroll", this.scrollHandler, { passive: true });
    if (header) {
      this.headerMoveHandler = (e) => this.onMouseMove(e);
      this.headerLeaveHandler = () => this.hide();
      header.addEventListener("mousemove", this.headerMoveHandler);
      header.addEventListener("mouseleave", this.headerLeaveHandler);
    }
  }
  createLine() {
    const line = this.chartContext.createElement("div");
    line.className = CROSSHAIR_CLASS;
    line.style.background = this.options.crosshairColor;
    line.style.display = "none";
    return line;
  }
  detach() {
    var _a, _b;
    const wrapper = this.domCache.timelineBodyWrapper;
    if (wrapper) {
      if (this.mouseMoveHandler)
        wrapper.removeEventListener("mousemove", this.mouseMoveHandler);
      if (this.mouseLeaveHandler)
        wrapper.removeEventListener("mouseleave", this.mouseLeaveHandler);
      if (this.scrollHandler)
        wrapper.removeEventListener("scroll", this.scrollHandler);
    }
    const header = this.domCache.timelineHeader;
    if (header) {
      if (this.headerMoveHandler)
        header.removeEventListener("mousemove", this.headerMoveHandler);
      if (this.headerLeaveHandler)
        header.removeEventListener("mouseleave", this.headerLeaveHandler);
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    (_a = this.bodyLine) == null ? void 0 : _a.remove();
    (_b = this.label) == null ? void 0 : _b.remove();
    this.bodyLine = null;
    this.label = null;
    this.mouseMoveHandler = null;
    this.mouseLeaveHandler = null;
    this.scrollHandler = null;
    this.headerMoveHandler = null;
    this.headerLeaveHandler = null;
    this.lastClientX = null;
    this.geometry = null;
  }
  onMouseMove(e) {
    this.lastClientX = e.clientX;
    this.scheduleUpdate();
  }
  onScroll() {
    if (this.lastClientX === null)
      return;
    this.scheduleUpdate();
  }
  scheduleUpdate() {
    if (this.rafId !== null)
      return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.update();
    });
  }
  update() {
    if (this.lastClientX === null || !this.bodyLine || !this.geometry)
      return;
    const wrapper = this.domCache.timelineBodyWrapper;
    if (!wrapper)
      return;
    const rect = wrapper.getBoundingClientRect();
    const offsetX = this.lastClientX - rect.left;
    if (offsetX < 0 || offsetX > rect.width) {
      this.hide();
      return;
    }
    const contentX = offsetX + wrapper.scrollLeft;
    const leadingPad = resolveBarLabelLeadingPadding(this.options.barLabel);
    const date = this.geometry.dateForX(contentX - leadingPad).toDate();
    const left = `${contentX}px`;
    this.bodyLine.style.left = left;
    this.bodyLine.style.display = "block";
    if (this.label) {
      this.label.style.left = left;
      this.label.style.display = "block";
      this.label.textContent = this.formatLabel(date);
    }
  }
  hide() {
    if (this.bodyLine)
      this.bodyLine.style.display = "none";
    if (this.label)
      this.label.style.display = "none";
    this.lastClientX = null;
  }
  formatLabel(date) {
    const formatter = this.options.crosshairLabelFormat;
    if (formatter)
      return formatter(date, this.subTier);
    const fmt = this.subTier === "minute" || this.subTier === "hour" ? "MM/DD HH:mm" : "ddd MM/DD/YYYY";
    return dayjs(date).format(fmt);
  }
}
const SPLITVIEW_RESIZE_EVENT = "splitview-resize";
const SCROLLBAR_FALLBACK_ID = "timeline-horizontal-scroll";
class ScrollManager {
  constructor(element, options, domCache, chartContext, instanceId) {
    this.element = element;
    this.options = options;
    this.domCache = domCache;
    this.chartContext = chartContext;
    this.instanceId = instanceId;
    this.scrollbarResizeObserver = null;
    this.splitBarResizeHandler = null;
    this.timelineScrollHandlers = {};
    this.isSyncingScroll = false;
  }
  /**
   * Setup horizontal scroll synchronization between timeline and scrollbar
   */
  setupTimelineHorizontalScroll() {
    const horizontalScroll = this.domCache.horizontalScroll;
    const timelineHeader = this.domCache.timelineHeader;
    const timelineBodyWrapper = this.domCache.timelineBodyWrapper;
    if (!horizontalScroll || !timelineHeader || !timelineBodyWrapper) {
      return;
    }
    this.updateHorizontalScrollbarContent();
    this.applyScrollbarStylesToElement(horizontalScroll);
    if (this.timelineScrollHandlers.bodyScroll) {
      timelineBodyWrapper.removeEventListener("scroll", this.timelineScrollHandlers.bodyScroll);
    }
    if (this.timelineScrollHandlers.horizontalScroll) {
      horizontalScroll.removeEventListener("scroll", this.timelineScrollHandlers.horizontalScroll);
    }
    const handleHorizontalScroll = (_e) => {
      if (this.isSyncingScroll)
        return;
      this.isSyncingScroll = true;
      const scrollLeft = horizontalScroll.scrollLeft;
      timelineHeader.scrollLeft = scrollLeft;
      timelineBodyWrapper.scrollLeft = scrollLeft;
      requestAnimationFrame(() => {
        this.isSyncingScroll = false;
      });
    };
    const handleBodyScroll = (_e) => {
      if (this.isSyncingScroll)
        return;
      this.isSyncingScroll = true;
      const scrollLeft = timelineBodyWrapper.scrollLeft;
      horizontalScroll.scrollLeft = scrollLeft;
      timelineHeader.scrollLeft = scrollLeft;
      requestAnimationFrame(() => {
        this.isSyncingScroll = false;
      });
    };
    horizontalScroll.addEventListener("scroll", handleHorizontalScroll, { passive: true });
    timelineBodyWrapper.addEventListener("scroll", handleBodyScroll, { passive: true });
    this.timelineScrollHandlers = {
      horizontalScroll: handleHorizontalScroll,
      bodyScroll: handleBodyScroll
    };
  }
  /**
   * Position the horizontal scrollbar at the bottom of the gantt container
   */
  positionHorizontalScrollbar() {
    const horizontalScroll = this.domCache.horizontalScroll;
    const ganttContainer = this.domCache.ganttContainer;
    const tasksContainer = this.domCache.tasksContainer;
    if (!horizontalScroll || !ganttContainer) {
      logger.warn("Missing elements for scrollbar positioning");
      return;
    }
    void ganttContainer.offsetHeight;
    const tasksWidth = tasksContainer ? tasksContainer.offsetWidth : 0;
    const splitBar = this.domCache.splitBar;
    const splitBarWidth = splitBar ? splitBar.offsetWidth : 0;
    const totalOffset = tasksWidth + splitBarWidth + 2;
    const computedStyle = window.getComputedStyle(this.element);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    horizontalScroll.style.left = `${totalOffset + paddingLeft}px`;
    horizontalScroll.style.bottom = `${paddingBottom}px`;
    const availableWidth = ganttContainer.clientWidth - totalOffset;
    horizontalScroll.style.width = `${Math.max(0, availableWidth)}px`;
  }
  /**
   * Compensate for scrollbar width by adding padding to header
   */
  compensateForScrollbar() {
    const bodyWrapper = this.domCache.tasksBodyWrapper;
    const headerContainer = this.domCache.tasksHeader;
    if (!bodyWrapper || !headerContainer) {
      return;
    }
    const scrollbarWidth = bodyWrapper.offsetWidth - bodyWrapper.clientWidth;
    headerContainer.style.paddingRight = "";
    headerContainer.style.boxSizing = "";
    if (scrollbarWidth > 0) {
      headerContainer.style.paddingRight = `${scrollbarWidth}px`;
      headerContainer.style.boxSizing = "border-box";
    }
  }
  /**
   * Setup resize observer for scrollbar positioning
   */
  setupScrollbarResizeObserver() {
    if (!this.element) {
      return;
    }
    if (this.scrollbarResizeObserver) {
      this.scrollbarResizeObserver.disconnect();
    }
    this.scrollbarResizeObserver = new ResizeObserver(() => {
      this.positionHorizontalScrollbar();
    });
    this.scrollbarResizeObserver.observe(this.element);
    const ganttContainer = this.domCache.ganttContainer;
    if (ganttContainer) {
      this.scrollbarResizeObserver.observe(ganttContainer);
    }
    this.setupSplitBarResizeListener();
  }
  /**
   * Setup listener for split bar resize events
   */
  setupSplitBarResizeListener() {
    if (this.splitBarResizeHandler) {
      this.chartContext.removeEventListener(SPLITVIEW_RESIZE_EVENT, this.splitBarResizeHandler);
    }
    this.splitBarResizeHandler = () => {
      requestAnimationFrame(() => {
        this.positionHorizontalScrollbar();
      });
    };
    this.chartContext.addEventListener(SPLITVIEW_RESIZE_EVENT, this.splitBarResizeHandler);
  }
  /**
   * Update the horizontal scrollbar's content width to match timeline width
   */
  updateHorizontalScrollbarContent() {
    const horizontalScroll = this.domCache.horizontalScroll;
    const scrollContent = this.domCache.horizontalScrollContent;
    const timelineBody = this.domCache.timelineBody;
    if (!horizontalScroll || !scrollContent || !timelineBody) {
      logger.warn("Scrollbar update: Missing elements", {
        horizontalScroll: !!horizontalScroll,
        scrollContent: !!scrollContent,
        timelineBody: !!timelineBody
      });
      return;
    }
    const firstDataRow = timelineBody.querySelector(".timeline-data-row");
    const contentWidth = (firstDataRow == null ? void 0 : firstDataRow.offsetWidth) ?? timelineBody.scrollWidth;
    scrollContent.style.width = `${contentWidth}px`;
  }
  /**
   * Apply custom scrollbar styles for dark theme
   */
  applyScrollbarStylesToElement(element) {
    const { backgroundColor } = this.options;
    if (!this.isColorDark(backgroundColor)) {
      return;
    }
    const { borderColor, cellBorderColor } = this.options;
    const styleId = `scrollbar-${this.instanceId}-${Date.now()}`;
    const scrollbarStyles = `
    #${element.id || SCROLLBAR_FALLBACK_ID} {
      scrollbar-width: thin;
      scrollbar-color: ${borderColor} ${backgroundColor};
    }

    #${element.id || SCROLLBAR_FALLBACK_ID}::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    #${element.id || SCROLLBAR_FALLBACK_ID}::-webkit-scrollbar-track {
      background: ${backgroundColor};
      border-radius: 4px;
    }

    #${element.id || SCROLLBAR_FALLBACK_ID}::-webkit-scrollbar-thumb {
      background: ${borderColor};
      border-radius: 4px;
      border: 2px solid ${backgroundColor};
    }

    #${element.id || SCROLLBAR_FALLBACK_ID}::-webkit-scrollbar-thumb:hover {
      background: ${cellBorderColor};
    }
  `;
    if (!element.id) {
      element.id = `timeline-horizontal-scroll-${this.instanceId}`;
    }
    this.chartContext.injectStyles(scrollbarStyles, styleId);
  }
  /**
   * Update the options reference after a theme change or update() call.
   */
  updateOptions(options) {
    this.options = options;
  }
  /**
   * Disable mousewheel scrolling on timeline header
   */
  disableHeaderMousewheelScroll() {
    const timelineHeader = this.domCache.timelineHeader;
    if (!timelineHeader) {
      return;
    }
    const preventScroll = (e) => {
      e.preventDefault();
    };
    timelineHeader.addEventListener("wheel", preventScroll, { passive: false });
  }
  /**
   * Determine if a color is dark based on luminance
   */
  isColorDark(color) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  /**
   * Cleanup scroll handlers and observers
   */
  cleanup() {
    if (this.timelineScrollHandlers.bodyScroll || this.timelineScrollHandlers.horizontalScroll) {
      const horizontalScroll = this.domCache.horizontalScroll;
      const timelineBodyWrapper = this.domCache.timelineBodyWrapper;
      if (horizontalScroll && this.timelineScrollHandlers.horizontalScroll) {
        horizontalScroll.removeEventListener("scroll", this.timelineScrollHandlers.horizontalScroll);
      }
      if (timelineBodyWrapper && this.timelineScrollHandlers.bodyScroll) {
        timelineBodyWrapper.removeEventListener("scroll", this.timelineScrollHandlers.bodyScroll);
      }
      this.timelineScrollHandlers = {};
    }
    if (this.scrollbarResizeObserver) {
      this.scrollbarResizeObserver.disconnect();
      this.scrollbarResizeObserver = null;
    }
    if (this.splitBarResizeHandler) {
      this.chartContext.removeEventListener(SPLITVIEW_RESIZE_EVENT, this.splitBarResizeHandler);
      this.splitBarResizeHandler = null;
    }
  }
}
const MS_PER_DAY = 864e5;
const MIN_PIXELS_PER_DAY = 180 / 365.25 / 2;
const MAX_PIXELS_PER_DAY = 7680;
const MIN_PIXELS_PER_MS = MIN_PIXELS_PER_DAY / MS_PER_DAY;
const MAX_PIXELS_PER_MS = MAX_PIXELS_PER_DAY / MS_PER_DAY;
const ZOOM_STEP_FACTOR = 1.4;
const WHEEL_ZOOM_FACTOR = 1.1;
class ZoomManager {
  constructor(element, domCache, chartContext, instanceId, getPixelsPerMs, callbacks) {
    this.element = element;
    this.domCache = domCache;
    this.chartContext = chartContext;
    this.instanceId = instanceId;
    this.getPixelsPerMs = getPixelsPerMs;
    this.callbacks = callbacks;
    this.zoomHandler = null;
  }
  static clamp(pixelsPerMs) {
    return Math.min(MAX_PIXELS_PER_MS, Math.max(MIN_PIXELS_PER_MS, pixelsPerMs));
  }
  /** Setup zoom event listener (Ctrl+Wheel) */
  setupZoomEventListener() {
    const chartInstanceId = this.instanceId;
    const timelineElement = this.domCache.timelineContainer;
    if (!timelineElement) {
      logger.warn(`[${chartInstanceId}] Timeline element not found for zoom listener`);
      return;
    }
    if (this.zoomHandler) {
      timelineElement.removeEventListener("wheel", this.zoomHandler);
    }
    this.zoomHandler = (e) => {
      if (!e.ctrlKey)
        return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
      this.applyZoom(factor, e.clientX);
    };
    timelineElement.addEventListener("wheel", this.zoomHandler);
  }
  /** Zoom in (finer cells) by one click step. */
  zoomIn() {
    this.applyZoom(ZOOM_STEP_FACTOR);
  }
  /** Zoom out (coarser cells) by one click step. */
  zoomOut() {
    this.applyZoom(1 / ZOOM_STEP_FACTOR);
  }
  /** True when no further zoom-in is possible at the current level. */
  isAtMaxZoom() {
    return this.getPixelsPerMs() >= MAX_PIXELS_PER_MS - 1e-12;
  }
  /** True when no further zoom-out is possible at the current level. */
  isAtMinZoom() {
    return this.getPixelsPerMs() <= MIN_PIXELS_PER_MS + 1e-18;
  }
  applyZoom(factor, focalClientX) {
    const current = this.getPixelsPerMs();
    const next = ZoomManager.clamp(current * factor);
    if (next === current)
      return;
    const effectiveFactor = next / current;
    const bodyWrapper = this.domCache.timelineBodyWrapper;
    const oldScrollLeft = (bodyWrapper == null ? void 0 : bodyWrapper.scrollLeft) ?? 0;
    let focalX = 0;
    if (bodyWrapper) {
      const viewportWidth = bodyWrapper.clientWidth;
      if (focalClientX !== void 0) {
        const rect = bodyWrapper.getBoundingClientRect();
        focalX = Math.max(0, Math.min(viewportWidth, focalClientX - rect.left));
      } else {
        focalX = viewportWidth / 2;
      }
    }
    const newScrollLeft = Math.max(0, (oldScrollLeft + focalX) * effectiveFactor - focalX);
    this.callbacks.onZoomChange(next);
    this.callbacks.onToolbarUpdate();
    this.callbacks.onTimelineRerender();
    this.callbacks.onDependencyArrowsRender();
    this.applyHorizontalScroll(newScrollLeft, false);
    requestAnimationFrame(() => {
      this.callbacks.onScrollbarUpdate();
      this.callbacks.onScrollbarPosition();
      this.applyHorizontalScroll(newScrollLeft, true);
    });
  }
  applyHorizontalScroll(scrollLeft, includeScrollbar) {
    const { timelineBodyWrapper, timelineHeader, horizontalScroll } = this.domCache;
    if (timelineBodyWrapper)
      timelineBodyWrapper.scrollLeft = scrollLeft;
    if (timelineHeader)
      timelineHeader.scrollLeft = scrollLeft;
    if (includeScrollbar && horizontalScroll)
      horizontalScroll.scrollLeft = scrollLeft;
  }
  /** Update toolbar buttons after zoom */
  updateToolbarAfterZoom() {
    if (this.domCache.actionsContainer) {
      this.callbacks.onToolbarUpdate();
    }
  }
  /** Cleanup zoom handlers */
  cleanup() {
    if (this.zoomHandler) {
      const timelineElement = this.domCache.timelineContainer;
      if (timelineElement) {
        timelineElement.removeEventListener("wheel", this.zoomHandler);
      }
      this.zoomHandler = null;
    }
  }
}
const ATTR_ARIA_VALUENOW = "aria-valuenow";
class SplitView {
  constructor(chartContext, leftContent, rightContent, options = {}) {
    this.chartContext = chartContext;
    this.leftContent = leftContent;
    this.rightContent = rightContent;
    this.options = options;
    this.isDragging = false;
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
  }
  getSplitViewStyles() {
    return `
    .split-view-container {
      display: flex !important;
      height: 100%;
      width: 100%;
      position: relative;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
    }

    .split-view-container .split-left-container {
      flex-grow: 0 !important;
      flex-shrink: 1 !important;
      overflow: visible;
      display: flex !important;
      flex-direction: column;
      position: relative;
      box-sizing: border-box;
      height: fit-content;
      min-height: 100%;
    }

    .split-view-container .split-right-container {
      overflow: visible;
      position: relative;
      flex: 1 !important;
      display: flex !important;
      flex-direction: column;
      min-width: 0;
      box-sizing: border-box;
      height: fit-content;
      min-height: 100%;
    }
    
    .split-view-container .split-bar-container {
      cursor: col-resize !important;
      user-select: none !important;
      height: 100%;
      align-items: center;
      background: var(--split-bar-color, #DEE2E6);
      display: flex;
      flex: 0 0 auto;
      justify-content: center;
      min-width: 8px;
      width: 8px;
      z-index: 15;
      position: sticky;
      top: 0;
      box-sizing: border-box;
      border-left: 1px solid var(--split-bar-border-color, #BBBBBB);
      border-right: 1px solid var(--split-bar-border-color, #BBBBBB);
      opacity: 1;
      visibility: visible;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .split-view-container .split-bar-container:hover {
      background: var(--split-bar-hover-color, #007BFF);
      border-color: var(--split-bar-hover-border-color, #0056B3);
    }

    .split-view-container .split-bar-container .resize-handler {
      border-left: 1.5px solid var(--split-bar-handle-color, #666666);
      border-right: 1.5px solid var(--split-bar-handle-color, #666666);
      height: 20px;
      width: 4px;
      position: relative;
      pointer-events: none;
      box-sizing: border-box;
      background: rgba(102, 102, 102, 0.3);
      display: block;
      border-radius: 1px;
      margin: 0;
      padding: 0;
      opacity: 1;
      visibility: visible;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .split-view-container .split-bar-container:hover .resize-handler {
      background: rgba(255, 255, 255, 0.9);
      border-color: #FFFFFF;
    }

    .split-view-container.dragging {
      user-select: none;
      cursor: col-resize;
    }

    .split-view-container.dragging * {
      pointer-events: none;
    }

    .split-view-container.dragging .split-bar-container {
      pointer-events: all;
    }

    :host .split-view-container {
      display: flex !important;
      height: auto;
      width: 100%;
      position: relative;
      box-sizing: border-box;
      overflow-y: auto; /* shadow DOM */
    }
  `;
  }
  injectStyles() {
    this.chartContext.injectStyles(this.getSplitViewStyles(), "split-view-styles", {
      priority: "normal"
    });
  }
  buildElements() {
    const { leftContainerClass = "", leftContainerWidth = 425, rightContainerClass = "" } = this.options;
    this.leftContainer = createBox(this.chartContext, {
      className: `split-left-container${leftContainerClass ? " " + leftContainerClass : ""}`,
      style: {
        flexBasis: `${leftContainerWidth}px`
      }
    });
    this.rightContainer = createBox(this.chartContext, {
      className: `split-right-container${rightContainerClass ? " " + rightContainerClass : ""}`
    });
    const resizeHandler = createBox(this.chartContext, { className: "resize-handler" });
    const clickArea = createBox(this.chartContext, { className: "split-bar-click-area" });
    clickArea.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 100%;
      cursor: col-resize;
      z-index: 10;
      background: transparent;
      display: block;
      box-sizing: border-box;
    `;
    this.splitBarContainer = createBox(this.chartContext, { className: "split-bar-container" });
    this.splitBarContainer.setAttribute("role", "separator");
    this.splitBarContainer.setAttribute("aria-orientation", "vertical");
    this.splitBarContainer.setAttribute("aria-label", "Resize panels");
    this.splitBarContainer.setAttribute(ATTR_ARIA_VALUENOW, String(leftContainerWidth));
    this.splitBarContainer.setAttribute("aria-valuemin", "0");
    this.splitBarContainer.setAttribute("aria-valuemax", String(leftContainerWidth * 4));
    this.splitBarContainer.setAttribute("tabindex", "0");
    this.splitBarContainer.append(resizeHandler, clickArea);
    if (Array.isArray(this.leftContent)) {
      this.leftContainer.append(...this.leftContent);
    } else {
      this.leftContainer.append(this.leftContent);
    }
    if (Array.isArray(this.rightContent)) {
      this.rightContainer.append(...this.rightContent);
    } else {
      this.rightContainer.append(this.rightContent);
    }
  }
  attachEventListeners() {
    this.splitBarContainer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.isDragging = true;
      const container = this.splitBarContainer.closest(".split-view-container");
      container == null ? void 0 : container.classList.add("dragging");
      this.mouseMoveHandler = (moveEvent) => {
        var _a;
        if (!this.isDragging)
          return;
        const containerRect = (_a = this.leftContainer.parentElement) == null ? void 0 : _a.getBoundingClientRect();
        if (!containerRect)
          return;
        const newWidth = moveEvent.clientX - containerRect.left;
        const minWidth = 0;
        const maxWidth = containerRect.width - 50;
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        this.leftContainer.style.flexBasis = `${clampedWidth}px`;
        this.splitBarContainer.setAttribute(ATTR_ARIA_VALUENOW, String(Math.round(clampedWidth)));
        this.dispatchResizeEvent();
      };
      this.mouseUpHandler = () => {
        this.isDragging = false;
        const container2 = this.splitBarContainer.closest(".split-view-container");
        container2 == null ? void 0 : container2.classList.remove("dragging");
        this.dispatchResizeEvent();
        if (this.mouseMoveHandler) {
          this.chartContext.removeEventListener("mousemove", this.mouseMoveHandler);
          this.mouseMoveHandler = null;
        }
        if (this.mouseUpHandler) {
          this.chartContext.removeEventListener("mouseup", this.mouseUpHandler);
          this.mouseUpHandler = null;
        }
      };
      this.chartContext.addEventListener("mousemove", this.mouseMoveHandler);
      this.chartContext.addEventListener("mouseup", this.mouseUpHandler);
    });
    this.splitBarContainer.addEventListener("keydown", (e) => {
      const step = 10;
      let newWidth;
      const currentWidth = parseInt(this.leftContainer.style.flexBasis) || this.options.leftContainerWidth || 400;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newWidth = Math.max(0, currentWidth - step);
          this.leftContainer.style.flexBasis = `${newWidth}px`;
          this.splitBarContainer.setAttribute(ATTR_ARIA_VALUENOW, String(newWidth));
          this.dispatchResizeEvent();
          break;
        case "ArrowRight":
          e.preventDefault();
          newWidth = currentWidth + step;
          this.leftContainer.style.flexBasis = `${newWidth}px`;
          this.splitBarContainer.setAttribute(ATTR_ARIA_VALUENOW, String(newWidth));
          this.dispatchResizeEvent();
          break;
        case "Home":
          e.preventDefault();
          this.leftContainer.style.flexBasis = "0px";
          this.splitBarContainer.setAttribute(ATTR_ARIA_VALUENOW, "0");
          this.dispatchResizeEvent();
          break;
        case "End": {
          e.preventDefault();
          const container = this.splitBarContainer.parentElement;
          if (container) {
            const maxWidth = container.clientWidth - 50;
            this.leftContainer.style.flexBasis = `${maxWidth}px`;
            this.splitBarContainer.setAttribute(ATTR_ARIA_VALUENOW, String(Math.round(maxWidth)));
          }
          this.dispatchResizeEvent();
          break;
        }
      }
    });
  }
  dispatchResizeEvent() {
    const event = new CustomEvent("splitview-resize", {
      bubbles: true,
      detail: {
        leftWidth: parseInt(this.leftContainer.style.flexBasis) || 0
      }
    });
    this.chartContext.dispatchEvent(event);
  }
  cleanupEventListeners() {
    if (this.mouseMoveHandler) {
      this.chartContext.removeEventListener("mousemove", this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }
    if (this.mouseUpHandler) {
      this.chartContext.removeEventListener("mouseup", this.mouseUpHandler);
      this.mouseUpHandler = null;
    }
  }
  render() {
    this.injectStyles();
    this.buildElements();
    this.attachEventListeners();
    const splitViewContainer = createBox(this.chartContext, { className: "split-view-container" });
    splitViewContainer.append(this.leftContainer, this.splitBarContainer, this.rightContainer);
    return [splitViewContainer];
  }
  destroy() {
    this.cleanupEventListeners();
  }
}
const DATA_CHART_INSTANCE = "data-chart-instance";
class LayoutManager {
  constructor(element, options, domCache, chartContext, instanceId) {
    this.element = element;
    this.options = options;
    this.domCache = domCache;
    this.chartContext = chartContext;
    this.instanceId = instanceId;
  }
  /**
   * Update the options reference after a theme change or update() call.
   */
  updateOptions(options) {
    this.options = options;
  }
  /**
   * Setup proper positioning for chart container to support dialogs
   */
  setupChartContainerPositioning() {
    if (this.element) {
      const computedStyle = window.getComputedStyle(this.element);
      if (computedStyle.position === "static") {
        this.element.style.position = "relative";
      }
      this.element.style.isolation = "isolate";
    }
  }
  /**
   * Create the main layout structure with tasks and timeline containers
   */
  createLayout(ganttContainer, tasksTable, timelineElements, enableResize, tasksContainerWidth) {
    ganttContainer.style.position = "relative";
    ganttContainer.style.isolation = "isolate";
    const chartInstanceId = this.instanceId;
    const tasksContainer = createBox(this.chartContext, { className: Selectors.tasksContainer.slice(1) });
    let tasksHeader;
    let tasksBody;
    if (Array.isArray(tasksTable)) {
      tasksHeader = tasksTable[0];
      tasksBody = tasksTable[1];
    } else {
      logger.error("Tasks table should be an array of [header, body]");
      return;
    }
    const tasksBodyWrapper = createBox(this.chartContext, { className: Selectors.tasksBodyWrapper.slice(1) });
    tasksBodyWrapper.appendChild(tasksBody);
    tasksContainer.appendChild(tasksHeader);
    tasksContainer.appendChild(tasksBodyWrapper);
    const timelineWrapper = createBox(this.chartContext, { className: Selectors.timelineContainer.slice(1) });
    timelineWrapper.setAttribute(DATA_CHART_INSTANCE, chartInstanceId);
    const header = timelineElements[0];
    timelineWrapper.appendChild(header);
    const bodyWrapper = createBox(this.chartContext, { className: Selectors.timelineBodyWrapper.slice(1) });
    for (let i = 1; i < timelineElements.length - 1; i++) {
      bodyWrapper.appendChild(timelineElements[i]);
    }
    timelineWrapper.appendChild(bodyWrapper);
    const horizontalScroll = timelineElements[timelineElements.length - 1];
    if (enableResize) {
      const splitViewContainer = new SplitView(this.chartContext, tasksContainer, timelineWrapper, {
        leftContainerClass: "",
        leftContainerWidth: tasksContainerWidth,
        rightContainerClass: ""
      }).render();
      ganttContainer.append(...splitViewContainer);
    } else {
      tasksContainer.style.flex = `0 0 ${tasksContainerWidth}px`;
      ganttContainer.append(tasksContainer, timelineWrapper);
    }
    ganttContainer.appendChild(horizontalScroll);
  }
  /**
   * Sync column widths between tasks header and body
   */
  syncTasksColumnWidths() {
    const tasksContainer = this.domCache.tasksContainer;
    if (!tasksContainer) {
      return;
    }
  }
  /**
   * Fill empty space with empty rows to improve visual appearance
   */
  fillEmptyRowsAfterRender() {
    const ganttContainer = this.domCache.ganttContainer;
    const timelineBody = this.domCache.timelineBody;
    const tasksBody = this.domCache.tasksDataContainer;
    if (!ganttContainer || !timelineBody || !tasksBody) {
      return;
    }
    const oldEmptyTimelineRows = timelineBody.querySelectorAll(Selectors.timelineEmptyRow);
    oldEmptyTimelineRows.forEach((row) => row.remove());
    const oldEmptyTaskRows = tasksBody.querySelectorAll(Selectors.tasksEmptyRow);
    oldEmptyTaskRows.forEach((row) => row.remove());
    const containerHeight = ganttContainer.clientHeight;
    const existingRows = timelineBody.querySelectorAll(
      `${Selectors.timelineDataRow}:not(${Selectors.timelineEmptyRow})`
    );
    const existingRowCount = existingRows.length;
    const rowHeight = this.options.rowHeight;
    const totalRowsNeeded = Math.floor(containerHeight / rowHeight);
    const emptyRowsNeeded = Math.max(0, totalRowsNeeded - existingRowCount);
    if (emptyRowsNeeded === 0)
      return;
    let cellCount = 0;
    const firstRow = timelineBody.querySelector(Selectors.timelineDataRow);
    if (firstRow) {
      cellCount = firstRow.querySelectorAll(Selectors.timelineDataCell).length;
    } else {
      const timelineHeader = this.domCache.timelineHeader;
      if (timelineHeader) {
        const headerCells = timelineHeader.querySelectorAll(Selectors.timelineHeaderCell);
        cellCount = headerCells.length;
      }
    }
    if (cellCount === 0)
      return;
    const cellWidths = this.readSubHeaderCellWidths(cellCount);
    for (let i = 0; i < emptyRowsNeeded; i++) {
      const emptyRow = this.createEmptyTimelineRow(i, cellWidths);
      timelineBody.appendChild(emptyRow);
    }
    for (let i = 0; i < emptyRowsNeeded; i++) {
      const emptyRow = this.createEmptyTaskRow(i);
      tasksBody.appendChild(emptyRow);
    }
  }
  /**
   * Read per-cell widths from the rendered sub-tier header so empty rows can
   * mirror the timeline's variable cell widths.
   */
  readSubHeaderCellWidths(cellCount) {
    const timelineHeader = this.domCache.timelineHeader;
    const widths = [];
    if (timelineHeader) {
      const rows = timelineHeader.querySelectorAll(Selectors.timelineHeaderRow);
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        const cells = lastRow.querySelectorAll(Selectors.timelineHeaderCell);
        cells.forEach((cell) => {
          const w = cell.getBoundingClientRect().width;
          if (w > 0)
            widths.push(w);
        });
      }
    }
    if (widths.length === cellCount)
      return widths;
    const fallback = widths[0] ?? 0;
    return Array.from({ length: cellCount }, () => fallback);
  }
  /**
   * Create an empty timeline row
   */
  createEmptyTimelineRow(index, cellWidths) {
    const row = createBox(this.chartContext, {
      className: `${Selectors.timelineDataRow.slice(1)} ${Selectors.timelineEmptyRow.slice(1)}`
    });
    const { rowHeight } = this.options;
    const chartInstanceId = this.instanceId;
    row.setAttribute("data-taskid", `empty-${index}`);
    row.setAttribute(DATA_CHART_INSTANCE, chartInstanceId);
    row.style.height = `${rowHeight}px`;
    cellWidths.forEach((width) => {
      const cell = createBox(this.chartContext, {
        className: Selectors.timelineDataCell.slice(1),
        style: {
          // `width` here is the rendered border-box width read from the header
          // cell (via getBoundingClientRect). The data-cell CSS uses padding +
          // border with default content-box sizing, so we switch to border-box
          // here to make the inline width pin the *outer* box. Without this,
          // the cell would render `width + paddingX + borderX` and bloat the
          // empty rows past the real data rows, throwing off body.scrollWidth
          // (and the horizontal scrollbar) by 22px per cell.
          boxSizing: "border-box",
          height: `${rowHeight}px`,
          minWidth: `${width}px`,
          maxWidth: `${width}px`,
          flexShrink: "0"
        }
      });
      cell.setAttribute(DATA_CHART_INSTANCE, chartInstanceId);
      row.appendChild(cell);
    });
    return row;
  }
  /**
   * Create an empty task row
   */
  createEmptyTaskRow(index) {
    const row = createBox(this.chartContext, {
      className: `${Selectors.tasksDataRow.slice(1)} ${Selectors.tasksEmptyRow.slice(1)}`
    });
    const { rowHeight } = this.options;
    const chartInstanceId = this.instanceId;
    row.setAttribute("data-taskid", `empty-${index}`);
    row.setAttribute(DATA_CHART_INSTANCE, chartInstanceId);
    row.style.height = `${rowHeight}px`;
    ColumnList.forEach(({ key }) => {
      const cell = createBox(this.chartContext, {
        className: Selectors.tasksDataCell.slice(1),
        content: ""
      });
      cell.setAttribute("data-columnid", key);
      cell.setAttribute(DATA_CHART_INSTANCE, chartInstanceId);
      cell.style.height = `${rowHeight}px`;
      cell.style.color = "var(--text-color)";
      row.appendChild(cell);
    });
    return row;
  }
}
const DialogStyle = `
  .gantt-dialog-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    z-index: 999;
    overflow: hidden;
  }

  .gantt-dialog-container .dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .gantt-dialog-container .gantt-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--dialog-bg-color, white);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--dialog-border-color, #eee);
    z-index: 1000;
    min-width: 300px;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
  }

  .gantt-dialog .dialog-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--dialog-border-color, #eee);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--header-bg-color, #f3f3f3);
    flex-shrink: 0;
  }

  .gantt-dialog .dialog-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--header-text-color, #333);
    margin: 0;
  }

  .gantt-dialog .dialog-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    color: var(--text-color, #666);
    transition: color 0.2s;
    line-height: 1;
  }

  .gantt-dialog .dialog-close:hover {
    color: var(--text-color, #333);
  }

  .gantt-dialog .dialog-content {
    padding: 16px;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    background: var(--dialog-bg-color, white);
    color: var(--text-color, #333);
  }

  .gantt-dialog .dialog-content::-webkit-scrollbar {
    width: 8px;
  }

  .gantt-dialog .dialog-content::-webkit-scrollbar-track {
    background: var(--dialog-bg-color, #f1f1f1);
  }

  .gantt-dialog .dialog-content::-webkit-scrollbar-thumb {
    background: var(--border-color, #888);
    border-radius: 4px;
  }

  .gantt-dialog .dialog-content::-webkit-scrollbar-thumb:hover {
    background: var(--text-color, #555);
  }

  .gantt-dialog-container.show {
    display: block;
  }

  .gantt-dialog-container.animate .dialog-overlay {
    animation: fadeIn 0.2s ease-out;
  }

  .gantt-dialog-container.animate .gantt-dialog {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -48%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  .gantt-container {
    position: relative;
  }
`;
const DropdownStyle = `
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown .gantt-action-button {
    border-radius: 4px;
  }

  .dropdown.show .gantt-action-button {
    background: var(--toolbar-hover-bg-color, #f8f9fa);
    border-color: var(--button-bg-color, #0066cc);
  }
  
  .dropdown-btn {
    padding: 8px 16px;
    background-color: var(--toolbar-bg-color, #fff);
    color: var(--text-color, rgba(0, 0, 0, 0.7));
    border: 1px solid var(--toolbar-border-color, #ddd);
    cursor: pointer;
    font-weight: bold;
    border-radius: 2px;
    font-family: inherit;
    font-size: inherit;
    line-height: 1.5;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  
  .dropdown-btn:hover {
    background-color: var(--toolbar-hover-bg-color, #f8f9fa);
    border-color: var(--toolbar-border-color, #bbb);
  }
  
  .dropdown-btn:focus {
    outline: none;
    border-color: var(--button-bg-color, #0066cc);
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
  
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--dialog-bg-color, #fff);
    min-width: 160px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border-radius: 4px;
    right: 0;
    top: calc(100% + 4px);
    border: 1px solid var(--dialog-border-color, #D9D9D9);
    overflow: hidden;
  }
  
  .dropdown-content a {
    color: var(--text-color, #333);
    padding: 10px 14px;
    text-decoration: none;
    display: block;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.4;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  
  .dropdown-content a:hover {
    background-color: var(--toolbar-hover-bg-color, #f1f1f1);
  }
  
  .dropdown-content a:focus {
    background-color: var(--button-hover-bg-color, #e6f3ff);
    outline: none;
  }
  
  .dropdown.show .dropdown-content {
    display: block;
    animation: dropdownSlideDown 0.2s ease-out;
  }
  
  @keyframes dropdownSlideDown {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Shadow DOM specific adjustments */
  :host .dropdown {
    position: relative;
    display: inline-block;
  }
`;
const GanttStyle = `
  * {
    box-sizing: border-box;
  }

  .gantt-container * {
    user-select: none;
  }

  .gantt-actions-container {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 10px;
    flex: 0 0 40px;
    min-height: 40px;
    max-height: 40px;
    background-color: var(--background-color, #FFFFFF);
    border: 1px solid var(--border-color, #DFE0E1);
  }

  .gantt-actions-spacer {
    flex: 1;
    min-width: 8px;
  }

  .gantt-action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--toolbar-icon-color, #444);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    flex-shrink: 0;
  }

  .gantt-action-button:hover:not(:disabled) {
    background: var(--toolbar-hover-bg-color, rgba(0, 0, 0, 0.06));
    color: var(--toolbar-icon-hover-color, #111);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .gantt-action-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
    background: var(--toolbar-active-bg-color, rgba(0, 0, 0, 0.1));
  }

  .gantt-action-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring-color, #005fcc);
  }

  .gantt-action-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .gantt-action-button svg {
    width: 15px;
    height: 15px;
    stroke: currentColor;
    flex-shrink: 0;
  }

  .gantt-action-separator {
    width: 1px;
    height: 18px;
    background-color: var(--border-color, rgba(0, 0, 0, 0.1));
    margin: 0 6px;
    flex-shrink: 0;
  }

  .gantt-view-mode-display {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    height: 28px;
    font-size: 12.5px;
    color: var(--text-color, #555);
    background: var(--toolbar-hover-bg-color, rgba(0, 0, 0, 0.05));
    border-radius: 6px;
    margin-left: 2px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .gantt-view-mode-display svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
  
  .gantt-container {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    border: 1px solid var(--border-color, #DFE0E1);
    border-top: none;
    position: relative;
    background-color: var(--background-color, #FFFFFF);
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }
  
  .gantt-button {
    border: 1px solid var(--toolbar-border-color, rgba(0, 0, 0, 0.12));
    border-radius: 6px;
    background: var(--toolbar-bg-color, #fff);
    padding: 4px 12px;
    color: var(--text-color, rgba(0, 0, 0, 0.75));
    line-height: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    font-size: 13px;
  }

  .gantt-button:hover {
    background: var(--toolbar-hover-bg-color, rgba(0, 0, 0, 0.04));
    border-color: var(--toolbar-border-color, rgba(0, 0, 0, 0.2));
  }

  .gantt-button:disabled {
    color: rgba(128, 128, 128, 0.5);
    opacity: 0.6;
  }

  /* ── WCAG 2.1 AA: focus styles ─────────────────────────────────────────── */

  .tasks-data-row:focus-visible {
    outline: 2px solid var(--focus-ring-color, #005fcc);
    outline-offset: -2px;
  }

  .bar-timeline:focus {
    outline: none;
  }

  .bar-timeline:focus-visible {
    outline: 2px solid var(--focus-ring-color, #005fcc);
    outline-offset: 2px;
  }

  .tasks-data-row[aria-selected="true"] {
    background-color: var(--row-selected-bg-color, rgba(0, 95, 204, 0.12));
  }

  /* ── Selection: checkbox column ────────────────────────────────────────── */

  .gantt-checkbox-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    min-width: 28px;
    max-width: 28px;
  }

  .gantt-selection-checkbox,
  .gantt-select-all-checkbox {
    width: 15px;
    height: 15px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--button-bg-color, #005fcc);
  }

  /* ── Selection: toolbar count indicator ─────────────────────────────────── */

  .gantt-selection-count {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    height: 24px;
    font-size: 12px;
    font-weight: 500;
    color: var(--button-bg-color, #005fcc);
    background: var(--row-selected-bg-color, rgba(0, 95, 204, 0.12));
    border-radius: 12px;
    margin-left: 8px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Custom toolbar items (Phase 2) ────────────────────────────────────── */

  .gantt-toolbar-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    width: auto;
    min-width: 30px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--toolbar-icon-color, #444);
    white-space: nowrap;
    border-radius: 6px;
  }

  .gantt-toolbar-button span {
    line-height: 1;
  }

  .gantt-toolbar-select-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .gantt-toolbar-select-label {
    font-size: 13px;
    color: var(--text-color, #666);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .gantt-toolbar-select {
    height: 28px;
    padding: 0 24px 0 8px;
    border: 1px solid var(--border-color, #DFE0E1);
    border-radius: 4px;
    background: var(--toolbar-bg-color, #fff);
    color: var(--text-color, #333);
    font-size: 13px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    min-width: 100px;
    max-width: 180px;
    outline: none;
  }

  .gantt-toolbar-select:hover {
    border-color: var(--button-bg-color, #005fcc);
  }

  .gantt-toolbar-select:focus {
    border-color: var(--focus-ring-color, #005fcc);
    box-shadow: 0 0 0 2px rgba(0, 95, 204, 0.2);
  }

  /* ── prefers-reduced-motion ─────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .bar-timeline,
    .bar-timeline-progress,
    .bar-handle,
    .gantt-action-button,
    .gantt-button,
    .tasks-data-row,
    .gantt-dialog-container,
    .gantt-dialog {
      transition: none !important;
      animation: none !important;
    }
  }

  /* JS-detected reduced motion class (mirrors the media query in JS context) */
  .gantt-reduced-motion .bar-timeline,
  .gantt-reduced-motion .bar-timeline-progress,
  .gantt-reduced-motion .bar-handle,
  .gantt-reduced-motion .gantt-action-button,
  .gantt-reduced-motion .gantt-button,
  .gantt-reduced-motion .tasks-data-row,
  .gantt-reduced-motion .gantt-dialog-container,
  .gantt-reduced-motion .gantt-dialog {
    transition: none !important;
    animation: none !important;
  }
`;
const ScrollbarStyle = `
  .gantt-container ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  .gantt-container ::-webkit-scrollbar-track {
    background: var(--scrollbar-track-color, #F5F5F5);
    border-radius: 4px;
  }

  .gantt-container ::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb-color, #C1C1C1);
    border-radius: 4px;
    border: 2px solid var(--scrollbar-track-color, #F5F5F5);
  }

  .gantt-container ::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover-color, #A8A8A8);
  }

  .gantt-container * {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb-color, #C1C1C1) var(--scrollbar-track-color, #F5F5F5);
  }

  /* Shadow DOM support */
  :host .gantt-container ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  :host .gantt-container ::-webkit-scrollbar-track {
    background: var(--scrollbar-track-color, #F5F5F5);
    border-radius: 4px;
  }

  :host .gantt-container ::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb-color, #C1C1C1);
    border-radius: 4px;
    border: 2px solid var(--scrollbar-track-color, #F5F5F5);
  }

  :host .gantt-container ::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover-color, #A8A8A8);
  }

  :host .gantt-container * {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb-color, #C1C1C1) var(--scrollbar-track-color, #F5F5F5);
  }
`;
const TaskFormStyle = `

  .task-form {
    overflow: visible;
  }

  .task-form .form-group {
    margin-bottom: 18px;
    position: relative;
  }

  /* extra padding to last form group for breathing room */
  .task-form .form-group:last-of-type {
    margin-bottom: 24px;
  }

  .task-form label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: var(--text-color, #333);
  }

  .task-form input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--dialog-border-color, #ddd);
    border-radius: 4px;
    font-size: 14px;
    background-color: var(--dialog-bg-color, #fff);
    color: var(--text-color, #333);
  }

  .task-form input:focus {
    outline: none;
    border-color: var(--button-bg-color, #0066cc);
  }

  .task-form .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--dialog-border-color, #eee);
    position: sticky;
    bottom: -16px;
    background: var(--dialog-bg-color, white);
    margin-left: -16px;
    margin-right: -16px;
    margin-bottom: -16px;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
  }

  .task-form .btn-primary {
    background: var(--button-bg-color, #0066cc);
    color: var(--button-text-color, white);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }

  .task-form .btn-primary:hover {
    background: var(--button-hover-bg-color, #0052a3);
  }

  .task-form .btn-disabled,
  .task-form .btn-disabled:hover {
    background: #99c2ff;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .task-form .form-error {
    position: absolute;
    bottom: -15px;
    left: 0;
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.2;
    transition: opacity 0.2s ease;
  }

  .task-form .invalid {
    border-color: #dc3545;
  }

  .task-form .invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
`;
const TableStyle = `
  .tasks-container {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow-x: visible;
    overflow-y: visible;
  }

  .tasks-header {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--header-bg-color, #F3F3F3);
    overflow: hidden;
  }

  .tasks-header-row {
    display: grid;
    width: 100%;
  }

  .tasks-header-cell {
    padding: 0 10px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    /* Only top + bottom + right are drawn so the column divider (right) is
       painted exactly once between adjacent cells (the previous full-border
       shorthand had cell-A's right + cell-B's left = ~2px line). */
    border-top: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
    border-bottom: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
    border-right: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
    color: var(--text-color, #000);
    box-sizing: border-box;
    font-weight: 600;
  }

  .tasks-header-row .tasks-header-cell:last-child {
    border-right: none;
  }

  .tasks-body-wrapper {
    flex: 1;
    overflow: visible;
    position: relative;
  }

  .tasks-data-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tasks-data-row {
    display: grid;
    width: 100%;
    border-bottom: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
    box-sizing: border-box;
  }

  .tasks-data-cell {
    padding: 0 10px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    /* Only the right edge — the next cell supplies its own left, so each
       column divider is painted exactly once (the previous left+right setup
       doubled at every boundary, making verticals visibly thicker than the
       row dividers). */
    border-right: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
    color: var(--text-color, #000);
    box-sizing: border-box;
  }

  .tasks-data-row .tasks-data-cell:last-child {
    border-right: none;
  }

  .tasks-data-row .task-toggle-icon,
  .tasks-data-row .task-toggle-icon-blank {
    display: inline-block;
    margin-right: 5px;
    width: 10px;
    height: 10px;
    vertical-align: middle;
    flex-shrink: 0;
  }

  .tasks-data-row .task-toggle-icon {
    cursor: pointer;
    position: relative;
  }

  /* Chevron (expanded) - pointing down */
  .tasks-data-row .task-toggle-icon.expanded::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-right: 2px solid var(--text-color, #000000);
    border-bottom: 2px solid var(--text-color, #000000);
    transform: rotate(45deg);
    top: 0;
    left: 2px;
  }

  /* Chevron - pointing right (collapsed) */
  .tasks-data-row .task-toggle-icon.collapsed::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-right: 2px solid var(--text-color, #000000);
    border-bottom: 2px solid var(--text-color, #000000);
    transform: rotate(-45deg);
    top: 2px;
    left: 0;
  }

  .tasks-data-row .task-toggle-icon:hover::before {
    opacity: 0.7;
  }

  /* Inline editing */
  .tasks-data-cell.inline-editable {
    cursor: text;
  }

  .tasks-data-cell.inline-editable:hover {
    background-color: var(--inline-edit-hover-bg, rgba(0, 0, 0, 0.04));
  }

  .tasks-data-cell .inline-edit-input {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 4px;
    margin: 0;
    border: 1px solid var(--inline-edit-border-color, #87B7FE);
    border-radius: 3px;
    background: var(--inline-edit-bg, #FFFFFF);
    color: var(--text-color, #000);
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    outline: none;
    text-align: inherit;
  }

  .tasks-data-cell .inline-edit-input:focus {
    box-shadow: 0 0 0 2px var(--inline-edit-focus-ring, rgba(49, 140, 231, 0.25));
  }

  /* Shadow DOM specific */
  :host .tasks-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :host .tasks-header {
    position: sticky;
    top: 0;
    z-index: 10;
  }
`;
const TimelineStyle = `
  .gantt-container .timeline-container {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: var(--background-color, #FFFFFF);
    display: flex;
    flex-direction: column;
    overflow: visible;
    padding-bottom: 0;
    box-sizing: border-box;
  }

  .timeline-container .timeline-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--header-bg-color, #F3F3F3);
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    scrollbar-width: none; 
    -ms-overflow-style: none; 
  }

  .timeline-container .timeline-header::-webkit-scrollbar {
    display: none;
    height: 0;
    width: 0;
  }

  /* Shadow DOM specific */
  :host .timeline-container .timeline-header {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  :host .timeline-container .timeline-header::-webkit-scrollbar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }

  .timeline-container .timeline-header > .timeline-header-row {
    width: max-content;
    position: relative;
  }

  .timeline-container .timeline-body-wrapper {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
    width: 100%;
    min-height: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 0; 
    margin-bottom: 0;
  }

  .timeline-body-wrapper .timeline-horizontal-scroll, .timeline-container .timeline-body-wrapper::-webkit-scrollbar {
    display: none;
    height: 0;
    width: 0;
  }

  /* shadow DOM specific */
  :host .timeline-container .timeline-body-wrapper {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  :host .timeline-container .timeline-body-wrapper::-webkit-scrollbar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }


  .timeline-horizontal-scroll {
    position: absolute;
    bottom: 0;
    height: 17px;
    overflow-x: auto;
    overflow-y: hidden;
    z-index: 300;
    background-color: var(--split-bar-color, var(--background-color, #FFFFFF));
    border-top: 1px solid var(--border-color, #DFE0E1);
    box-sizing: border-box;
    display: block;
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  .timeline-horizontal-scroll-content {
    height: 1px;
    width: max-content;
  }

  .timeline-container .annotation,
  .timeline-container .annotation-container {
    position: absolute;
    top: 0;
    /* Annotations share the bar-container offset so their geometry-derived
       x-positions still land on the correct date when left-side bar labels
       reserve space at the timeline start. */
    left: var(--bar-label-leading-padding, 0px);
    pointer-events: none;
  }

  .timeline-container .annotation-container > * {
    pointer-events: auto;
  }

  .timeline-container .bar-container {
    position: absolute;
    top: 0;
    /* Shifted by the same leading pad that's added to the row cells, so bar
       positions stay aligned with the underlying timeline grid. */
    left: var(--bar-label-leading-padding, 0px);
    pointer-events: none;
  }

  .timeline-container .bar-container > * {
    pointer-events: auto;
  }

  .timeline-container .gantt-crosshair {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    z-index: 200;
    pointer-events: none;
    transform: translateX(-0.5px);
  }

  .timeline-container .gantt-crosshair-label {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 201;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  .timeline-container .bar-timeline {
    position: absolute;
    cursor: default;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timeline-container .bar-timeline.bar-interactive {
    cursor: move;
    cursor: grab;
  }

  .timeline-container .bar-timeline .bar-handle {
    height: 100%;
    width: 5px;
    position: absolute;
    z-index: 1000;
    background: transparent;
  }

  .timeline-container .bar-timeline .bar-handle:hover {
    cursor: col-resize;
  }

  .resizing {
    pointer-events: none;
    opacity: 0.8;
  }

  .timeline-container .bar-timeline .bar-handle.handle-left {
    left: -5px;
  }

  .timeline-container .bar-timeline .bar-handle.handle-right {
    right: -5px;
  }

  .timeline-container .bar-timeline.dragging {
    cursor: grabbing;
  }

  .timeline-container .bar-baseline {
    position: absolute;
    z-index: 1;
  }

  .timeline-container .bar-timeline.bar-summary {
    cursor: default;
    background: var(--summary-bar-color);
    height: 8px !important;
    border-radius: 0 !important;
    overflow: visible;
    align-items: flex-start;
  }

  .timeline-container .bar-timeline.bar-summary::before,
  .timeline-container .bar-timeline.bar-summary::after {
    content: '';
    position: absolute;
    top: 2px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    pointer-events: none;
  }

  .timeline-container .bar-timeline.bar-summary::before {
    left: -1px;
    border-top: 10px solid var(--summary-cap-left-color, var(--summary-bar-color));
    transform: rotate(270deg);
  }

  .timeline-container .bar-timeline.bar-summary::after {
    right: -1px;
    border-top: 10px solid var(--summary-cap-right-color, var(--summary-bar-color));
    transform: rotate(90deg);
  }

  .timeline-container .bar-timeline.bar-critical {
    background-color: var(--critical-bar-color, #e53935) !important;
  }

  .timeline-container .bar-timeline.bar-critical .bar-timeline-progress {
    background-color: color-mix(in srgb, var(--critical-bar-color, #e53935) 70%, white) !important;
  }

  svg path.critical-arrow {
    stroke: var(--critical-arrow-color, #e53935) !important;
    stroke-width: 2.5 !important;
  }

  .bar-timeline .bar-timeline-progress {
    position: absolute;
    pointer-events: none;
    height: 100%;
    left: 0;
  }

  /* Progress drag handle — small upward wedge anchored at the bottom edge of
     the bar, horizontally aligned to the right edge of the progress fill via
     left: <progress>%. Hidden by default, fades in on bar hover. */
  .timeline-container .bar-timeline .bar-progress-handle {
    position: absolute;
    bottom: -1px;
    width: 12px;
    height: 8px;
    transform: translateX(-50%);
    cursor: ew-resize;
    z-index: 4;
    pointer-events: auto;
    opacity: 0;
    transition: opacity 120ms ease-in;
    /* Upward-pointing wedge built with a clip-path triangle. White fill with a
       subtle outline so it reads against any bar color. */
    background-color: #FFFFFF;
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
  }

  .timeline-container .bar-timeline:hover .bar-progress-handle,
  .timeline-container .bar-timeline .bar-progress-handle.dragging,
  .timeline-container .bar-timeline.progress-dragging .bar-progress-handle {
    opacity: 1;
  }

  /* While dragging the progress, suppress the bar's grab cursor so users see
     the resize affordance the whole time. */
  .timeline-container .bar-timeline.progress-dragging,
  .timeline-container .bar-timeline.progress-dragging.bar-interactive {
    cursor: ew-resize;
  }

  /* Live percent label that surfaces under the wedge while the user drags.
     Anchored to the same left percentage as the handle so it tracks the
     pointer in lockstep. Hidden by default; opacity-toggled when the bar
     gains the .progress-dragging class. */
  .timeline-container .bar-timeline .bar-progress-handle-label {
    position: absolute;
    bottom: -22px;
    transform: translateX(-50%);
    padding: 2px 6px;
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.75);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 100ms ease-in;
    z-index: 5;
  }

  .timeline-container .bar-timeline.progress-dragging .bar-progress-handle-label {
    opacity: 1;
  }

  .bar-timeline .bar-label {
    white-space: nowrap;
    pointer-events: none;
    overflow: hidden;
    z-index: 2;
  }

  /* Outside-positioned labels: anchored to the bar's edge, vertically centred,
     allowed to overflow the bar so narrow tasks aren't truncated. */
  .bar-timeline .bar-label.bar-label-outside {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    overflow: visible;
    color: var(--text-color, #000);
    line-height: 1;
    z-index: 3;
  }

  .bar-timeline .bar-label.bar-label-outside-right {
    left: 100%;
    padding-left: 8px;
    text-align: left;
  }

  .bar-timeline .bar-label.bar-label-outside-left {
    right: 100%;
    padding-right: 8px;
    text-align: right;
  }

  .timeline-container .timeline-body {
    width: max-content;
    position: relative;
    padding-bottom: 17px;
  }
  
  .timeline-container .timeline-header-row,
  .timeline-container .timeline-data-row {
    display: flex;
    /* Shrink-to-content so the row width is deterministic (sum of pseudo +
       cells), matching what the horizontal scrollbar measures. Without this,
       data rows can fill the parent's max-content slot and end up wider than
       their cells, leaving stale grid space at the far right. */
    width: max-content;
  }

  /* Leading-cell pseudo: when bar labels are positioned on the left, this
     pseudo fills the reserved area at the start of every row with a bordered
     box that visually extends the grid. Hidden by default — StyleManager
     toggles --bar-label-leading-pad-display to block when leadingPadding > 0.
     Only the right edge is drawn so it doesn't double up against the first
     cell's divider. */
  .timeline-container .timeline-header-row::before,
  .timeline-container .timeline-data-row::before {
    content: '';
    display: var(--bar-label-leading-pad-display, none);
    flex-shrink: 0;
    flex-basis: var(--bar-label-leading-padding, 0px);
    border-right: var(--cell-border-width, 1px) solid var(--column-line-color, var(--cell-border-color, #eff0f0));
    box-sizing: border-box;
  }

  .timeline-container .timeline-header-cell,
  .timeline-container .timeline-data-cell {
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Only bottom + right are drawn so each grid line is painted exactly
       once (adjacent borders don't double up). Borders stay inside the
       cell's rowHeight allocation via the global box-sizing: border-box
       (see Gantt.style.ts), keeping height math identical to the prior
       four-border setup — rows still occupy exactly rowHeight, so the
       timeline stays vertically aligned with the tasks pane.
       --column-line-color on the vertical so columnLines:false collapses
       verticals to transparent without affecting horizontal dividers. */
    border-bottom: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
    border-right: var(--cell-border-width, 1px) solid var(--column-line-color, var(--cell-border-color, #eff0f0));
    color: var(--text-color, #000);
  }

  /* Anchor the very top edge of the grid — the cell rule above only paints
     bottom + right. Border stays inside the cell's rowHeight allocation
     (border-box), so it doesn't shift the body downward. */
  .timeline-container .timeline-header > .timeline-header-row:first-child .timeline-header-cell {
    border-top: var(--cell-border-width, 1px) solid var(--cell-border-color, #eff0f0);
  }

  /* Drop the trailing edge so the grid has no outer right border (mirrors
     the tasks pane). */
  .timeline-container .timeline-header-row .timeline-header-cell:last-child,
  .timeline-container .timeline-data-row .timeline-data-cell:last-child {
    border-right: none;
  }

  .timeline-container .timeline-header-cell {
    background-color: var(--header-bg-color, #F3F3F3);
    color: var(--header-text-color, #333);
  }
`;
const TooltipStyle = `
  .apexgantt-tooltip {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.12s ease-out, transform 0.12s ease-out;
    transform: translateY(2px);
    font-family: inherit;
    font-size: 12px;
    line-height: 1.45;
    display: none;
    max-width: 320px;
    box-sizing: border-box;
    /* Soft shadow draws the outline of the combined body+arrow shape.
       Filter (rather than box-shadow on individual children) follows the
       silhouette of the rotated arrow, so the shadow wraps around the
       diamond corner with no visible seam at the body-arrow junction. */
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.14)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
  }

  .apexgantt-tooltip.visible {
    display: block;
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  :host .apexgantt-tooltip {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.12s ease-out, transform 0.12s ease-out;
    transform: translateY(2px);
    font-family: inherit;
    font-size: 12px;
    line-height: 1.45;
    display: none;
    max-width: 320px;
    box-sizing: border-box;
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.14)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
  }

  :host .apexgantt-tooltip.visible {
    display: block;
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .apexgantt-tooltip .tooltip-content {
    padding: 8px 10px;
    border-radius: 6px;
    background-color: var(--apexgantt-tooltip-bg, #ffffff);
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
    /* In front of the arrow so the half of the rotated square that sits
       inside the body is masked, leaving only the diamond corner
       protruding. No border here — the shape is outlined by the parent's
       drop-shadow filter, which traces the body+arrow silhouette as one. */
    position: relative;
    z-index: 2;
  }

  .apexgantt-tooltip .tooltip-content > div {
    margin: 2px 0;
    word-break: break-word;
    line-height: 1.45;
  }

  .apexgantt-tooltip .tooltip-content strong {
    font-weight: 600;
    margin-right: 6px;
    opacity: 0.7;
  }

  .apexgantt-tooltip .tooltip-content span {
    display: inline;
  }

  /* Title separator only applies when the template renders sibling rows
     (title + body). If the template has a single wrapper div, the border
     would otherwise float at the bottom of the tooltip. */
  .apexgantt-tooltip .tooltip-content > div:first-child:not(:last-child) {
    margin-top: 0;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    font-weight: 600;
    font-size: 13px;
  }

  .apexgantt-tooltip .tooltip-content > div:first-child:not(:last-child) strong {
    font-weight: 600;
    opacity: 1;
  }

  .apexgantt-tooltip .tooltip-content > div:last-child {
    margin-bottom: 0;
  }

  /* Arrow rendered as a 10×10 bg-colored square rotated 45°. Center sits
     exactly on the body's bottom (or top) edge so the diamond's left and
     right corners meet the body edge without sub-pixel offset. No border
     of its own — the parent's drop-shadow handles the outline. */
  .apexgantt-tooltip .tooltip-arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: var(--apexgantt-tooltip-bg, #ffffff);
    transform: rotate(45deg);
    z-index: 1;
    pointer-events: none;
  }

  .apexgantt-tooltip .tooltip-arrow.arrow-below {
    /* tooltip above the bar — visible corner points down */
    bottom: -5px;
  }

  .apexgantt-tooltip .tooltip-arrow.arrow-above {
    /* tooltip below the bar — visible corner points up */
    top: -5px;
  }
`;
class StyleManager {
  constructor(element, domCache, options, chartContext, isShadowDOM, instanceId) {
    this.element = element;
    this.domCache = domCache;
    this.options = options;
    this.chartContext = chartContext;
    this.isShadowDOM = isShadowDOM;
    this.instanceId = instanceId;
    this.stylesInjected = false;
  }
  /**
   * Setup shadow DOM environment if needed
   */
  setupShadowDOMEnvironment() {
    if (!this.isShadowDOM) {
      return;
    }
    const shadowRoot = this.chartContext.getContext();
    const host = shadowRoot.host;
    if (host) {
      host.style.display = "block";
      host.style.boxSizing = "border-box";
      host.style.contain = "layout style";
    }
    if (this.element) {
      this.element.style.display = "block";
      this.element.style.boxSizing = "border-box";
    }
  }
  /**
   * Inject all required styles with context awareness
   */
  injectGanttStyles() {
    if (this.stylesInjected) {
      return;
    }
    if (this.isShadowDOM) {
      this.injectStylesDirectly();
      return;
    }
    try {
      const stylesheets = [
        { content: GanttStyle, id: "gantt-core-styles", options: { priority: "high" } },
        { content: TimelineStyle, id: "gantt-timeline-styles" },
        { content: TableStyle, id: "gantt-table-styles" },
        { content: DialogStyle, id: "gantt-dialog-styles" },
        { content: TaskFormStyle, id: "gantt-taskform-styles" },
        { content: TooltipStyle, id: "gantt-tooltip-styles" },
        { content: ToolbarStyle, id: "gantt-toolbar-styles" },
        { content: DropdownStyle, id: "gantt-dropdown-styles" },
        { content: ScrollbarStyle, id: "gantt-scrollbar-styles" }
      ];
      this.chartContext.injectStylesheets(stylesheets);
      this.stylesInjected = true;
    } catch (error) {
      logger.error("injectGanttStyles: ChartContext injection failed", error);
    }
  }
  /**
   * Inject styles directly for shadow DOM
   */
  injectStylesDirectly() {
    const shadowRoot = this.chartContext.getContext();
    if (shadowRoot.querySelector("#gantt-all-styles")) {
      this.stylesInjected = true;
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.id = "gantt-all-styles";
    styleElement.textContent = `
    /* Shadow DOM CSS Reset - Critical for proper layout */
    :host {
      all: initial;
      display: block;
      contain: layout style;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    div, table, thead, tbody, tr, td, th {
      display: revert;
      margin: 0;
      padding: 0;
      border: 0;
    }

    .split-view-container,
    .gantt-container {
      display: flex !important;
      width: 100% !important;
      height: 100% !important;
    }

    .split-left-container,
    .split-right-container {
      display: block !important;
    }

    .timeline-container {
      flex: 1 !important;
      overflow: auto !important;
      position: relative !important;
    }

    .tasks-container {
      flex-shrink: 0 !important;
      overflow: auto !important;
    }

    ${GanttStyle}
    ${TimelineStyle}
    ${TableStyle}
    ${DialogStyle}
    ${TaskFormStyle}
    ${TooltipStyle}
    ${ToolbarStyle}
    ${DropdownStyle}
    ${ScrollbarStyle}
  `;
    shadowRoot.insertBefore(styleElement, shadowRoot.firstChild);
    this.stylesInjected = true;
  }
  /**
   * Set CSS custom properties based on options.
   * User-defined --apex-gantt-* CSS variables on the container element take
   * precedence over JS option values.
   */
  setCSSVariables() {
    [
      "--apex-gantt-bar-fill",
      "--apex-gantt-background-color",
      "--apex-gantt-row-bg-even",
      "--apex-gantt-row-bg-odd",
      "--apex-gantt-header-bg",
      "--apex-gantt-grid-line",
      "--apex-gantt-dependency-line",
      "--apex-gantt-font-family",
      "--apex-gantt-font-size",
      "--apex-gantt-font-color"
    ].forEach((v) => this.element.style.removeProperty(v));
    const userVars = readGanttCSSVars(this.element);
    const cellBorderColor = userVars.gridLine || this.options.cellBorderColor;
    const cellBorderWidth = this.options.cellBorderWidth;
    const fontColor = userVars.fontColor || this.options.fontColor;
    const headerBackground = userVars.headerBg || this.options.headerBackground;
    const { tooltipBGColor, tooltipBorderColor, borderColor, barTextColor } = this.options;
    const backgroundColor = userVars.bgColor || this.options.backgroundColor;
    const barBackgroundColor = userVars.barFill || this.options.barBackgroundColor;
    const arrowColor = userVars.dependencyLine || this.options.arrowColor;
    const rowBackgroundColors = [...this.options.rowBackgroundColors ?? []];
    if (userVars.rowBgEven) {
      rowBackgroundColors[0] = userVars.rowBgEven;
    }
    if (userVars.rowBgOdd) {
      rowBackgroundColors[1] = userVars.rowBgOdd;
    }
    this.element.style.setProperty("--apex-gantt-row-bg-even", rowBackgroundColors[0] ?? "");
    this.element.style.setProperty("--apex-gantt-row-bg-odd", rowBackgroundColors[1] ?? rowBackgroundColors[0] ?? "");
    this.element.style.setProperty("--cell-border-color", cellBorderColor);
    this.element.style.setProperty("--cell-border-width", cellBorderWidth);
    this.element.style.setProperty(
      "--column-line-color",
      this.options.columnLines === false ? "transparent" : cellBorderColor
    );
    this.element.style.setProperty("--gantt-font-color", fontColor);
    this.element.style.setProperty("--text-color", fontColor);
    this.element.style.setProperty("--header-bg-color", headerBackground);
    this.element.style.setProperty("--header-text-color", fontColor);
    this.element.style.setProperty("--tooltip-bg-color", tooltipBGColor);
    this.element.style.setProperty("--tooltip-border-color", tooltipBorderColor);
    this.element.style.setProperty("--tooltip-text-color", fontColor);
    this.element.style.setProperty("--background-color", backgroundColor);
    this.element.style.setProperty("--border-color", borderColor);
    this.element.style.setProperty("--dialog-bg-color", backgroundColor);
    this.element.style.setProperty("--dialog-border-color", borderColor);
    this.element.style.setProperty("--button-bg-color", barBackgroundColor);
    this.element.style.setProperty("--button-text-color", barTextColor);
    this.element.style.setProperty("--button-hover-bg-color", arrowColor);
    this.element.style.setProperty("--toolbar-bg-color", backgroundColor);
    this.element.style.setProperty("--toolbar-border-color", borderColor);
    this.element.style.setProperty("--toolbar-hover-bg-color", cellBorderColor);
    this.element.style.setProperty("--scrollbar-track-color", backgroundColor);
    this.element.style.setProperty("--scrollbar-thumb-color", borderColor);
    this.element.style.setProperty("--scrollbar-thumb-hover-color", cellBorderColor);
    this.element.style.setProperty("--split-bar-color", cellBorderColor);
    this.element.style.setProperty("--split-bar-hover-color", arrowColor);
    this.element.style.setProperty("--split-bar-border-color", borderColor);
    this.element.style.setProperty("--split-bar-handle-color", fontColor);
    this.element.style.setProperty("--split-bar-hover-border-color", arrowColor);
    this.element.style.setProperty("--critical-bar-color", this.options.criticalBarColor);
    this.element.style.setProperty("--critical-arrow-color", this.options.criticalArrowColor);
    this.element.style.setProperty("--summary-bar-color", this.options.summaryBarColor);
    this.element.style.setProperty("--milestone-color", this.options.milestoneColor);
    const labelLeadingPad = resolveBarLabelLeadingPadding(this.options.barLabel);
    this.element.style.setProperty("--bar-label-leading-padding", `${labelLeadingPad}px`);
    if (labelLeadingPad > 0) {
      this.element.style.setProperty("--bar-label-leading-pad-display", "block");
    } else {
      this.element.style.removeProperty("--bar-label-leading-pad-display");
    }
    const isDarkTheme = this.isColorDark(backgroundColor);
    if (isDarkTheme) {
      this.element.style.setProperty("--toolbar-icon-filter", "invert(1) brightness(2)");
    } else {
      this.element.style.setProperty("--toolbar-icon-filter", "none");
    }
  }
  /**
   * Handle watermark display based on license validation
   */
  handleWatermark() {
    const ganttContainerElement = this.domCache.ganttContainer;
    if (!ganttContainerElement) {
      return;
    }
    const ganttContainer = ganttContainerElement.parentNode;
    if (!ganttContainer) {
      return;
    }
    if (LicenseManager.isLicenseValid()) {
      Watermark.remove(ganttContainer);
    } else {
      Watermark.add(ganttContainer);
    }
  }
  /**
   * Determine if a color is dark based on luminance
   */
  isColorDark(color) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  /**
   * Cleanup scrollbar-specific styles
   */
  cleanupScrollbarStyles() {
    try {
      this.chartContext.getInjectedStyleIds().filter((id) => id.startsWith(`scrollbar-${this.instanceId}`)).forEach((id) => this.chartContext.removeStyles(id));
      const horizontalScroll = this.domCache.horizontalScroll;
      if (horizontalScroll) {
        const width = horizontalScroll.style.width;
        const left = horizontalScroll.style.left;
        const bottom = horizontalScroll.style.bottom;
        horizontalScroll.removeAttribute("style");
        if (width)
          horizontalScroll.style.width = width;
        if (left)
          horizontalScroll.style.left = left;
        if (bottom)
          horizontalScroll.style.bottom = bottom;
      }
    } catch (error) {
      logger.warn("Error cleaning up scrollbar styles:", error);
    }
  }
  /**
   * Update the options reference after a theme change or update() call.
   */
  updateOptions(options) {
    this.options = options;
  }
  /**
   * Reset styles injected flag (useful for re-rendering)
   */
  resetStylesInjected() {
    this.stylesInjected = false;
  }
  /**
   * Check if styles have been injected
   */
  areStylesInjected() {
    return this.stylesInjected;
  }
}
const ATTR_TASK_ID$1 = "data-taskid";
const ATTR_ARIA_LEVEL = "aria-level";
class KeyboardNavigationManager {
  constructor(chartContext, dataManager, getTaskContainer, reRender, selectionManager) {
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.getTaskContainer = getTaskContainer;
    this.reRender = reRender;
    this.selectionManager = selectionManager;
    this.keydownHandler = null;
  }
  /**
   * Attach the keydown listener to the tasks-data-container element.
   * Call once after each render.
   */
  attach() {
    this.detach();
    const container = this.getTaskContainer();
    if (!container)
      return;
    this.initRovingTabindex(container);
    this.keydownHandler = (e) => this.handleKeydown(e, container);
    container.addEventListener("keydown", this.keydownHandler);
  }
  /** Remove the keydown listener. */
  detach() {
    const container = this.getTaskContainer();
    if (container && this.keydownHandler) {
      container.removeEventListener("keydown", this.keydownHandler);
    }
    this.keydownHandler = null;
  }
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  /** Set tabindex="0" on the first real row; all others get tabindex="-1". */
  initRovingTabindex(container) {
    const rows = this.getVisibleRows(container);
    rows.forEach((row, i) => {
      row.setAttribute("tabindex", i === 0 ? "0" : "-1");
    });
  }
  /** Returns task rows (excludes empty filler rows). */
  getVisibleRows(container) {
    return Array.from(
      container.querySelectorAll(`${Selectors.tasksDataRow}:not(${Selectors.tasksEmptyRow})`)
    );
  }
  /** Focus a row and update the roving tabindex. */
  moveFocusToRow(row, container) {
    const rows = this.getVisibleRows(container);
    rows.forEach((r) => r.setAttribute("tabindex", "-1"));
    row.setAttribute("tabindex", "0");
    row.focus();
  }
  handleKeydown(e, container) {
    var _a;
    const rows = this.getVisibleRows(container);
    if (rows.length === 0)
      return;
    const focused = this.chartContext.getActiveElement();
    const currentIndex = focused ? rows.indexOf(focused) : -1;
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = rows[Math.min(currentIndex + 1, rows.length - 1)];
        if (next)
          this.moveFocusToRow(next, container);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = rows[Math.max(currentIndex - 1, 0)];
        if (prev)
          this.moveFocusToRow(prev, container);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (currentIndex < 0 || !focused)
          break;
        const taskId = focused.getAttribute(ATTR_TASK_ID$1);
        if (!taskId)
          break;
        const isExpanded = focused.getAttribute("aria-expanded");
        if (isExpanded === "false") {
          this.dataManager.toggleTask(taskId);
          this.reRender();
        } else if (isExpanded === "true") {
          const currentLevel = parseInt(focused.getAttribute(ATTR_ARIA_LEVEL) || "1", 10);
          const nextRow = rows[currentIndex + 1];
          if (nextRow) {
            const nextLevel = parseInt(nextRow.getAttribute(ATTR_ARIA_LEVEL) || "1", 10);
            if (nextLevel > currentLevel) {
              this.moveFocusToRow(nextRow, container);
            }
          }
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (currentIndex < 0 || !focused)
          break;
        const taskId = focused.getAttribute(ATTR_TASK_ID$1);
        if (!taskId)
          break;
        const isExpanded = focused.getAttribute("aria-expanded");
        if (isExpanded === "true") {
          this.dataManager.toggleTask(taskId);
          this.reRender();
        } else {
          const currentLevel = parseInt(focused.getAttribute(ATTR_ARIA_LEVEL) || "1", 10);
          if (currentLevel <= 1)
            break;
          for (let i = currentIndex - 1; i >= 0; i--) {
            const candidate = rows[i];
            const candidateLevel = parseInt(candidate.getAttribute(ATTR_ARIA_LEVEL) || "1", 10);
            if (candidateLevel < currentLevel) {
              this.moveFocusToRow(candidate, container);
              break;
            }
          }
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = rows[0];
        if (first)
          this.moveFocusToRow(first, container);
        break;
      }
      case "End": {
        e.preventDefault();
        const last = rows[rows.length - 1];
        if (last)
          this.moveFocusToRow(last, container);
        break;
      }
      case " ": {
        e.preventDefault();
        if (!focused)
          break;
        const taskEl = focused.getAttribute(ATTR_TASK_ID$1) ? focused : focused.closest(`[${ATTR_TASK_ID$1}]`);
        const taskId = (taskEl == null ? void 0 : taskEl.getAttribute(ATTR_TASK_ID$1)) ?? null;
        if (!taskId)
          break;
        if (this.selectionManager) {
          if (e.shiftKey) {
            this.selectionManager.handleClick(taskId, { ctrlKey: false, metaKey: false, shiftKey: true });
          } else {
            this.selectionManager.toggleTask(taskId);
          }
        } else {
          const rowEl = taskEl;
          const isSelected = rowEl.getAttribute("aria-selected") === "true";
          rowEl.setAttribute("aria-selected", isSelected ? "false" : "true");
        }
        break;
      }
      case "a": {
        if (!(e.ctrlKey || e.metaKey))
          break;
        e.preventDefault();
        (_a = this.selectionManager) == null ? void 0 : _a.selectAll();
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (!focused)
          break;
        const taskId = focused.getAttribute(ATTR_TASK_ID$1);
        if (!taskId)
          break;
        const bar = this.chartContext.querySelector(
          `[data-taskid="${CSS.escape(taskId)}"].bar-timeline`
        );
        if (bar) {
          bar.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        }
        break;
      }
      case "Escape": {
        if (this.selectionManager && this.selectionManager.getSelectedIds().size > 0) {
          this.selectionManager.clearSelection();
        } else if (focused) {
          focused.blur();
        }
        break;
      }
    }
  }
}
class SelectionManager {
  constructor(chartContext, dataManager, getElement) {
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.getElement = getElement;
    this.selectedIds = /* @__PURE__ */ new Set();
    this.lastClickedId = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /** Returns currently selected task objects. */
  getSelectedTasks() {
    return Array.from(this.selectedIds).map((id) => this.dataManager.getTaskById(id)).filter((t) => t !== null);
  }
  /** Returns currently selected task IDs. */
  getSelectedIds() {
    return new Set(this.selectedIds);
  }
  /** Programmatically set the selection to the given IDs. */
  setSelectedTasks(ids) {
    const previous = new Set(this.selectedIds);
    this.selectedIds.clear();
    ids.forEach((id) => {
      if (this.dataManager.getTaskById(id)) {
        this.selectedIds.add(id);
      }
    });
    this.syncDom();
    this.emitChange(previous);
  }
  /** Clear all selection. */
  clearSelection() {
    if (this.selectedIds.size === 0)
      return;
    const previous = new Set(this.selectedIds);
    this.selectedIds.clear();
    this.lastClickedId = null;
    this.syncDom();
    this.emitChange(previous);
  }
  /** Toggle a single task's selection (used by Space key / checkbox click). */
  toggleTask(taskId) {
    const previous = new Set(this.selectedIds);
    if (this.selectedIds.has(taskId)) {
      this.selectedIds.delete(taskId);
    } else {
      this.selectedIds.add(taskId);
    }
    this.lastClickedId = taskId;
    this.syncDom();
    this.emitChange(previous);
  }
  /**
   * Handle a click-based selection with modifier key support.
   *
   * - Plain click: replace selection with this task
   * - Ctrl/Cmd click: toggle this task in the existing selection
   * - Shift click: range-select from last clicked to this task
   */
  handleClick(taskId, event) {
    const previous = new Set(this.selectedIds);
    if (event.shiftKey && this.lastClickedId) {
      this.rangeSelect(this.lastClickedId, taskId);
    } else if (event.ctrlKey || event.metaKey) {
      if (this.selectedIds.has(taskId)) {
        this.selectedIds.delete(taskId);
      } else {
        this.selectedIds.add(taskId);
      }
      this.lastClickedId = taskId;
    } else {
      this.selectedIds.clear();
      this.selectedIds.add(taskId);
      this.lastClickedId = taskId;
    }
    this.syncDom();
    this.emitChange(previous);
  }
  /** Select all visible tasks. */
  selectAll() {
    const previous = new Set(this.selectedIds);
    const visible = this.dataManager.getFlatVisibleTasks();
    this.selectedIds.clear();
    visible.forEach((t) => this.selectedIds.add(t.id));
    this.syncDom();
    this.emitChange(previous);
  }
  /** Select all children of a group (parent task). */
  selectGroup(parentId) {
    const previous = new Set(this.selectedIds);
    const children = this.dataManager.getNestedChildTasks(parentId, true);
    this.selectedIds.add(parentId);
    children.forEach((child) => this.selectedIds.add(child.id));
    this.syncDom();
    this.emitChange(previous);
  }
  /** Check if a specific task is selected. */
  isSelected(taskId) {
    return this.selectedIds.has(taskId);
  }
  /**
   * Restore selection state after a re-render.
   * Prunes IDs that no longer exist in the data model.
   */
  restoreAfterRender() {
    const validIds = /* @__PURE__ */ new Set();
    this.selectedIds.forEach((id) => {
      if (this.dataManager.getTaskById(id)) {
        validIds.add(id);
      }
    });
    this.selectedIds = validIds;
    this.syncDom();
  }
  /** Snapshot the current selection (used by StateManager before re-render). */
  captureState() {
    return Array.from(this.selectedIds);
  }
  /** Restore from a snapshot. */
  restoreState(ids) {
    this.selectedIds = new Set(ids);
  }
  /** Cleanup on destroy. */
  destroy() {
    this.selectedIds.clear();
    this.lastClickedId = null;
  }
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  /** Range-select between two task IDs using the flat visible task list. */
  rangeSelect(fromId, toId) {
    const visible = this.dataManager.getFlatVisibleTasks();
    const fromIndex = visible.findIndex((t) => t.id === fromId);
    const toIndex = visible.findIndex((t) => t.id === toId);
    if (fromIndex === -1 || toIndex === -1)
      return;
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    for (let i = start; i <= end; i++) {
      this.selectedIds.add(visible[i].id);
    }
  }
  /** Sync DOM aria-selected attributes and checkbox states with internal state. */
  syncDom() {
    const element = this.getElement();
    const rows = element.querySelectorAll(`${Selectors.tasksDataRow}:not(${Selectors.tasksEmptyRow})`);
    rows.forEach((row) => {
      const taskId = row.getAttribute("data-taskid");
      if (!taskId)
        return;
      const selected = this.selectedIds.has(taskId);
      row.setAttribute("aria-selected", selected ? "true" : "false");
      const checkbox = row.querySelector(".gantt-selection-checkbox");
      if (checkbox) {
        checkbox.checked = selected;
      }
    });
    this.syncSelectAllCheckbox();
  }
  /** Update the select-all checkbox indeterminate / checked state. */
  syncSelectAllCheckbox() {
    const element = this.getElement();
    const selectAllCheckbox = element.querySelector(".gantt-select-all-checkbox");
    if (!selectAllCheckbox)
      return;
    const visibleCount = this.dataManager.getFlatVisibleTasks().length;
    const selectedCount = this.selectedIds.size;
    if (selectedCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (selectedCount >= visibleCount) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }
  /** Emit a SELECTION_CHANGE custom event on the chart's root element. */
  emitChange(previous) {
    if (this.setsEqual(previous, this.selectedIds))
      return;
    const detail = {
      selectedTasks: this.getSelectedTasks(),
      selectedIds: Array.from(this.selectedIds),
      timestamp: Date.now()
    };
    const element = this.getElement();
    element.dispatchEvent(
      new CustomEvent(GanttEvents.SELECTION_CHANGE, {
        detail,
        bubbles: true,
        cancelable: false
      })
    );
  }
  setsEqual(a, b) {
    if (a.size !== b.size)
      return false;
    for (const item of a) {
      if (!b.has(item))
        return false;
    }
    return true;
  }
}
class RowVirtualizer {
  constructor(config) {
    this._scrollTop = 0;
    this._rowHeight = Math.max(1, config.rowHeight);
    this._overscan = Math.max(0, config.overscan ?? 5);
    this._totalRows = Math.max(0, config.totalRows);
    this._containerHeight = Math.max(0, config.containerHeight);
  }
  // ---------------------------------------------------------------------------
  // Computed ranges & heights
  // ---------------------------------------------------------------------------
  /**
   * Return the inclusive range `[startIndex, endIndex]` of row indices that
   * should be present in the DOM. The range includes the overscan buffer on
   * both sides of the viewport.
   *
   * When there are zero rows the returned range is `{ startIndex: 0, endIndex: -1 }`
   * — consumers should treat `endIndex < startIndex` as "nothing to render".
   */
  getVisibleRange() {
    if (this._totalRows === 0) {
      return { startIndex: 0, endIndex: -1 };
    }
    const firstVisible = Math.floor(this._scrollTop / this._rowHeight);
    const startIndex = Math.max(0, firstVisible - this._overscan);
    const visibleCount = Math.ceil(this._containerHeight / this._rowHeight);
    const endIndex = Math.min(this._totalRows - 1, firstVisible + visibleCount - 1 + this._overscan);
    return { startIndex, endIndex };
  }
  /** Total scrollable height for the full dataset (`totalRows × rowHeight`). */
  getTotalHeight() {
    return this._totalRows * this._rowHeight;
  }
  /** Pixel offset from the top of the scroll container for the given row index. */
  getOffsetForIndex(index) {
    return index * this._rowHeight;
  }
  /**
   * Height of the spacer `div` that should be placed **above** the first
   * rendered row so that the visible rows appear at the correct scroll position.
   */
  getTopSpacerHeight() {
    const { startIndex } = this.getVisibleRange();
    return startIndex * this._rowHeight;
  }
  /**
   * Height of the spacer `div` that should be placed **below** the last
   * rendered row so that the scrollbar reflects the full dataset height.
   */
  getBottomSpacerHeight() {
    if (this._totalRows === 0)
      return 0;
    const { endIndex } = this.getVisibleRange();
    return Math.max(0, (this._totalRows - 1 - endIndex) * this._rowHeight);
  }
  /**
   * Number of rows in the current visible range (including overscan).
   */
  getVisibleCount() {
    const { startIndex, endIndex } = this.getVisibleRange();
    if (endIndex < startIndex)
      return 0;
    return endIndex - startIndex + 1;
  }
  // ---------------------------------------------------------------------------
  // Mutators — call these when external state changes
  // ---------------------------------------------------------------------------
  /** Update the current vertical scroll offset (clamped to ≥ 0). */
  setScrollTop(scrollTop) {
    this._scrollTop = Math.max(0, scrollTop);
  }
  /** Update the total number of rows (e.g. after expand/collapse). Clamped to ≥ 0. */
  setTotalRows(totalRows) {
    this._totalRows = Math.max(0, totalRows);
  }
  /** Update the container height (e.g. after resize). Clamped to ≥ 0. */
  setContainerHeight(containerHeight) {
    this._containerHeight = Math.max(0, containerHeight);
  }
  /** Update the overscan buffer (e.g. after actual container height is known). */
  setOverscan(overscan) {
    this._overscan = Math.max(0, overscan);
  }
  // ---------------------------------------------------------------------------
  // Read-only accessors
  // ---------------------------------------------------------------------------
  get scrollTop() {
    return this._scrollTop;
  }
  get totalRows() {
    return this._totalRows;
  }
  get containerHeight() {
    return this._containerHeight;
  }
  get rowHeight() {
    return this._rowHeight;
  }
  get overscan() {
    return this._overscan;
  }
}
const VIRTUALIZATION_THRESHOLD = 50;
const TOP_SPACER_CLASS = "virtualizer-top-spacer";
const BOTTOM_SPACER_CLASS = "virtualizer-bottom-spacer";
const TOP_SPACER_SELECTOR = `.${TOP_SPACER_CLASS}`;
const BOTTOM_SPACER_SELECTOR = `.${BOTTOM_SPACER_CLASS}`;
const ATTR_TASK_ID = "data-taskid";
class VirtualScrollCoordinator {
  constructor(domRefs, options, chartContext, dataManager, getPixelsPerMs, onAfterUpdate, onToggle = () => {
  }) {
    this.domRefs = domRefs;
    this.options = options;
    this.chartContext = chartContext;
    this.dataManager = dataManager;
    this.getPixelsPerMs = getPixelsPerMs;
    this.onAfterUpdate = onAfterUpdate;
    this.onToggle = onToggle;
    this.cachedVisibleTasks = [];
    this.lastVisibleRange = null;
    this.virtualScrollRAF = null;
    this.verticalScrollHandler = null;
    this._isActive = false;
    this.renderedTaskIds = /* @__PURE__ */ new Set();
    this.virtualizer = new RowVirtualizer({
      rowHeight: options.rowHeight,
      totalRows: 0,
      containerHeight: 0
    });
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /** Whether virtualisation is currently active (dataset above threshold). */
  get isActive() {
    return this._isActive;
  }
  /** Set of task IDs currently rendered in the virtual window. */
  getRenderedTaskIds() {
    return this.renderedTaskIds;
  }
  /**
   * Initialise virtualisation for the current dataset. Call after every full
   * render. Returns the initial `VisibleRange` if virtualisation is active,
   * otherwise `undefined`.
   */
  initialise(allVisibleTasks) {
    this.cachedVisibleTasks = allVisibleTasks;
    const { rowHeight, height } = this.options;
    const estimatedHeight = typeof height === "number" ? Math.max(height - 100, 200) : 600;
    const overscan = Math.ceil(estimatedHeight / rowHeight);
    this.virtualizer = new RowVirtualizer({
      rowHeight,
      totalRows: allVisibleTasks.length,
      containerHeight: estimatedHeight,
      overscan
    });
    if (allVisibleTasks.length <= VIRTUALIZATION_THRESHOLD) {
      this._isActive = false;
      return void 0;
    }
    this._isActive = true;
    const range = this.virtualizer.getVisibleRange();
    this.lastVisibleRange = range;
    this.renderedTaskIds = new Set(allVisibleTasks.slice(range.startIndex, range.endIndex + 1).map((t) => t.id));
    return { allTasks: allVisibleTasks, range, rowHeight };
  }
  /**
   * Attach a vertical scroll listener to the main scroll container and
   * calibrate the virtualizer against actual DOM dimensions. Call once after
   * DOM is ready.
   */
  attach() {
    const { verticalScrollContainer } = this.domRefs;
    if (!verticalScrollContainer || !this._isActive)
      return;
    const actualHeight = verticalScrollContainer.clientHeight;
    if (actualHeight > 0) {
      this.virtualizer.setContainerHeight(actualHeight);
      this.virtualizer.setOverscan(Math.ceil(actualHeight / this.options.rowHeight));
    }
    this.detach();
    this.verticalScrollHandler = () => {
      const scrollTop = verticalScrollContainer.scrollTop;
      this.scheduleUpdate(scrollTop);
    };
    verticalScrollContainer.addEventListener("scroll", this.verticalScrollHandler, { passive: true });
  }
  /**
   * Detach all scroll listeners and cancel pending rAF callbacks.
   */
  detach() {
    const { verticalScrollContainer } = this.domRefs;
    if (verticalScrollContainer && this.verticalScrollHandler) {
      verticalScrollContainer.removeEventListener("scroll", this.verticalScrollHandler);
    }
    this.verticalScrollHandler = null;
    if (this.virtualScrollRAF !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.virtualScrollRAF);
      this.virtualScrollRAF = null;
    }
    this.lastVisibleRange = null;
  }
  /**
   * Full cleanup — call from ApexGantt.destroy().
   */
  destroy() {
    this.detach();
    this.cachedVisibleTasks = [];
    this.renderedTaskIds.clear();
    this._isActive = false;
  }
  /**
   * Notify the coordinator that the total row count has changed (e.g. after
   * collapse/expand). Clamps scrollTop if necessary and re-renders.
   */
  updateTotalRows(allVisibleTasks) {
    this.cachedVisibleTasks = allVisibleTasks;
    if (!this._isActive)
      return;
    this.virtualizer.setTotalRows(allVisibleTasks.length);
    const maxScrollTop = Math.max(
      0,
      allVisibleTasks.length * this.virtualizer.rowHeight - this.virtualizer.containerHeight
    );
    if (this.virtualizer.scrollTop > maxScrollTop) {
      this.virtualizer.setScrollTop(maxScrollTop);
      const { verticalScrollContainer } = this.domRefs;
      if (verticalScrollContainer)
        verticalScrollContainer.scrollTop = maxScrollTop;
    }
    const newRange = this.virtualizer.getVisibleRange();
    this.lastVisibleRange = newRange;
    this.applyUpdate(newRange);
  }
  /**
   * Temporarily expand all rows into the live DOM for export.
   *
   * Call this before cloning the element for SVG export. It renders every task
   * row / bar that is outside the current virtual window and collapses spacers
   * to zero so the exported image contains the full chart.
   *
   * Returns a snapshot of the current virtual window so the caller can pass it
   * to `restoreAfterExport()` once the export is complete.
   */
  expandAllForExport() {
    if (!this._isActive)
      return null;
    const allTasks = this.cachedVisibleTasks;
    const { rowHeight } = this.options;
    const fullRange = { startIndex: 0, endIndex: allTasks.length - 1 };
    const tasksContainer = this.domRefs.tasksDataContainer;
    if (tasksContainer) {
      this.patchTasksPanel(allTasks, fullRange, rowHeight);
      const topSpacer = tasksContainer.querySelector(TOP_SPACER_SELECTOR);
      const bottomSpacer = tasksContainer.querySelector(BOTTOM_SPACER_SELECTOR);
      if (topSpacer)
        topSpacer.style.height = "0px";
      if (bottomSpacer)
        bottomSpacer.style.height = "0px";
    }
    const timelineBody = this.domRefs.timelineBody;
    if (timelineBody) {
      this.patchTimelinePanel(allTasks, fullRange, rowHeight);
      const topSpacer = timelineBody.querySelector(TOP_SPACER_SELECTOR);
      const bottomSpacer = timelineBody.querySelector(BOTTOM_SPACER_SELECTOR);
      if (topSpacer)
        topSpacer.style.height = "0px";
      if (bottomSpacer)
        bottomSpacer.style.height = "0px";
    }
    this.patchBars(allTasks, fullRange, rowHeight);
    const saved = this.lastVisibleRange;
    return saved ? { startIndex: saved.startIndex, endIndex: saved.endIndex } : null;
  }
  /**
   * Restore the virtual window after an export triggered by `expandAllForExport()`.
   *
   * @param snapshot - The value returned by `expandAllForExport()`.
   */
  restoreAfterExport(snapshot) {
    if (!this._isActive)
      return;
    const range = snapshot ?? this.virtualizer.getVisibleRange();
    this.applyUpdate(range);
  }
  /**
   * Notify the coordinator that the container was resized.
   */
  handleResize() {
    if (!this._isActive)
      return;
    const { verticalScrollContainer } = this.domRefs;
    if (verticalScrollContainer) {
      this.virtualizer.setContainerHeight(verticalScrollContainer.clientHeight);
    }
    const newRange = this.virtualizer.getVisibleRange();
    if (this.lastVisibleRange && newRange.startIndex === this.lastVisibleRange.startIndex && newRange.endIndex === this.lastVisibleRange.endIndex) {
      return;
    }
    this.lastVisibleRange = newRange;
    this.applyUpdate(newRange);
  }
  /**
   * Update DOM references after a full re-render.
   */
  updateDomRefs(refs) {
    this.domRefs = refs;
  }
  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------
  /**
   * Schedule a virtualised update via requestAnimationFrame.
   * Cancels any pending frame so rapid scrolls don't stack.
   */
  scheduleUpdate(scrollTop) {
    this.virtualizer.setScrollTop(scrollTop);
    if (this.cachedVisibleTasks.length <= VIRTUALIZATION_THRESHOLD)
      return;
    if (this.virtualScrollRAF !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.virtualScrollRAF);
    }
    if (typeof requestAnimationFrame === "undefined") {
      this.applyIfChanged();
      return;
    }
    this.virtualScrollRAF = requestAnimationFrame(() => {
      this.virtualScrollRAF = null;
      this.applyIfChanged();
    });
  }
  /** Compare current vs. previous range and apply if different. */
  applyIfChanged() {
    const newRange = this.virtualizer.getVisibleRange();
    if (this.lastVisibleRange && newRange.startIndex === this.lastVisibleRange.startIndex && newRange.endIndex === this.lastVisibleRange.endIndex) {
      return;
    }
    this.lastVisibleRange = newRange;
    this.applyUpdate(newRange);
  }
  /**
   * Atomic DOM update — both panels mutated in one rAF callback.
   *
   * Uses the **add-first, remove-second** pattern to prevent blank frames:
   * 1. Compute diff between currently rendered rows and newly needed rows.
   * 2. Append new rows.
   * 3. Update spacer heights.
   * 4. Remove stale rows.
   * 5. Update ARIA attributes.
   */
  applyUpdate(range) {
    const allTasks = this.cachedVisibleTasks;
    const { rowHeight } = this.options;
    if (allTasks.length === 0)
      return;
    this.patchTasksPanel(allTasks, range, rowHeight);
    this.patchTimelinePanel(allTasks, range, rowHeight);
    this.patchBars(allTasks, range, rowHeight);
    this.onAfterUpdate();
  }
  /**
   * Patch the Tasks (left) panel using diff-based add-first / remove-second.
   */
  patchTasksPanel(allTasks, range, rowHeight) {
    const container = this.domRefs.tasksDataContainer;
    if (!container)
      return;
    const { startIndex, endIndex } = range;
    const neededTasks = allTasks.slice(startIndex, endIndex + 1);
    const neededIds = new Set(neededTasks.map((t) => t.id));
    const currentRows = Array.from(
      container.querySelectorAll(`${Selectors.tasksDataRow}:not(${Selectors.tasksEmptyRow})`)
    );
    const currentIds = /* @__PURE__ */ new Map();
    currentRows.forEach((row) => {
      const id = row.getAttribute(ATTR_TASK_ID);
      if (id)
        currentIds.set(id, row);
    });
    const tasksRenderer = new Tasks(this.options, this.chartContext, this.dataManager);
    neededTasks.forEach((task, i) => {
      if (!currentIds.has(task.id)) {
        const absoluteIndex = startIndex + i;
        const row = tasksRenderer.generateRow(task, this.onToggle, absoluteIndex + 1);
        container.appendChild(row);
      }
    });
    currentIds.forEach((row, id) => {
      if (!neededIds.has(id)) {
        container.removeChild(row);
      }
    });
    this.updateSpacers(container, startIndex, endIndex, allTasks.length, rowHeight);
    const renderedRows = Array.from(
      container.querySelectorAll(`${Selectors.tasksDataRow}:not(${Selectors.tasksEmptyRow})`)
    );
    const taskIndexMap = /* @__PURE__ */ new Map();
    allTasks.forEach((t, i) => taskIndexMap.set(t.id, i));
    renderedRows.sort((a, b) => {
      const aId = a.getAttribute(ATTR_TASK_ID) || "";
      const bId = b.getAttribute(ATTR_TASK_ID) || "";
      return (taskIndexMap.get(aId) ?? 0) - (taskIndexMap.get(bId) ?? 0);
    });
    const bottomSpacer = container.querySelector(BOTTOM_SPACER_SELECTOR);
    const insertBefore = bottomSpacer || null;
    renderedRows.forEach((row) => {
      container.insertBefore(row, insertBefore);
    });
    renderedRows.forEach((row, i) => {
      row.setAttribute("aria-rowindex", (startIndex + i + 1).toString());
    });
    this.renderedTaskIds = neededIds;
  }
  /**
   * Patch the Timeline (right) panel using diff-based add-first / remove-second.
   */
  patchTimelinePanel(allTasks, range, rowHeight) {
    const timelineBody = this.domRefs.timelineBody;
    if (!timelineBody)
      return;
    const { startIndex, endIndex } = range;
    const neededTasks = allTasks.slice(startIndex, endIndex + 1);
    const neededIds = new Set(neededTasks.map((t) => t.id));
    const currentRows = Array.from(
      timelineBody.querySelectorAll(`${Selectors.timelineDataRow}:not(${Selectors.timelineEmptyRow})`)
    );
    const currentIds = /* @__PURE__ */ new Map();
    currentRows.forEach((row) => {
      const id = row.getAttribute(ATTR_TASK_ID);
      if (id)
        currentIds.set(id, row);
    });
    const cells = this.readSubHeaderCells();
    if (cells.length === 0)
      return;
    const timeline = new TimeLine(this.getPixelsPerMs(), this.options, this.chartContext, this.dataManager);
    neededTasks.forEach((task) => {
      if (!currentIds.has(task.id)) {
        const row = timeline.generateRow(task.id, cells);
        timelineBody.appendChild(row);
      }
    });
    currentIds.forEach((row, id) => {
      if (!neededIds.has(id)) {
        timelineBody.removeChild(row);
      }
    });
    this.updateSpacers(timelineBody, startIndex, endIndex, allTasks.length, rowHeight);
    const taskIndexMap = /* @__PURE__ */ new Map();
    allTasks.forEach((t, i) => taskIndexMap.set(t.id, i));
    const renderedRows = Array.from(
      timelineBody.querySelectorAll(`${Selectors.timelineDataRow}:not(${Selectors.timelineEmptyRow})`)
    );
    renderedRows.sort((a, b) => {
      const aId = a.getAttribute(ATTR_TASK_ID) || "";
      const bId = b.getAttribute(ATTR_TASK_ID) || "";
      return (taskIndexMap.get(aId) ?? 0) - (taskIndexMap.get(bId) ?? 0);
    });
    const bottomSpacer = timelineBody.querySelector(BOTTOM_SPACER_SELECTOR);
    const insertBefore = bottomSpacer || null;
    renderedRows.forEach((row) => {
      timelineBody.insertBefore(row, insertBefore);
    });
  }
  /**
   * Patch the bar container — replace bars for the visible range.
   * Bars are position:absolute so no spacer needed; we just swap them.
   */
  patchBars(allTasks, range, rowHeight) {
    const barContainer = this.domRefs.barContainer;
    if (!barContainer)
      return;
    const { startIndex, endIndex } = range;
    const pixelsPerMs = this.getPixelsPerMs();
    const dateRange = this.dataManager.getDateRange(8, pixelsPerMs);
    const { geometry } = renderTimelineHeader(dateRange[0], dateRange[1], pixelsPerMs);
    const totalHeight = allTasks.length * rowHeight;
    const neededTasks = allTasks.slice(startIndex, endIndex + 1);
    const neededIds = new Set(neededTasks.map((t) => t.id));
    const currentBars = Array.from(barContainer.querySelectorAll(`[${ATTR_TASK_ID}]`));
    const currentBarIds = /* @__PURE__ */ new Map();
    currentBars.forEach((bar) => {
      const id = bar.getAttribute(ATTR_TASK_ID);
      if (id)
        currentBarIds.set(id, bar);
    });
    const barsRootElement = this.chartContext.getChartContainer();
    neededTasks.forEach((task, i) => {
      if (!currentBarIds.has(task.id)) {
        const absoluteIndex = startIndex + i;
        const bar = new Bar(task, geometry, this.options, absoluteIndex, this.chartContext, this.dataManager);
        const barElement = bar.drawBar((id, updatedTask) => {
          updateTaskInUI(this.chartContext, this.dataManager, id, updatedTask, this.options, geometry);
        }, this.onToggle);
        barContainer.appendChild(barElement);
        if (barsRootElement)
          animateBarEntrance(barElement, 0, barsRootElement);
        const baselineElement = bar.drawBaselineBar();
        if (baselineElement) {
          barContainer.appendChild(baselineElement);
        }
      }
    });
    currentBarIds.forEach((bar, id) => {
      if (!neededIds.has(id)) {
        barContainer.removeChild(bar);
      }
    });
    barContainer.style.height = `${totalHeight}px`;
    barContainer.style.width = "100%";
  }
  /**
   * Ensure top and bottom spacer divs exist in the container with the correct heights.
   */
  updateSpacers(container, startIndex, endIndex, totalRows, rowHeight) {
    let topSpacer = container.querySelector(TOP_SPACER_SELECTOR);
    if (!topSpacer) {
      topSpacer = this.chartContext.createElement("div");
      topSpacer.className = TOP_SPACER_CLASS;
      container.insertBefore(topSpacer, container.firstChild);
    }
    topSpacer.style.height = `${startIndex * rowHeight}px`;
    let bottomSpacer = container.querySelector(BOTTOM_SPACER_SELECTOR);
    if (!bottomSpacer) {
      bottomSpacer = this.chartContext.createElement("div");
      bottomSpacer.className = BOTTOM_SPACER_CLASS;
      container.appendChild(bottomSpacer);
    }
    const bottomHeight = Math.max(0, (totalRows - 1 - endIndex) * rowHeight);
    bottomSpacer.style.height = `${bottomHeight}px`;
  }
  /** Helper: determine cell count from the existing timeline header. */
  getTimelineCellCount() {
    return this.readSubHeaderCells().length;
  }
  /** Helper: read per-cell {data, width} from the rendered sub-tier header row. */
  readSubHeaderCells() {
    var _a;
    const timelineContainer = (_a = this.domRefs.timelineBodyWrapper) == null ? void 0 : _a.closest(".timeline-container");
    if (!timelineContainer)
      return [];
    const headerRows = timelineContainer.querySelectorAll(".timeline-header-row");
    const lastRow = headerRows[headerRows.length - 1];
    if (!lastRow)
      return [];
    const cells = [];
    lastRow.querySelectorAll(".timeline-header-cell").forEach((el) => {
      const rect = el.getBoundingClientRect();
      cells.push({ data: "", width: rect.width });
    });
    return cells;
  }
}
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(weekday);
const DEPENDENCY_ARROW_EVENT = "dependencyArrowUpdate";
const BASELINE_ROWHEIGHT_BUMP = 12;
class ApexGantt extends BaseChart {
  constructor(element, options) {
    const instanceId = "gantt_" + crypto.randomUUID().replace(/-/g, "").substring(0, 9);
    super(element, instanceId);
    this.options = DefaultOptions$1;
    this.pixelsPerMs = 0;
    this._preservedPixelsPerMs = null;
    this.needsAutoFitZoom = false;
    this.containerResizeObserver = null;
    this.lastKnownWidth = 0;
    this.lastKnownHeight = 0;
    this.resizeDebounceTimer = null;
    this.dependencyArrowHandler = null;
    this.rowHoverHandler = null;
    this.rowHoverLeaveHandler = null;
    this._afterActionsRafId = null;
    this._destroyed = false;
    this.criticalPathResult = null;
    this.domCache = {
      // Timeline elements
      ganttContainer: null,
      timelineContainer: null,
      timelineBody: null,
      timelineBodyWrapper: null,
      timelineHeader: null,
      horizontalScroll: null,
      horizontalScrollContent: null,
      // Tasks panel elements
      tasksContainer: null,
      tasksBodyWrapper: null,
      tasksHeader: null,
      tasksDataContainer: null,
      // Other elements
      splitBar: null,
      actionsContainer: null
    };
    this.keyboardNavigationManager = null;
    this.selectionManager = null;
    this.virtualScrollCoordinator = null;
    this.columnRenderManager = new ColumnRenderManager();
    this.reducedMotionMQL = null;
    this.reducedMotionHandler = null;
    const themeDefaults = getDefaultOptions(options == null ? void 0 : options.theme);
    let processedSeries;
    if (options == null ? void 0 : options.parsing) {
      if (!DataParser.validateConfig(options.parsing)) {
        logger.error("ApexGantt: Invalid parsing configuration provided");
        processedSeries = [];
      } else {
        processedSeries = DataParser.parse(options.series, options.parsing);
      }
    } else {
      processedSeries = (options == null ? void 0 : options.series) || [];
    }
    this.options = {
      ...themeDefaults,
      ...options,
      baseline: { ...themeDefaults.baseline, ...options == null ? void 0 : options.baseline },
      barLabel: { ...themeDefaults.barLabel, ...options == null ? void 0 : options.barLabel },
      dependencies: { ...themeDefaults.dependencies, ...options == null ? void 0 : options.dependencies },
      series: processedSeries
    };
    if (this.options.enableTaskEdit && (options == null ? void 0 : options.enableInlineEdit) === void 0) {
      this.options.enableInlineEdit = true;
    }
    if (this.options.baseline.enabled && (options == null ? void 0 : options.rowHeight) === void 0) {
      this.options.rowHeight = themeDefaults.rowHeight + BASELINE_ROWHEIGHT_BUMP;
    }
    this.pixelsPerMs = this.computeInitialPixelsPerMs(this.options);
    this.needsAutoFitZoom = (options == null ? void 0 : options.pixelsPerDay) == null;
    const arrowLinkInstanceId = "arrows_" + crypto.randomUUID().replace(/-/g, "").substring(0, 9);
    this.arrowLink = new ArrowLink(arrowLinkInstanceId);
    this.dataManager = new DataManager();
    this.dataManager.setTasks(this.options.series);
    this.dataManager.setArrowLinkInstanceId(arrowLinkInstanceId);
    this.stateManager = new GanttStateManager();
    this.styleManager = new StyleManager(
      this.element,
      this.domCache,
      this.options,
      this.chartContext,
      this.isShadowDOM(),
      this.getInstanceId()
    );
    this.scrollManager = new ScrollManager(
      this.element,
      this.options,
      this.domCache,
      this.chartContext,
      this.getInstanceId()
    );
    this.layoutManager = new LayoutManager(
      this.element,
      this.options,
      this.domCache,
      this.chartContext,
      this.getInstanceId()
    );
    const zoomCallbacks = {
      onZoomChange: (next) => {
        this.pixelsPerMs = next;
        this.needsAutoFitZoom = false;
      },
      onToolbarUpdate: () => {
        const actionsContainer = this.domCache.actionsContainer;
        if (actionsContainer) {
          this.renderToolbar(actionsContainer);
        }
      },
      onTimelineRerender: () => {
        this.rerenderTimeline();
      },
      onDependencyArrowsRender: () => {
        this.renderDependencyArrows();
        this.fadeArrowsAfterAnimation();
        this.computeCriticalPath();
        this.applyCriticalPathHighlighting();
      },
      onScrollbarUpdate: () => {
        this.scrollManager.updateHorizontalScrollbarContent();
      },
      onScrollbarPosition: () => {
        this.scrollManager.positionHorizontalScrollbar();
      }
    };
    this.zoomManager = new ZoomManager(
      this.element,
      this.domCache,
      this.chartContext,
      this.getInstanceId(),
      () => this.pixelsPerMs,
      zoomCallbacks
    );
    this.crosshairManager = new CrosshairManager(this.options, this.domCache, this.chartContext);
    this.styleManager.setupShadowDOMEnvironment();
    if (this.options.enableSelection) {
      this.selectionManager = new SelectionManager(this.chartContext, this.dataManager, () => this.element);
    }
    this.keyboardNavigationManager = new KeyboardNavigationManager(
      this.chartContext,
      this.dataManager,
      () => this.domCache.tasksDataContainer,
      () => this.render(),
      this.selectionManager ?? void 0
    );
    this.setupReducedMotion();
    this.columnRenderManager.observe(this.element);
  }
  /**
   * Compute the initial zoom level (pixels-per-ms) from user options.
   * Falls back to the library default when `pixelsPerDay` is not provided.
   */
  computeInitialPixelsPerMs(opts) {
    if (typeof opts.pixelsPerDay === "number" && opts.pixelsPerDay > 0) {
      return opts.pixelsPerDay / 864e5;
    }
    return DEFAULT_PIXELS_PER_MS;
  }
  /**
   * Pick a `pixels-per-ms` that fits the full data span into the visible
   * timeline area, with ~5% padding on each side. Returns `null` when we
   * can't measure (no element, zero-width container, no data, or zero-length
   * range) so the caller can fall back to the library default.
   *
   * Clamped to roughly `[0.25, 1280]` pixels-per-day to stay inside the
   * supported zoom bounds.
   */
  computeAutoFitPixelsPerMs() {
    if (!this.element)
      return null;
    const containerWidth = this.element.clientWidth;
    if (containerWidth <= 0)
      return null;
    const RIGHT_PADDING_PX = 16;
    const leadingPad = resolveBarLabelLeadingPadding(this.options.barLabel);
    const timelineWidth = containerWidth - this.options.tasksContainerWidth - RIGHT_PADDING_PX - leadingPad;
    if (timelineWidth <= 0)
      return null;
    const tasks = this.dataManager.getFlatTasks();
    if (tasks.length === 0)
      return null;
    let minMs = Infinity;
    let maxMs = -Infinity;
    for (const t of tasks) {
      if (t.startTime) {
        const v = dayjs(t.startTime).valueOf();
        if (Number.isFinite(v) && v < minMs)
          minMs = v;
      }
      if (t.endTime) {
        const v = dayjs(t.endTime).valueOf();
        if (Number.isFinite(v) && v > maxMs)
          maxMs = v;
      }
    }
    if (!Number.isFinite(minMs) || !Number.isFinite(maxMs) || maxMs <= minMs)
      return null;
    const paddedRangeMs = (maxMs - minMs) * 1.1;
    const MS_PER_DAY2 = 864e5;
    const MIN_PX_PER_MS = 0.25 / MS_PER_DAY2;
    const MAX_PX_PER_MS = 1280 / MS_PER_DAY2;
    const pxPerMs = timelineWidth / paddedRangeMs;
    return Math.max(MIN_PX_PER_MS, Math.min(MAX_PX_PER_MS, pxPerMs));
  }
  /**
   * Set the global ApexCharts license key.
   *
   * Call this once before creating any chart instance, typically at app startup.
   * Without a valid license the chart renders with a watermark.
   *
   * @param key - The license key string provided by ApexCharts.
   *
   * @example
   * ```ts
   * import { ApexGantt } from 'apexgantt';
   * ApexGantt.setLicense('YOUR_LICENSE_KEY');
   * ```
   */
  static setLicense(key) {
    LicenseManager.setLicense(key);
  }
  /**
   * Detect prefers-reduced-motion at init time and listen for runtime changes.
   * When active, a CSS class is toggled on the root element so that the
   * `@media (prefers-reduced-motion: reduce)` rules in Gantt.style.ts disable
   * all transitions/animations automatically.
   */
  setupReducedMotion() {
    if (typeof window === "undefined" || !window.matchMedia)
      return;
    this.reducedMotionMQL = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (matches) => {
      if (matches) {
        this.element.classList.add("gantt-reduced-motion");
      } else {
        this.element.classList.remove("gantt-reduced-motion");
      }
    };
    apply(this.reducedMotionMQL.matches);
    this.reducedMotionHandler = (e) => apply(e.matches);
    this.reducedMotionMQL.addEventListener("change", this.reducedMotionHandler);
  }
  initializeTooltip() {
    const { enableTooltip, tooltipId } = this.options;
    if (enableTooltip) {
      const tooltipElement = getTooltip(this.chartContext, tooltipId);
      tooltipElement.classList.add("apexgantt-tooltip");
      const existingTooltip = this.chartContext.getElementById(tooltipId);
      if (!existingTooltip) {
        logger.warn("Tooltip init: Tooltip not found after creation, appending manually");
        const appendContainer = this.chartContext.getAppendContainer();
        appendContainer.appendChild(tooltipElement);
      }
    }
  }
  /**
   * Render the Gantt chart into the element supplied in the constructor.
   *
   * Call once after construction to create the initial DOM. Subsequent renders
   * (triggered by `update()` or internal interactions) are handled automatically.
   *
   * @param _data - Reserved for future use. Pass `undefined` or omit.
   * @returns The container `HTMLElement` that hosts the chart.
   *
   * @example
   * ```ts
   * const gantt = new ApexGantt(document.getElementById('chart')!, options);
   * gantt.render();
   * ```
   */
  render(_data) {
    var _a, _b;
    if (!this.element) {
      throw new Error("Element not found");
    }
    if (this.virtualScrollCoordinator) {
      this.virtualScrollCoordinator.detach();
    }
    const isReRender = this.element && this.element.children.length > 0;
    if (isReRender) {
      this.stateManager.captureState(
        this.element,
        this.dataManager,
        this.pixelsPerMs,
        (_a = this.selectionManager) == null ? void 0 : _a.captureState()
      );
    }
    if (this.needsAutoFitZoom) {
      const fitted = this.computeAutoFitPixelsPerMs();
      if (fitted != null) {
        this.pixelsPerMs = fitted;
        this.needsAutoFitZoom = false;
      }
    }
    const { enableResize, tasksContainerWidth, height, width } = this.options;
    const userVars = readGanttCSSVars(this.element);
    const fontColor = userVars.fontColor || this.options.fontColor;
    const fontFamily = userVars.fontFamily || this.options.fontFamily;
    const fontSize = userVars.fontSize || this.options.fontSize;
    const { fontWeight } = this.options;
    this.layoutManager.setupChartContainerPositioning();
    this.styleManager.injectGanttStyles();
    this.styleManager.setCSSVariables();
    this.initializeTooltip();
    const prevVisibleIds = new Set(
      Array.from(this.element.querySelectorAll(".bar-timeline[data-taskid]")).map(
        (el) => el.getAttribute("data-taskid")
      )
    );
    this.columnRenderManager.flushCleanups();
    this.element.innerHTML = "";
    const normalizedHeight = this.normalizeDimension(height);
    const normalizedWidth = this.normalizeDimension(width);
    this.element.style.width = normalizedWidth;
    this.element.style.height = normalizedHeight;
    this.element.style.display = "flex";
    this.element.style.flexDirection = "column";
    this.element.style.boxSizing = "border-box";
    this.element.style.overflow = "hidden";
    this.element.style.setProperty("color", fontColor);
    this.element.style.setProperty("font-family", fontFamily);
    this.element.style.setProperty("font-size", fontSize);
    this.element.style.setProperty("font-weight", fontWeight);
    const actionsContainer = createBox(this.chartContext, { className: Selectors.actionsContainer.slice(1) });
    this.renderToolbar(actionsContainer);
    const ganttContainer = createBox(this.chartContext, { className: Selectors.ganttContainer.slice(1) });
    const allVisibleTasks = this.dataManager.getFlatVisibleTasks();
    this.initVirtualScrollCoordinator();
    const virtualRange = (_b = this.virtualScrollCoordinator) == null ? void 0 : _b.initialise(allVisibleTasks);
    const timelineElements = new TimeLine(this.pixelsPerMs, this.options, this.chartContext, this.dataManager).render(
      virtualRange,
      prevVisibleIds,
      this.render.bind(this)
    );
    const tasksTable = new Tasks(
      this.options,
      this.chartContext,
      this.dataManager,
      this.selectionManager ?? void 0,
      this.options.enableInlineEdit ? (id, updates) => this.commitInlineEdit(id, updates) : void 0,
      this.columnRenderManager
    ).render(this.render.bind(this), virtualRange);
    if (timelineElements) {
      this.layoutManager.createLayout(ganttContainer, tasksTable, timelineElements, enableResize, tasksContainerWidth);
    }
    this.element.appendChild(actionsContainer);
    this.element.appendChild(ganttContainer);
    const horizontalScroll = this.element.querySelector(Selectors.horizontalScroll);
    if (horizontalScroll) {
      horizontalScroll.remove();
      this.element.appendChild(horizontalScroll);
    }
    this.styleManager.handleWatermark();
    this.cacheDomElements();
    this.setupRowBackgroundColors();
    this.zoomManager.setupZoomEventListener();
    this.attachCrosshair();
    this.setupDependencyArrowEvents();
    this.renderDependencyArrows();
    const newVisibleIds = new Set(allVisibleTasks.map((t) => t.id));
    const changedIds = prevVisibleIds.size > 0 ? new Set(
      [...prevVisibleIds, ...newVisibleIds].filter((id) => !prevVisibleIds.has(id) || !newVisibleIds.has(id))
    ) : void 0;
    this.fadeArrowsAfterAnimation(false, changedIds);
    this.computeCriticalPath();
    this.applyCriticalPathHighlighting();
    this._afterActionsRafId = requestAnimationFrame(() => {
      this._afterActionsRafId = null;
      this.performAfterActions();
    });
    if (isReRender) {
      requestAnimationFrame(() => {
        this.stateManager.restoreState(this.element);
      });
    }
    return this.element;
  }
  cacheDomElements() {
    var _a;
    this.domCache.ganttContainer = this.element.querySelector(Selectors.ganttContainer);
    this.domCache.timelineContainer = this.element.querySelector(Selectors.timelineContainer);
    this.domCache.timelineBody = this.element.querySelector(Selectors.timelineBody);
    this.domCache.timelineBodyWrapper = this.element.querySelector(Selectors.timelineBodyWrapper);
    this.domCache.timelineHeader = this.element.querySelector(Selectors.timelineHeader);
    this.domCache.horizontalScroll = this.element.querySelector(Selectors.horizontalScroll);
    this.domCache.horizontalScrollContent = ((_a = this.domCache.horizontalScroll) == null ? void 0 : _a.querySelector(Selectors.horizontalScrollContent)) || null;
    this.domCache.tasksContainer = this.element.querySelector(Selectors.tasksContainer);
    this.domCache.tasksBodyWrapper = this.element.querySelector(Selectors.tasksBodyWrapper);
    this.domCache.tasksHeader = this.element.querySelector(Selectors.tasksHeader);
    this.domCache.tasksDataContainer = this.element.querySelector(Selectors.tasksDataContainer);
    this.domCache.splitBar = this.element.querySelector(Selectors.splitBar);
    this.domCache.actionsContainer = this.element.querySelector(Selectors.actionsContainer);
  }
  clearDomCache() {
    this.domCache.ganttContainer = null;
    this.domCache.timelineContainer = null;
    this.domCache.timelineBody = null;
    this.domCache.timelineBodyWrapper = null;
    this.domCache.timelineHeader = null;
    this.domCache.horizontalScroll = null;
    this.domCache.horizontalScrollContent = null;
    this.domCache.tasksContainer = null;
    this.domCache.tasksBodyWrapper = null;
    this.domCache.tasksHeader = null;
    this.domCache.tasksDataContainer = null;
    this.domCache.splitBar = null;
    this.domCache.actionsContainer = null;
  }
  performAfterActions() {
    var _a, _b, _c;
    if (this.isDestroyed())
      return;
    this.cacheDomElements();
    this.layoutManager.syncTasksColumnWidths();
    this.scrollManager.compensateForScrollbar();
    this.scrollManager.updateHorizontalScrollbarContent();
    this.scrollManager.setupTimelineHorizontalScroll();
    this.scrollManager.positionHorizontalScrollbar();
    this.setupContainerResizeObserver();
    this.scrollManager.setupScrollbarResizeObserver();
    this.setupRowBackgroundColors();
    this.setupRowHoverSync();
    this.scrollManager.disableHeaderMousewheelScroll();
    if (!((_a = this.virtualScrollCoordinator) == null ? void 0 : _a.isActive)) {
      this.layoutManager.fillEmptyRowsAfterRender();
    }
    if (this.virtualScrollCoordinator) {
      const verticalScrollContainer = this.element.querySelector(".split-view-container") ?? this.domCache.ganttContainer;
      this.virtualScrollCoordinator.updateDomRefs({
        tasksDataContainer: this.domCache.tasksDataContainer,
        timelineBody: this.domCache.timelineBody,
        barContainer: this.element.querySelector(Selectors.barContainer),
        tasksBodyWrapper: this.domCache.tasksBodyWrapper,
        timelineBodyWrapper: this.domCache.timelineBodyWrapper,
        verticalScrollContainer
      });
      this.virtualScrollCoordinator.attach();
    }
    (_b = this.keyboardNavigationManager) == null ? void 0 : _b.attach();
    (_c = this.selectionManager) == null ? void 0 : _c.restoreAfterRender();
  }
  /**
   * Create (or re-create) the VirtualScrollCoordinator.
   * Called once per full render, before the coordinator is used.
   */
  initVirtualScrollCoordinator() {
    if (this.virtualScrollCoordinator) {
      this.virtualScrollCoordinator.destroy();
    }
    this.virtualScrollCoordinator = new VirtualScrollCoordinator(
      {
        tasksDataContainer: null,
        timelineBody: null,
        barContainer: null,
        tasksBodyWrapper: null,
        timelineBodyWrapper: null,
        verticalScrollContainer: null
      },
      this.options,
      this.chartContext,
      this.dataManager,
      () => this.pixelsPerMs,
      () => {
        this.setupRowBackgroundColors();
        this.renderDependencyArrows();
        this.fadeArrowsAfterAnimation();
        this.applyCriticalPathHighlighting();
      },
      // onToggle: collapse/expand a task row patched in by the virtual window
      () => this.render()
    );
  }
  setupRowHoverSync() {
    const ganttContainer = this.domCache.ganttContainer;
    if (!ganttContainer)
      return;
    if (this.rowHoverHandler) {
      ganttContainer.removeEventListener("mousemove", this.rowHoverHandler);
      this.rowHoverHandler = null;
    }
    if (this.rowHoverLeaveHandler) {
      ganttContainer.removeEventListener("mouseleave", this.rowHoverLeaveHandler);
      this.rowHoverLeaveHandler = null;
    }
    const instanceId = this.chartContext.getInstanceId();
    const taskRowSel = `${Selectors.tasksDataRow}[data-chart-instance="${instanceId}"]`;
    const timelineRowSel = `${Selectors.timelineDataRow}[data-chart-instance="${instanceId}"]`;
    const hoverColor = getComputedStyle(this.element).getPropertyValue("--row-hover-color").trim() || "rgba(0,0,0,0.06)";
    const setHover = (taskId, active) => {
      const tasksRow = this.element.querySelector(`${taskRowSel}[data-taskid="${taskId}"]`);
      const timelineRow = this.element.querySelector(
        `${timelineRowSel}[data-taskid="${taskId}"]`
      );
      for (const row of [tasksRow, timelineRow]) {
        if (!row)
          continue;
        if (active) {
          if (!row.dataset["origBg"])
            row.dataset["origBg"] = row.style.backgroundColor;
          row.style.backgroundColor = hoverColor;
        } else {
          row.style.backgroundColor = row.dataset["origBg"] ?? "";
          delete row.dataset["origBg"];
        }
      }
    };
    let activeTaskId = null;
    const onMove = (e) => {
      const me = e;
      const target = me.target;
      const row = target == null ? void 0 : target.closest(`${taskRowSel}, ${timelineRowSel}`);
      const bar = target == null ? void 0 : target.closest(`[data-taskid][data-chart-instance="${instanceId}"]`);
      const hoveredTaskId = (row == null ? void 0 : row.dataset["taskid"]) ?? (bar == null ? void 0 : bar.dataset["taskid"]) ?? null;
      if (hoveredTaskId === activeTaskId)
        return;
      if (activeTaskId)
        setHover(activeTaskId, false);
      activeTaskId = hoveredTaskId;
      if (activeTaskId)
        setHover(activeTaskId, true);
    };
    const onLeave = (e) => {
      const { relatedTarget } = e;
      if (!relatedTarget || !ganttContainer.contains(relatedTarget)) {
        if (activeTaskId)
          setHover(activeTaskId, false);
        activeTaskId = null;
      }
    };
    this.rowHoverHandler = onMove;
    this.rowHoverLeaveHandler = onLeave;
    ganttContainer.addEventListener("mousemove", onMove);
    ganttContainer.addEventListener("mouseleave", onLeave);
  }
  setupRowBackgroundColors() {
    var _a;
    const parentColorMap = /* @__PURE__ */ new Map();
    const cssVars = readGanttCSSVars(this.element);
    const resolvedRowColors = [...this.options.rowBackgroundColors];
    if (cssVars.rowBgEven)
      resolvedRowColors[0] = cssVars.rowBgEven;
    if (cssVars.rowBgOdd)
      resolvedRowColors[1] = cssVars.rowBgOdd;
    const renderedIds = ((_a = this.virtualScrollCoordinator) == null ? void 0 : _a.isActive) ? this.virtualScrollCoordinator.getRenderedTaskIds() : null;
    this.dataManager.getTopParentTasks().forEach((task, index) => {
      const bgColor = task.rowBackgroundColor || getRowBackgroundColor(index, resolvedRowColors);
      parentColorMap.set(task.id, bgColor);
      if (!renderedIds || renderedIds.has(task.id)) {
        setTaskRowBackgroundColor(this.chartContext, task.id, bgColor);
      }
    });
    this.dataManager.getFlatTasks().forEach((task) => {
      if (renderedIds && !renderedIds.has(task.id))
        return;
      if (!task.parentId) {
        if (task.type === TaskType.Milestone && !parentColorMap.has(task.id)) {
          const bgColor2 = task.rowBackgroundColor || getRowBackgroundColor(0, resolvedRowColors);
          setTaskRowBackgroundColor(this.chartContext, task.id, bgColor2);
        }
        return;
      }
      let rootParent = this.dataManager.getTaskById(task.parentId);
      while (rootParent == null ? void 0 : rootParent.parentId) {
        rootParent = this.dataManager.getTaskById(rootParent.parentId);
      }
      const rootParentId = rootParent ? rootParent.id : task.parentId;
      const bgColor = task.rowBackgroundColor || (parentColorMap.get(rootParentId ?? "") ?? "");
      setTaskRowBackgroundColor(this.chartContext, task.id, bgColor);
    });
  }
  fadeArrowsAfterAnimation(instant = false, changedIds) {
    var _a;
    const svgId = `timeline-arrows-${this.arrowLink.getInstanceId()}`;
    const svg = ((_a = this.domCache.timelineBody) == null ? void 0 : _a.querySelector(`#${svgId}`)) ?? null;
    fadeInArrowsSvg(svg, this.element, instant, changedIds);
  }
  renderDependencyArrows() {
    var _a;
    const { rowHeight, barMargin } = this.options;
    const chartInstanceId = this.getInstanceId();
    const arrowLinkInstanceId = this.arrowLink.getInstanceId();
    const timelineBody = this.domCache.timelineBody;
    if (!timelineBody) {
      logger.warn(`[${chartInstanceId}] Timeline body not found for arrows`);
      return;
    }
    const svgId = `timeline-arrows-${arrowLinkInstanceId}`;
    const existingArrows = timelineBody.querySelector(`#${svgId}`);
    if (existingArrows) {
      existingArrows.remove();
    }
    const allVisibleTasks = this.dataManager.getFlatVisibleTasks();
    const tasksWithDependency = allVisibleTasks.filter((task) => !!task.dependency);
    if (tasksWithDependency.length === 0) {
      return;
    }
    const taskIndexMap = /* @__PURE__ */ new Map();
    allVisibleTasks.forEach((t, i) => taskIndexMap.set(t.id, i));
    const dateRange = this.dataManager.getDateRange(8, this.pixelsPerMs);
    const { geometry } = renderTimelineHeader(dateRange[0], dateRange[1], this.pixelsPerMs);
    const barHeight = rowHeight - barMargin * 2;
    const computeBarRect = (task, flatIndex) => {
      const left = Bar.calculateX(task, geometry, this.options);
      const width = Bar.calculateWidth(task, geometry, this.options);
      const top = barMargin + flatIndex * rowHeight;
      return { left, right: left + width, top, bottom: top + barHeight, width, height: barHeight };
    };
    const renderedIds = ((_a = this.virtualScrollCoordinator) == null ? void 0 : _a.isActive) ? this.virtualScrollCoordinator.getRenderedTaskIds() : null;
    const edges = tasksWithDependency.flatMap((task) => {
      const { taskId, type, lag } = normaliseDependency(task.dependency);
      if (renderedIds && !renderedIds.has(taskId) && !renderedIds.has(task.id))
        return [];
      const sourceTask = this.dataManager.getTaskById(taskId);
      const sourceIndex = taskIndexMap.get(taskId);
      const targetIndex = taskIndexMap.get(task.id);
      if (!sourceTask || sourceIndex === void 0 || targetIndex === void 0)
        return [];
      const sourceRect = computeBarRect(sourceTask, sourceIndex);
      const targetRect = computeBarRect(task, targetIndex);
      if (isNaN(sourceRect.left) || isNaN(targetRect.left))
        return [];
      const edge = {
        id: `${taskId}-${task.id}`,
        sourceRect,
        targetRect,
        dependencyType: type,
        lagPx: lag,
        // Carry the resolved tasks + raw lag so dependency-arrow renderers
        // (tooltip, classBuilder) get the same context the user supplied.
        fromTask: sourceTask,
        toTask: task,
        lagDays: lag
      };
      return [edge];
    });
    if (edges.length === 0) {
      return;
    }
    const totalHeight = allVisibleTasks.length * rowHeight;
    this.arrowLink.renderFromRects(
      timelineBody,
      edges,
      {
        arrowColor: this.options.arrowColor,
        height: Math.max(totalHeight, timelineBody.clientHeight),
        paddingY: rowHeight / 2,
        width: (timelineBody.scrollWidth || timelineBody.clientWidth) + 40,
        dependencies: this.options.dependencies,
        // Tooltip styling is shared with bar tooltips so the chrome matches.
        tooltipId: this.options.tooltipId,
        tooltipBgColor: this.options.tooltipBGColor,
        tooltipBorderColor: this.options.tooltipBorderColor,
        tooltipFontColor: this.options.fontColor,
        tooltipFontFamily: this.options.fontFamily,
        tooltipFontSize: this.options.fontSize,
        tooltipFontWeight: this.options.fontWeight
      },
      this.chartContext
    );
  }
  setupDependencyArrowEvents() {
    const chartInstanceId = this.getInstanceId();
    const arrowLinkInstanceId = this.arrowLink.getInstanceId();
    if (this.dependencyArrowHandler) {
      this.chartContext.removeEventListener(DEPENDENCY_ARROW_EVENT, this.dependencyArrowHandler);
    }
    this.dependencyArrowHandler = (e) => {
      const dependencyEvent = e;
      if (dependencyEvent.detail.chartInstanceId !== chartInstanceId) {
        return;
      }
      const eventArrowInstanceId = dependencyEvent.detail.arrowLinkInstanceId || arrowLinkInstanceId;
      const updated = updateArrow(
        this.chartContext,
        dependencyEvent.detail.fromId,
        dependencyEvent.detail.toId,
        eventArrowInstanceId,
        dependencyEvent.detail.type,
        this.options.rowHeight,
        this.options.dependencies
      );
      if (!updated) {
        this.renderDependencyArrows();
        this.fadeArrowsAfterAnimation(true);
      }
    };
    this.chartContext.addEventListener(DEPENDENCY_ARROW_EVENT, this.dependencyArrowHandler);
    const recomputeOnTaskChange = () => {
      this.computeCriticalPath();
      this.chartContext.querySelectorAll(".bar-critical").forEach((el) => el.classList.remove("bar-critical"));
      this.chartContext.querySelectorAll(".critical-arrow").forEach((el) => el.classList.remove("critical-arrow"));
      this.applyCriticalPathHighlighting();
    };
    const container = this.chartContext.getChartContainer();
    if (container) {
      container.removeEventListener(GanttEvents.TASK_DRAGGED, recomputeOnTaskChange);
      container.removeEventListener(GanttEvents.TASK_RESIZED, recomputeOnTaskChange);
      container.addEventListener(GanttEvents.TASK_DRAGGED, recomputeOnTaskChange);
      container.addEventListener(GanttEvents.TASK_RESIZED, recomputeOnTaskChange);
    }
  }
  computeCriticalPath() {
    if (!this.options.enableCriticalPath)
      return;
    this.criticalPathResult = computeCriticalPath(this.dataManager.getTasks(), this.dataManager.getAllDependencies());
  }
  applyCriticalPathHighlighting() {
    var _a, _b;
    if (!this.options.enableCriticalPath || !this.criticalPathResult)
      return;
    for (const taskId of this.criticalPathResult.criticalTaskIds) {
      (_a = getBarElement(this.chartContext, taskId)) == null ? void 0 : _a.classList.add("bar-critical");
    }
    const timelineBody = this.domCache.timelineBody;
    for (const edgeKey of this.criticalPathResult.criticalEdgeKeys) {
      const [fromId, toId] = edgeKey.split("->");
      (_b = timelineBody == null ? void 0 : timelineBody.querySelector(`[data-edgeid="${fromId}-${toId}"]`)) == null ? void 0 : _b.classList.add("critical-arrow");
    }
  }
  rerenderTimeline() {
    var _a;
    const timelineContainer = this.domCache.timelineContainer;
    if (!timelineContainer)
      return;
    const prevBarGeometry = /* @__PURE__ */ new Map();
    this.element.querySelectorAll(".bar-timeline[data-taskid]").forEach((bar) => {
      const taskId = bar.getAttribute("data-taskid");
      prevBarGeometry.set(taskId, {
        left: parseFloat(bar.style.left) || 0,
        width: parseFloat(bar.style.width) || 0
      });
    });
    const allTasks = this.dataManager.getFlatVisibleTasks();
    const virtualRange = (_a = this.virtualScrollCoordinator) == null ? void 0 : _a.initialise(allTasks);
    const zoomPrevIds = new Set(allTasks.map((t) => t.id));
    const header = this.domCache.timelineHeader;
    const bodyWrapper = this.domCache.timelineBodyWrapper;
    if (header && bodyWrapper) {
      header.innerHTML = "";
      bodyWrapper.innerHTML = "";
      const timelineElements = new TimeLine(this.pixelsPerMs, this.options, this.chartContext, this.dataManager).render(
        virtualRange,
        zoomPrevIds,
        this.render.bind(this)
      );
      if (timelineElements) {
        const newHeader = timelineElements[0];
        header.innerHTML = newHeader.innerHTML;
        for (let i = 1; i < timelineElements.length - 1; i++) {
          bodyWrapper.appendChild(timelineElements[i]);
        }
      }
    } else {
      timelineContainer.innerHTML = "";
      const timelineElements = new TimeLine(this.pixelsPerMs, this.options, this.chartContext, this.dataManager).render(
        virtualRange,
        zoomPrevIds,
        this.render.bind(this)
      );
      if (timelineElements) {
        const newHeader = timelineElements[0];
        timelineContainer.appendChild(newHeader);
        const newBodyWrapper = createBox(this.chartContext, { className: Selectors.timelineBodyWrapper.slice(1) });
        for (let i = 1; i < timelineElements.length - 1; i++) {
          newBodyWrapper.appendChild(timelineElements[i]);
        }
        timelineContainer.appendChild(newBodyWrapper);
      }
    }
    this.cacheDomElements();
    this.attachCrosshair();
    this.cancelPendingAfterActionsRaf();
    this._afterActionsRafId = requestAnimationFrame(() => {
      this._afterActionsRafId = null;
      if (prevBarGeometry.size > 0) {
        const rootElement = this.element;
        this.element.querySelectorAll(".bar-timeline[data-taskid]").forEach((bar) => {
          const taskId = bar.getAttribute("data-taskid");
          const prev = prevBarGeometry.get(taskId);
          if (prev) {
            animateBarZoom(
              bar,
              prev,
              { left: parseFloat(bar.style.left) || 0, width: parseFloat(bar.style.width) || 0 },
              rootElement
            );
          }
        });
      }
      this.performAfterActions();
    });
  }
  /**
   * (Re)attach the timeline crosshair using the current zoom/geometry.
   * Safe to call after every render or zoom-driven rerender — it tears down
   * any previous attachment first.
   */
  attachCrosshair() {
    if (!this.options.enableCrosshair) {
      this.crosshairManager.detach();
      return;
    }
    const dateRange = this.dataManager.getDateRange(8, this.pixelsPerMs);
    const { geometry, tiers } = renderTimelineHeader(dateRange[0], dateRange[1], this.pixelsPerMs);
    this.crosshairManager.updateOptions(this.options);
    this.crosshairManager.attach(geometry, tiers.sub.id);
  }
  /**
   * Cancel any pending `performAfterActions` rAF callback.
   */
  cancelPendingAfterActionsRaf() {
    if (this._afterActionsRafId != null) {
      cancelAnimationFrame(this._afterActionsRafId);
      this._afterActionsRafId = null;
    }
  }
  cleanupEventListeners() {
    var _a, _b;
    try {
      if (this.dependencyArrowHandler) {
        this.chartContext.removeEventListener(DEPENDENCY_ARROW_EVENT, this.dependencyArrowHandler);
        this.dependencyArrowHandler = null;
      }
      if (this.rowHoverHandler) {
        (_a = this.domCache.ganttContainer) == null ? void 0 : _a.removeEventListener("mousemove", this.rowHoverHandler);
        this.rowHoverHandler = null;
      }
      if (this.rowHoverLeaveHandler) {
        (_b = this.domCache.ganttContainer) == null ? void 0 : _b.removeEventListener("mouseleave", this.rowHoverLeaveHandler);
        this.rowHoverLeaveHandler = null;
      }
      const timelineElement = this.domCache.timelineContainer;
      if (timelineElement == null ? void 0 : timelineElement.parentNode) {
        const newTimelineElement = timelineElement.cloneNode(true);
        timelineElement.parentNode.replaceChild(newTimelineElement, timelineElement);
      }
    } catch (error) {
      logger.warn("Error cleaning up event listeners:", error);
    }
  }
  cleanupTooltips() {
    try {
      const { enableTooltip, tooltipId } = this.options;
      if (enableTooltip) {
        const tooltip = this.chartContext.getElementById(tooltipId);
        if (tooltip) {
          tooltip.style.display = "none";
          tooltip.innerHTML = "";
          tooltip.removeAttribute("style");
          tooltip.classList.remove("visible");
          tooltip.setAttribute("aria-hidden", "true");
          if (this.isShadowDOM()) {
            tooltip.remove();
          }
        }
      }
    } catch (error) {
      logger.warn("Error cleaning up tooltips:", error);
    }
  }
  cleanupDependencyArrows() {
    try {
      const timelineBody = this.domCache.timelineBody;
      if (timelineBody && this.arrowLink) {
        const arrowLinkInstanceId = this.arrowLink.getInstanceId();
        const svgId = `timeline-arrows-${arrowLinkInstanceId}`;
        const arrowSvg = timelineBody.querySelector(`#${svgId}`);
        if (arrowSvg) {
          arrowSvg.remove();
        }
        const allArrows = timelineBody.querySelectorAll(`[data-edgeid]`);
        allArrows.forEach((arrow) => {
          const markerEnd = arrow.getAttribute("marker-end");
          if (markerEnd == null ? void 0 : markerEnd.includes(`arrowhead-${arrowLinkInstanceId}`)) {
            arrow.remove();
          }
        });
      }
    } catch (error) {
      logger.warn("Error cleaning up dependency arrows:", error);
    }
  }
  createActionButton(icon, title, disabled = false) {
    const button = this.chartContext.createElement("button");
    button.className = "gantt-action-button";
    button.innerHTML = icon;
    button.title = title;
    button.disabled = disabled;
    button.setAttribute("aria-label", title);
    return button;
  }
  createSeparator() {
    const separator = this.chartContext.createElement("div");
    separator.className = "gantt-action-separator";
    return separator;
  }
  /**
   * Render the built-in toolbar (zoom controls, export button, and any custom
   * `toolbarItems`) into the provided container element.
   *
   * Normally called automatically by `render()`. Use this method directly only
   * when you need to mount the toolbar in a custom DOM slot outside the chart.
   *
   * @param container - The `HTMLElement` to render the toolbar into.
   *   Its `innerHTML` is replaced on each call.
   */
  renderToolbar(container) {
    container.innerHTML = "";
    const selectionDependents = [];
    const getContext = () => {
      var _a;
      return {
        selectedTasks: ((_a = this.selectionManager) == null ? void 0 : _a.getSelectedTasks()) ?? []
      };
    };
    const leftItems = (this.options.toolbarItems ?? []).filter((item) => (item.position ?? "right") === "left");
    if (leftItems.length > 0) {
      leftItems.forEach((item) => {
        const el = this.createToolbarItem(item, getContext, selectionDependents);
        if (el)
          container.append(el);
      });
      container.append(this.createSeparator());
    }
    const zoomInButton = this.createActionButton(Icons.zoomIn, "Zoom In", this.zoomManager.isAtMaxZoom());
    zoomInButton.addEventListener("click", () => this.zoomIn());
    const zoomOutButton = this.createActionButton(Icons.zoomOut, "Zoom Out", this.zoomManager.isAtMinZoom());
    zoomOutButton.addEventListener("click", () => this.zoomOut());
    container.append(zoomInButton, zoomOutButton);
    if (this.options.enableSelection && this.selectionManager) {
      const selectionDisplay = this.chartContext.createElement("div");
      selectionDisplay.className = "gantt-selection-count";
      const count = this.selectionManager.getSelectedIds().size;
      selectionDisplay.textContent = count > 0 ? `${count} selected` : "";
      selectionDisplay.style.display = count > 0 ? "" : "none";
      selectionDependents.push(() => {
        var _a;
        const newCount = ((_a = this.selectionManager) == null ? void 0 : _a.getSelectedIds().size) ?? 0;
        selectionDisplay.textContent = newCount > 0 ? `${newCount} selected` : "";
        selectionDisplay.style.display = newCount > 0 ? "" : "none";
      });
      container.append(selectionDisplay);
    }
    const rightItems = (this.options.toolbarItems ?? []).filter((item) => (item.position ?? "right") === "right");
    if (rightItems.length > 0) {
      container.append(this.createSeparator());
      rightItems.forEach((item) => {
        const el = this.createToolbarItem(item, getContext, selectionDependents);
        if (el)
          container.append(el);
      });
    }
    if (this.options.enableExport) {
      const spacer = this.chartContext.createElement("div");
      spacer.className = "gantt-actions-spacer";
      container.append(spacer);
      const exportButton = this.createActionButton(Icons.download, "Export as SVG");
      exportButton.addEventListener("click", () => {
        var _a;
        const elementToExport = this.element;
        if (!elementToExport) {
          logger.error("Export failed: Chart element not found");
          alert("Export failed: Chart not found. Please refresh and try again.");
          return;
        }
        const ganttContainer = elementToExport.querySelector(Selectors.ganttContainer);
        if (!ganttContainer) {
          logger.error("Export failed: Gantt container not found in chart");
          return;
        }
        try {
          const exportSnapshot = ((_a = this.virtualScrollCoordinator) == null ? void 0 : _a.expandAllForExport()) ?? null;
          exportGantt(elementToExport).finally(() => {
            var _a2;
            (_a2 = this.virtualScrollCoordinator) == null ? void 0 : _a2.restoreAfterExport(exportSnapshot);
          });
        } catch (error) {
          logger.error("Export error:", error);
          alert("Export failed. Please check the console for details.");
        }
      });
      container.append(exportButton);
    }
    if (selectionDependents.length > 0) {
      this.element.addEventListener(GanttEvents.SELECTION_CHANGE, () => {
        selectionDependents.forEach((update) => update());
      });
    }
  }
  /**
   * Build a single DOM element for a custom toolbar item.
   * Returns null for unknown types (future-proofing).
   */
  createToolbarItem(item, getContext, selectionDependents) {
    if (item.type === "separator") {
      return this.createSeparator();
    }
    if (item.type === "button") {
      return this.createToolbarButton(item, getContext, selectionDependents);
    }
    if (item.type === "select") {
      return this.createToolbarSelect(item, getContext);
    }
    return null;
  }
  createToolbarButton(item, getContext, selectionDependents) {
    const btn = this.chartContext.createElement("button");
    btn.className = "gantt-action-button gantt-toolbar-button";
    if (item.tooltip) {
      btn.title = item.tooltip;
      btn.setAttribute("aria-label", item.tooltip);
    } else if (item.label) {
      btn.setAttribute("aria-label", item.label);
    }
    const resolveDisabled = () => {
      if (item.requiresSelection) {
        return getContext().selectedTasks.length === 0;
      }
      if (typeof item.disabled === "function") {
        return item.disabled(getContext());
      }
      return item.disabled ?? false;
    };
    const renderLabel = () => {
      const count = getContext().selectedTasks.length;
      const countSuffix = item.showCount && count > 0 ? ` (${count})` : "";
      const labelText = item.label ? `<span>${item.label}${countSuffix}</span>` : "";
      const iconHtml = item.icon ?? "";
      return `${iconHtml}${labelText}`;
    };
    const syncState = () => {
      btn.innerHTML = renderLabel();
      btn.disabled = resolveDisabled();
    };
    syncState();
    btn.addEventListener("click", () => {
      if (!btn.disabled) {
        item.onClick(getContext());
      }
    });
    const isDynamic = item.requiresSelection || typeof item.disabled === "function" || item.showCount;
    if (isDynamic) {
      selectionDependents.push(syncState);
    }
    return btn;
  }
  createToolbarSelect(item, getContext) {
    const wrapper = this.chartContext.createElement("div");
    wrapper.className = "gantt-toolbar-select-wrapper";
    if (item.label) {
      const lbl = this.chartContext.createElement("span");
      lbl.className = "gantt-toolbar-select-label";
      lbl.textContent = item.label;
      wrapper.append(lbl);
    }
    const select = this.chartContext.createElement("select");
    select.className = "gantt-toolbar-select";
    if (item.placeholder) {
      const placeholder = this.chartContext.createElement("option");
      placeholder.value = "";
      placeholder.textContent = item.placeholder;
      placeholder.disabled = true;
      placeholder.selected = true;
      select.append(placeholder);
    }
    item.options.forEach(({ value, text }) => {
      const opt = this.chartContext.createElement("option");
      opt.value = value;
      opt.textContent = text;
      select.append(opt);
    });
    select.addEventListener("change", () => {
      item.onChange(select.value, getContext());
    });
    wrapper.append(select);
    return wrapper;
  }
  /**
   * Update chart options and re-render.
   *
   * Merges the supplied options with the current configuration. Only the keys
   * you pass are changed; unspecified keys keep their current values. Passing
   * `undefined` for a key resets it to its default value.
   *
   * Scroll position, collapsed/expanded state, and current zoom level are
   * preserved across updates unless explicitly overridden.
   *
   * @param options - Partial or full `GanttUserOptions` to apply.
   *
   * @example
   * ```ts
   * // Zoom to month density and update tasks
   * gantt.update({ pixelsPerDay: 4.9, series: newTasks });
   *
   * // Toggle dark theme at runtime
   * gantt.update({ theme: 'dark' });
   * ```
   */
  /**
   * Merge nested object option groups (baseline, barLabel) explicitly so a
   * partial user-supplied override doesn't blow away unspecified subfields.
   * Spread layers are: theme defaults → carried-over current options → incoming.
   */
  mergeNestedOptionGroups(themeDefaults, carried, incoming) {
    const merged = { ...themeDefaults, ...carried, ...incoming };
    merged.baseline = {
      ...themeDefaults.baseline,
      ...carried.baseline ?? themeDefaults.baseline,
      ...incoming.baseline ?? {}
    };
    merged.barLabel = {
      ...themeDefaults.barLabel,
      ...carried.barLabel ?? themeDefaults.barLabel,
      ...incoming.barLabel ?? {}
    };
    merged.dependencies = {
      ...themeDefaults.dependencies,
      ...carried.dependencies ?? themeDefaults.dependencies,
      ...incoming.dependencies ?? {}
    };
    return merged;
  }
  update(options) {
    var _a;
    if (this.element && !this.isDestroyed()) {
      this.stateManager.captureState(
        this.element,
        this.dataManager,
        this.pixelsPerMs,
        (_a = this.selectionManager) == null ? void 0 : _a.captureState()
      );
    }
    const currentTheme = this.detectCurrentTheme();
    const newTheme = options.theme;
    const isThemeChanging = newTheme && newTheme !== currentTheme;
    const preservedPixelsPerMs = this.stateManager.hasState() ? this.stateManager.getPixelsPerMs() : this.pixelsPerMs;
    const keysToReset = new Set(
      Object.keys(options).filter((k) => options[k] === void 0)
    );
    const definedIncoming = Object.fromEntries(
      Object.entries(options).filter(([, v]) => v !== void 0)
    );
    const targetTheme = newTheme || currentTheme;
    const themeDefaults = getDefaultOptions(targetTheme);
    let mergedOptions;
    if (isThemeChanging) {
      this.styleManager.cleanupScrollbarStyles();
      const preservedFromCurrent = {
        series: this.options.series,
        parsing: this.options.parsing,
        width: this.options.width,
        height: this.options.height,
        pixelsPerDay: this.options.pixelsPerDay,
        rowHeight: this.options.rowHeight,
        tasksContainerWidth: this.options.tasksContainerWidth,
        inputDateFormat: this.options.inputDateFormat,
        annotations: this.options.annotations,
        enableSelection: this.options.enableSelection,
        enableExport: this.options.enableExport,
        enableResize: this.options.enableResize,
        enableTaskDrag: this.options.enableTaskDrag,
        enableTaskEdit: this.options.enableTaskEdit,
        enableTaskResize: this.options.enableTaskResize,
        enableTooltip: this.options.enableTooltip,
        tooltipTemplate: this.options.tooltipTemplate,
        canvasStyle: this.options.canvasStyle
      };
      mergedOptions = this.mergeNestedOptionGroups(themeDefaults, preservedFromCurrent, definedIncoming);
    } else {
      const currentWithoutReset = Object.fromEntries(
        Object.entries(this.options).filter(([k]) => !keysToReset.has(k))
      );
      mergedOptions = this.mergeNestedOptionGroups(themeDefaults, currentWithoutReset, definedIncoming);
    }
    const userPxPerDay = options.pixelsPerDay;
    const userExplicitlySetZoom = typeof userPxPerDay === "number" && userPxPerDay > 0;
    if (!userExplicitlySetZoom) {
      this._preservedPixelsPerMs = preservedPixelsPerMs;
    } else {
      this._preservedPixelsPerMs = null;
      this.needsAutoFitZoom = false;
    }
    let processedSeries;
    if (mergedOptions.parsing) {
      if (!DataParser.validateConfig(mergedOptions.parsing)) {
        logger.error("ApexGantt: Invalid parsing configuration provided in update()");
        processedSeries = this.options.series;
      } else {
        processedSeries = DataParser.parse(mergedOptions.series, mergedOptions.parsing);
      }
    } else if (mergedOptions.series) {
      processedSeries = mergedOptions.series;
    } else {
      processedSeries = this.options.series;
    }
    this.options = {
      ...mergedOptions,
      series: processedSeries
    };
    if (this.options.enableTaskEdit && options.enableInlineEdit !== false) {
      this.options.enableInlineEdit = true;
    }
    this.pixelsPerMs = this._preservedPixelsPerMs ?? this.computeInitialPixelsPerMs(this.options);
    this._preservedPixelsPerMs = null;
    this.dataManager.setTasks(this.options.series);
    this.styleManager.updateOptions(this.options);
    this.scrollManager.updateOptions(this.options);
    this.layoutManager.updateOptions(this.options);
    this.crosshairManager.updateOptions(this.options);
    this.render();
    if (this.element && !this.isDestroyed()) {
      this.stateManager.restoreState(this.element);
    }
  }
  detectCurrentTheme() {
    const currentBgColor = this.options.backgroundColor;
    return this.styleManager.isColorDark(currentBgColor) ? "dark" : "light";
  }
  /**
   * Imperatively update a single task's data and reflect the change in the UI
   * without triggering a full re-render.
   *
   * Useful for applying real-time changes (e.g. progress updates from a server)
   * with minimal DOM work. Only the affected task bar and row are updated.
   *
   * @param taskId - The `id` of the task to update.
   * @param updatedTask - A partial `Task` object containing only the fields to change.
   *   Supply `startTime`, `endTime`, `progress`, `name`, etc. — any subset is valid.
   *
   * @throws {Error} If no task with the given `taskId` exists in the current dataset.
   *
   * @example
   * ```ts
   * // Update progress for task 't3'
   * gantt.updateTask('t3', { progress: 75 });
   *
   * // Shift a task's dates
   * gantt.updateTask('t3', { startTime: '2026-06-01', endTime: '2026-06-15' });
   * ```
   */
  updateTask(taskId, updatedTask) {
    const task = this.dataManager.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    const dateRange = this.dataManager.getDateRange(0, this.pixelsPerMs);
    const { geometry } = renderTimelineHeader(dateRange[0], dateRange[1], this.pixelsPerMs);
    updateTaskInUI(this.chartContext, this.dataManager, taskId, updatedTask, this.options, geometry);
  }
  /**
   * Internal entry point used by inline editors in the task-list panel.
   * Applies the partial update via `updateTaskInUI` and emits the same
   * `taskUpdate` / `taskUpdateSuccess` / `taskUpdateError` events that the
   * inline TaskForm emits, so consumers see a uniform event stream regardless
   * of which UI surface produced the change.
   */
  commitInlineEdit(taskId, updates) {
    const task = this.dataManager.getTaskById(taskId);
    if (!task)
      return;
    try {
      const dateRange = this.dataManager.getDateRange(0, this.pixelsPerMs);
      const { geometry } = renderTimelineHeader(dateRange[0], dateRange[1], this.pixelsPerMs);
      this.element.dispatchEvent(
        new CustomEvent(GanttEvents.TASK_UPDATE, {
          detail: { taskId, updates, updatedTask: { ...task, ...updates }, timestamp: Date.now() },
          bubbles: true,
          composed: true
        })
      );
      updateTaskInUI(this.chartContext, this.dataManager, taskId, updates, this.options, geometry);
      refreshSummaryAncestors(this.chartContext, this.dataManager, taskId, this.options, geometry);
      const updatedTask = this.dataManager.getTaskById(taskId) ?? { ...task, ...updates };
      this.element.dispatchEvent(
        new CustomEvent(GanttEvents.TASK_UPDATE_SUCCESS, {
          detail: { taskId, updatedTask, timestamp: Date.now() },
          bubbles: true,
          composed: true
        })
      );
    } catch (error) {
      logger.warn(`[ApexGantt] Inline edit failed for task ${taskId}:`, error);
      this.element.dispatchEvent(
        new CustomEvent(GanttEvents.TASK_UPDATE_ERROR, {
          detail: {
            taskId,
            error: error instanceof Error ? error : new Error(String(error)),
            timestamp: Date.now()
          },
          bubbles: true,
          composed: true
        })
      );
    }
  }
  // ---------------------------------------------------------------------------
  // Selection API
  // ---------------------------------------------------------------------------
  /** Returns an array of currently selected task objects. Requires `enableSelection: true`. */
  getSelectedTasks() {
    var _a;
    return ((_a = this.selectionManager) == null ? void 0 : _a.getSelectedTasks()) ?? [];
  }
  /** Programmatically set the selection to the given task IDs. Requires `enableSelection: true`. */
  setSelectedTasks(ids) {
    var _a;
    (_a = this.selectionManager) == null ? void 0 : _a.setSelectedTasks(ids);
  }
  /** Clear all selected tasks. Requires `enableSelection: true`. */
  clearSelection() {
    var _a;
    (_a = this.selectionManager) == null ? void 0 : _a.clearSelection();
  }
  // ---------------------------------------------------------------------------
  // Zoom API
  // ---------------------------------------------------------------------------
  /**
   * Zoom in by one step (increase timeline resolution).
   *
   * Scale order from finest to coarsest: `Day → Week → Month → Quarter → Year`.
   * Calling `zoomIn()` when already at `Day` view has no effect.
   *
   * @example
   * ```ts
   * gantt.zoomIn(); // e.g. Month → Week
   * ```
   */
  zoomIn() {
    this.zoomManager.zoomIn();
  }
  /**
   * Zoom out by one step (decrease timeline resolution).
   *
   * Scale order from finest to coarsest: `Day → Week → Month → Quarter → Year`.
   * Calling `zoomOut()` when already at `Year` view has no effect.
   *
   * @example
   * ```ts
   * gantt.zoomOut(); // e.g. Month → Quarter
   * ```
   */
  zoomOut() {
    this.zoomManager.zoomOut();
  }
  /**
   * update the horizontal scrollbar's content width to match timeline width
   */
  /**
   * Normalize dimension value to CSS string
   */
  normalizeDimension(value) {
    if (typeof value === "number") {
      return `${value}px`;
    }
    return value;
  }
  /**
   * resize observer for container to handle responsive width and height changes
   */
  setupContainerResizeObserver() {
    if (!this.element) {
      return;
    }
    if (this.containerResizeObserver) {
      this.containerResizeObserver.disconnect();
    }
    const normalizedWidth = this.normalizeDimension(this.options.width);
    const normalizedHeight = this.normalizeDimension(this.options.height);
    const isPercentageWidth = typeof normalizedWidth === "string" && normalizedWidth.includes("%");
    const isPercentageHeight = typeof normalizedHeight === "string" && normalizedHeight.includes("%");
    if (!isPercentageWidth && !isPercentageHeight) {
      return;
    }
    this.lastKnownWidth = this.element.offsetWidth;
    this.lastKnownHeight = this.element.offsetHeight;
    this.containerResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        const widthChanged = Math.abs(newWidth - this.lastKnownWidth) > 1;
        const heightChanged = Math.abs(newHeight - this.lastKnownHeight) > 1;
        if (widthChanged || heightChanged) {
          this.lastKnownWidth = newWidth;
          this.lastKnownHeight = newHeight;
          this.handleContainerResize();
        }
      }
    });
    this.containerResizeObserver.observe(this.element);
  }
  handleContainerResize() {
    if (this.resizeDebounceTimer !== null) {
      window.clearTimeout(this.resizeDebounceTimer);
    }
    this.resizeDebounceTimer = window.setTimeout(() => {
      this.performResize();
      this.resizeDebounceTimer = null;
    }, 150);
  }
  performResize() {
    if (!this.element || this.isDestroyed()) {
      return;
    }
    const normalizedWidth = this.normalizeDimension(this.options.width);
    const normalizedHeight = this.normalizeDimension(this.options.height);
    const isPercentageWidth = typeof normalizedWidth === "string" && normalizedWidth.includes("%");
    const isPercentageHeight = typeof normalizedHeight === "string" && normalizedHeight.includes("%");
    if (isPercentageWidth) {
      const computedWidth = window.getComputedStyle(this.element.parentElement || this.element).width;
      const currentElementWidth = window.getComputedStyle(this.element).width;
      if (computedWidth !== currentElementWidth) {
        requestAnimationFrame(() => {
          this.scrollManager.positionHorizontalScrollbar();
          this.scrollManager.updateHorizontalScrollbarContent();
          this.layoutManager.syncTasksColumnWidths();
        });
      }
    }
    if (isPercentageHeight) {
      requestAnimationFrame(() => {
        this.layoutManager.fillEmptyRowsAfterRender();
      });
    }
  }
  /**
   * Destroy the chart instance and free all associated resources.
   *
   * Removes all event listeners, disconnects `ResizeObserver`s, clears the
   * tooltip, clears the DOM, and nulls internal references. After calling
   * `destroy()`, the instance cannot be reused — create a new `ApexGantt`
   * instead.
   *
   * Always call `destroy()` before removing the host element from the DOM or
   * when cleaning up in frameworks (component `ngOnDestroy`, React `useEffect`
   * cleanup, Vue `onBeforeUnmount`, etc.).
   *
   * @example
   * ```ts
   * // React cleanup example
   * useEffect(() => {
   *   const gantt = new ApexGantt(ref.current!, options);
   *   gantt.render();
   *   return () => gantt.destroy();
   * }, []);
   * ```
   */
  destroy() {
    var _a, _b;
    this._destroyed = true;
    try {
      if (this.virtualScrollCoordinator) {
        this.virtualScrollCoordinator.destroy();
        this.virtualScrollCoordinator = null;
      }
      if (this.containerResizeObserver) {
        this.containerResizeObserver.disconnect();
        this.containerResizeObserver = null;
      }
      if (this.resizeDebounceTimer !== null) {
        window.clearTimeout(this.resizeDebounceTimer);
        this.resizeDebounceTimer = null;
      }
      this.cancelPendingAfterActionsRaf();
      this.zoomManager.cleanup();
      this.scrollManager.cleanup();
      this.crosshairManager.detach();
      (_a = this.keyboardNavigationManager) == null ? void 0 : _a.detach();
      (_b = this.selectionManager) == null ? void 0 : _b.destroy();
      if (this.reducedMotionMQL && this.reducedMotionHandler) {
        this.reducedMotionMQL.removeEventListener("change", this.reducedMotionHandler);
        this.reducedMotionMQL = null;
        this.reducedMotionHandler = null;
      }
      this.cleanupEventListeners();
      this.cleanupTooltips();
      this.cleanupDependencyArrows();
      this.columnRenderManager.destroy();
      this.element.innerHTML = "";
      this.clearDomCache();
      super.destroy();
    } catch (error) {
      logger.error("Error during ApexGantt destruction:", error);
    }
  }
  /**
   * Returns `true` if the chart has been destroyed or the host element is empty.
   *
   * Use this guard before calling any other method if you are unsure whether
   * `destroy()` has already been called.
   *
   * @returns `true` after `destroy()` has been called, `false` while the chart is live.
   *
   * @example
   * ```ts
   * if (!gantt.isDestroyed()) {
   *   gantt.update({ series: newTasks });
   * }
   * ```
   */
  isDestroyed() {
    return this._destroyed || !this.element;
  }
}
const DEFAULT_PALETTE = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16"
];
function deriveInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0)
    return "";
  if (parts.length === 1)
    return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function deterministicColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return DEFAULT_PALETTE[Math.abs(hash) % DEFAULT_PALETTE.length];
}
function renderSingleAvatar(a, size, marginLeft, borderColor, fallbackColor) {
  const ml = marginLeft === 0 ? "0" : `-${marginLeft}px`;
  const baseStyle = `width:${size}px;height:${size}px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-left:${ml};border:2px solid ${escapeHtml(borderColor)};box-sizing:border-box;overflow:hidden;flex-shrink:0;`;
  const title = escapeHtml(a.name);
  if (a.avatarUrl) {
    return `<span class="apexgantt-avatar" style="${baseStyle}" title="${title}"><img src="${escapeHtml(a.avatarUrl)}" alt="${title}" style="width:100%;height:100%;object-fit:cover;display:block" /></span>`;
  }
  const initials = a.initials ?? deriveInitials(a.name);
  const bg = a.color ?? fallbackColor ?? deterministicColor(a.name);
  const fontSize = Math.max(10, Math.round(size * 0.4));
  return `<span class="apexgantt-avatar" style="${baseStyle}background:${escapeHtml(bg)};color:#fff;font-size:${fontSize}px;font-weight:600;line-height:1" title="${title}">${escapeHtml(initials)}</span>`;
}
function renderOverflow(count, size, marginLeft, borderColor) {
  const fontSize = Math.max(10, Math.round(size * 0.36));
  const baseStyle = `width:${size}px;height:${size}px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-left:-${marginLeft}px;border:2px solid ${escapeHtml(borderColor)};box-sizing:border-box;background:#E5E7EB;color:#374151;font-size:${fontSize}px;font-weight:600;flex-shrink:0;line-height:1;`;
  return `<span class="apexgantt-avatar-overflow" style="${baseStyle}">+${count}</span>`;
}
function avatars(options) {
  const { accessor, max = 4, size = 24, overlap = 8, borderColor = "#FFFFFF", fallbackColor } = options;
  return (ctx) => {
    const list = accessor(ctx.task);
    if (!list || list.length === 0)
      return "";
    const visible = list.slice(0, max);
    const overflowCount = list.length - visible.length;
    const avatarHtml = visible.map((a, i) => renderSingleAvatar(a, size, i === 0 ? 0 : overlap, borderColor, fallbackColor)).join("");
    const overflowHtml = overflowCount > 0 ? renderOverflow(overflowCount, size, overlap, borderColor) : "";
    return `<div class="apexgantt-avatar-stack" style="display:inline-flex;align-items:center;vertical-align:middle">${avatarHtml}${overflowHtml}</div>`;
  };
}
function progressRing(options = {}) {
  const {
    accessor = (task) => task.progress,
    size = 32,
    strokeWidth = 3,
    progressColor = "#EF4444",
    trackColor = "#E5E7EB",
    showLabel = true,
    labelColor
  } = options;
  return (ctx) => {
    const raw = accessor(ctx.task);
    const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
    const resolvedColor = typeof progressColor === "function" ? progressColor(ctx.task, Math.max(0, Math.min(100, value))) : progressColor;
    return progressRingSvg({
      value,
      size,
      strokeWidth,
      progressColor: resolvedColor,
      trackColor,
      showLabel,
      labelColor
    });
  };
}
const renderers = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  avatars,
  progressRing
}, Symbol.toStringTag, { value: "Module" }));
const LightTheme = {
  tooltipBGColor: "#FFFFFF",
  tooltipBorderColor: "#CCCCCC",
  tooltipTextColor: "#333333",
  cellBorderColor: "#D0D7DE",
  rowBackgroundColors: ["#FFFFFF", "#F5F9FF"],
  headerBackground: "#EBF3FB",
  headerTextColor: "#333333",
  barBackgroundColor: "#87B7FE",
  barTextColor: "#FFFFFF",
  arrowColor: "#94A3B8",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  borderColor: "#DFE0E1",
  annotationBgColor: "#DBEAFE",
  annotationBorderColor: "#60A5FA",
  dialogBgColor: "#FFFFFF",
  dialogBorderColor: "#EEEEEE",
  buttonBgColor: "#87B7FE",
  buttonTextColor: "#FFFFFF",
  buttonHoverBgColor: "#1A6FC4",
  toolbarBgColor: "#FFFFFF",
  toolbarBorderColor: "#BCBCBC",
  toolbarHoverBgColor: "#F0F7FF",
  scrollbarTrackColor: "#F5F5F5",
  scrollbarThumbColor: "#C1C1C1",
  scrollbarThumbHoverColor: "#A8A8A8",
  splitBarColor: "#DEE2E6",
  splitBarHoverColor: "#87B7FE",
  splitBarBorderColor: "#BBBBBB",
  splitBarHandleColor: "#666666",
  summaryBarColor: "#B9CECE",
  milestoneColor: "#7C3AED",
  criticalBarColor: "#E53935",
  criticalArrowColor: "#E53935"
};
const DarkTheme = {
  tooltipBGColor: "#2D2D2D",
  tooltipBorderColor: "#444444",
  tooltipTextColor: "#E0E0E0",
  cellBorderColor: "#3A3A3A",
  rowBackgroundColors: ["#1E1E1E", "#252525"],
  headerBackground: "#2A2A2A",
  headerTextColor: "#E0E0E0",
  barBackgroundColor: "#818CF8",
  barTextColor: "#FFFFFF",
  arrowColor: "#94A3B8",
  backgroundColor: "#1E1E1E",
  textColor: "#E0E0E0",
  borderColor: "#3A3A3A",
  annotationBgColor: "#4A2D4D",
  annotationBorderColor: "#8B4D8F",
  dialogBgColor: "#2D2D2D",
  dialogBorderColor: "#444444",
  buttonBgColor: "#6366F1",
  buttonTextColor: "#FFFFFF",
  buttonHoverBgColor: "#4F46E5",
  toolbarBgColor: "#2D2D2D",
  toolbarBorderColor: "#444444",
  toolbarHoverBgColor: "#3A3A3A",
  scrollbarTrackColor: "#000",
  scrollbarThumbColor: "#4A4A4A",
  scrollbarThumbHoverColor: "#5A5A5A",
  splitBarColor: "#3A3A3A",
  splitBarHoverColor: "#818CF8",
  splitBarBorderColor: "#4A4A4A",
  splitBarHandleColor: "#666666",
  summaryBarColor: "#8FBCBC",
  milestoneColor: "#A78BFA",
  criticalBarColor: "#F87171",
  criticalArrowColor: "#F87171"
};
function getTheme(mode) {
  return mode === "dark" ? DarkTheme : LightTheme;
}
if (typeof window !== "undefined") {
  Object.assign(ApexGantt, { ColumnKey, ColumnList, renderers, escapeHtml });
  window.ApexGantt = ApexGantt;
}
export {
  ApexGantt,
  ColumnKey,
  ColumnList,
  DarkTheme,
  DataParser,
  GanttEvents,
  LightTheme,
  Orientation,
  TaskType,
  ApexGantt as default,
  escapeHtml,
  getTheme,
  renderers
};
