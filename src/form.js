export const FORM = 'select-and-send-form';
export const FORM_EVENT_SEND = FORM + '-send';
export const FORM_EVENT_SUCCESS = FORM + '-success';
export const FORM_EVENT_FAIL = FORM + '-fail';
export const FORM_EVENT_INIT = FORM + '-init';
export const FORM_STATE_HOLD = 'hold';
export const FORM_STATE_READY = 'ready';

export const BUTTON_STATE_SEND = 'send'
export const BUTTON_STATE_ERROR = 'error'
export const BUTTON_STATE_SUCCESS = 'success'
export const JS_CLASS_SUBMIT_BTN = 'js-submit-button'

export class FormComponent {
    constructor({ el }) {
        this.el = el;
        this._data = [];
        this.el.addEventListener(FORM_EVENT_INIT, this);
    }

    handleEvent(event) {
        const name = event.type.split('-').pop();
        this['on' + name[0].toUpperCase() + name.slice(1)](event);
    }

    set data(value) {
        this._data.push(value);
    }

    set buttonState(state) {
        this._form.button.disabled = true;

        if (BUTTON_STATE_SEND === state) {
            this._form.button.classList.add('is-loading')
        }

        if (BUTTON_STATE_ERROR === state) {
            this._form.button.classList.remove('is-loading')
            this._form.button.textContent = 'Произошла ошибка, попробуйте позже.';
        }

        if (BUTTON_STATE_SUCCESS === state) {
            this._form.button.classList.remove('is-loading')
            this._form.button.textContent = 'Ваше сообщение отправлено, спасибо.';
        }
    }

    static template(selection) {
        return `                        
        <form name="${FORM}">  
            <article class="message">
                <div class="message-header">
                    <p>Отправить редакции сообщение об ошибке</p>
                </div>
                <div class="message-body selection">${selection}</div>
                <button class="button is-fullwidth ${JS_CLASS_SUBMIT_BTN}" type="submit">Отправить</button>
            </article>      
        </form> 
      `;
    }

    onInit() {
        this._form = document.querySelector('form[name=' + FORM + ']');
        this._form.button = this._form.querySelector('.' + JS_CLASS_SUBMIT_BTN);
        this._form.addEventListener('submit', this);
    }

    onSubmit(event) {
        event.preventDefault();

        const data = new FormData();
        data.append('data', JSON.stringify(this._data));

        this.buttonState = BUTTON_STATE_SEND;
        this.el.dispatchEvent(new CustomEvent(FORM_EVENT_SEND, { detail: data }));
    }
}