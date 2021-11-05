import { createHTML } from './dom_utils.js';

export const MODAL = 'select-and-send-modal';
export const MODAL_CLOSE = 'modal-hide';
export const MODAL_STATE_UNDEFINED = 'undefined';
export const MODAL_STATE_SHOWING = 'showing';
export const MODAL_EVENT_SHOW = MODAL + '-show';
export const MODAL_EVENT_HIDE = MODAL + '-hide';
export const MODAL_EVENT_RENDERED = MODAL + '-rendered';

export class ModalComponent {
  constructor({ el }) {
    this.el = el;
    this.el.addEventListener('keydown', this);
    this.el.addEventListener(MODAL_EVENT_SHOW, this);
    this.el.addEventListener(MODAL_EVENT_HIDE, this);
    this._state = MODAL_STATE_UNDEFINED;
  }

  handleEvent(event) {
    const name = event.type.split('-').pop();
    this['on' + name[0].toUpperCase() + name.slice(1)](event);
  }

  onShow() {
    this.render();
    this._modal = this.el.querySelector('#' + MODAL);
    this._modal.classList.add("is-active");
    this._state = MODAL_STATE_SHOWING;
  }

  onHide() {
    if (MODAL_STATE_SHOWING === this._state) {

      if (!this._modal) return;

      this._modal.remove();
      this._state = MODAL_STATE_UNDEFINED;
    }
  }

  onKeydown(event) {
    if (event.which === 27) this.onHide(); // Esc
  }

  onClick(event) {
    if (event.target.classList.contains(MODAL_CLOSE)) this.onHide();
  }

  set formTemplate(value) {
    this._form = value.trim();
  }

  render() {
    this.el.append(createHTML(this.template()));
    this._button = this.el.querySelector('#' + MODAL);
    this._button.addEventListener('click', this);
    this.el.dispatchEvent(new Event(MODAL_EVENT_RENDERED));
  }

  template() {
    return `     
      <div class="modal" id="${MODAL}">
        <div class="modal-background ${MODAL_CLOSE}"></div>
        <div class="modal-content">${this._form}</div>        
        <button class="modal-close is-large ${MODAL_CLOSE}"></button>
      </div>   
      `;
  }
}