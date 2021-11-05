import { FormComponent, FORM_EVENT_SEND, FORM_EVENT_SUCCESS, FORM_EVENT_FAIL, FORM_EVENT_INIT, BUTTON_STATE_ERROR, BUTTON_STATE_SUCCESS } from './form.js';
import { ModalComponent, MODAL_EVENT_RENDERED, MODAL_EVENT_SHOW, MODAL_EVENT_HIDE } from './modal.js';
import { wrapSelection } from './dom_utils.js';

export class SendAndSelect {
    constructor({ ajaxUrl, data = {} }) {
        this.el = window.document.body;

        if (!ajaxUrl) {
            throw new Error('Undefined required parameter "ajaxUrl"');
        }

        this.url = ajaxUrl
        this.data = Object.assign({ url: window.location.href }, data);

        this.listening();

        this.modal = new ModalComponent({ el: this.el });

        this.form = new FormComponent({ el: this.el });
        this.form.data = this.data;
    }

    listening() {
        this.el.addEventListener('keydown', this);
        this.el.addEventListener(MODAL_EVENT_RENDERED, this);
        this.el.addEventListener(FORM_EVENT_SEND, this);
        this.el.addEventListener(FORM_EVENT_SUCCESS, this);
        this.el.addEventListener(FORM_EVENT_FAIL, this);
    }

    handleEvent(event) {
        const name = event.type.split('-').pop();
        this['on' + name[0].toUpperCase() + name.slice(1)](event);
    }

    onKeydown(event) {
        if (this.isKeyCorrect(event) && window.getSelection()) {
            const data = wrapSelection(window.getSelection());

            if (!data) return;

            this.modal.formTemplate = FormComponent.template(data);
            this.form.data = { 'text': data };

            this.el.dispatchEvent(new CustomEvent(MODAL_EVENT_SHOW));
        }
    }

    isKeyCorrect(event) {
        return (event.which === 10 || event.which === 13) && event.ctrlKey; // Ctrl + Enter
    }

    onRendered() {
        this.el.dispatchEvent(new Event(FORM_EVENT_INIT));
    }

    onSend(event) {
        fetch(this.url, {
            method: 'POST',
            body: event.detail,
        }).then((response) => {

            if (200 === response.status) {
                this.el.dispatchEvent(new Event(FORM_EVENT_SUCCESS));
            }

            if (400 <= response.status) {
                this.el.dispatchEvent(new Event(FORM_EVENT_FAIL));
            }

        }).catch(error => console.error(error));
    }

    onSuccess() {
        this.form.buttonState = BUTTON_STATE_SUCCESS;
        setTimeout(() => {
            this.el.dispatchEvent(new Event(MODAL_EVENT_HIDE));
        }, 1000)
    }

    onFail() {
        this.form.buttonState = BUTTON_STATE_ERROR;
        setTimeout(() => {
            this.el.dispatchEvent(new Event(MODAL_EVENT_HIDE));
        }, 2000)
    }
}