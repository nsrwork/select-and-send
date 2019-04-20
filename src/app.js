/*!
  * https://github.com/nsrwork/select-and-send.git
 */

{
  'use strict'

  const APPLICATION = 'select-and-send'
  const JS_CLASS_SUBMIT_BTN = 'js-submit-button'

  const BUTTON_STATE_SEND = 'send'
  const BUTTON_STATE_ERROR = 'error'
  const BUTTON_STATE_SUCCESS = 'success'

  const FORM = APPLICATION + '-form'
  const FORM_EVENT_SEND = FORM + '-send'
  const FORM_EVENT_SUCCESS = FORM + '-success'
  const FORM_EVENT_FAIL = FORM + '-fail'
  const FORM_EVENT_INIT = FORM + '-init'
  const FORM_STATE_HOLD = 'hold'
  const FORM_STATE_READY = 'ready'

  const MODAL = APPLICATION + '-modal'
  const MODAL_STATE_UNDEFINED = 'undefined'
  const MODAL_STATE_SHOWING = 'showing'
  const MODAL_EVENT_SHOW = MODAL + '-show'
  const MODAL_EVENT_HIDE = MODAL + '-hide'
  const MODAL_EVENT_RENDERED = MODAL + '-rendered'

  class Helper {
    // создает блок обвертку
    static createHTML (template) {
      let node = document.createElement('div')
      node.innerHTML = template.trim()

      return node.firstChild
    }

    // обрамляет текст тегом
    static wrapSelection (selection) {
      let peace = selection.toString()
      let range = selection.getRangeAt(0).commonAncestorContainer.data
      let regex = new RegExp(peace, 'm')

      return range.replace(regex, `<b style="color:#FF0000">${peace}</b>`)
    }
  }

  // отправка данных на сервер
  class HttpService {

    set ajax (url) {
      this._url = url
    }

    set method (method) {
      this._method = method.toUpperCase()
    }

    set formData (data) {
      this._formData = data
    }

    // делает запрос
    doRequest () {
      return fetch(this._url, {
        method: this._method,
        body: this._formData,
      }).then(response => response)
    }
  }

  // формирует данные для отправки на сервер и отображает статусы состояния кнопки
  class FormComponent {
    constructor ({ el }) {
      this.el = el
      this._data = []
      this.el.addEventListener(FORM_EVENT_INIT, this)
    }

    // координатор событий
    handleEvent (event) {
      const name = event.type.split('-').pop()
      this['on' + name[0].toUpperCase() + name.slice(1)](event)
    }

    //  Сross Site Request Forgery
    set csrf (value) {
      this._csrf = value
    }

    // for Wordpress
    set action (value) {
      this._action = value
    }

    // данные для отправки на сервер
    set data (value) {
      this._data.push(value)
    }

    // установка отображения кнопки
    set buttonState (state) {
      this._form.button.disabled = true
      this._spinner = `<span class="spinner-border spinner-border-sm"></span> {{TEXT}}...`
      const regx = /{{\w+}}/gm

      if (BUTTON_STATE_SEND === state) {
        this._form.button.innerHTML = this._spinner.replace(regx, 'Отправка')
      }

      if (BUTTON_STATE_ERROR === state) {
        this._form.button.textContent = 'Произошла ошибка, попробуйте позже.'
      }

      if (BUTTON_STATE_SUCCESS === state) {
        this._form.button.textContent = 'Ваше сообщение отправлено, спасибо.'
      }
    }

    // шаблон формы для модального окна
    static template (selection) {
      return `                        
         <form name="${FORM}">                                         
            <div class="form-group">
              <h5>Отправить редакции сообщение об ошибке</h5>
              <hr>
              <p class="selection">${selection}</p>  
              <hr>            
            </div>  
            <button class="btn btn btn-primary ${JS_CLASS_SUBMIT_BTN}" type="submit">Отправить</button> 
         </form>  
      `
    }

    // когда форма отрендерилась можно к ней подключиться
    onInit () {
      this._form = document.querySelector('form[name=' + FORM + ']')
      this._form.button = this._form.querySelector('.' + JS_CLASS_SUBMIT_BTN)
      this._form.addEventListener('submit', this)
    }

    // формируем данные для формы и запускаем событие
    onSubmit (event) {
      event.preventDefault()

      const data = new FormData()

      if (this._action) {
        data.append('action', this._action)
      }

      if (this._csrf) {
        data.append('csrf', this._csrf)
      }

      data.append('data', JSON.stringify(this._data))

      // App::onSend - метод который ожидает данное события
      this.el.dispatchEvent(new CustomEvent(FORM_EVENT_SEND, { detail: data }))
    }
  }

  // компонент модального окна на основе CSS фреймворка Bootstrap
  class ModalComponent {
    constructor ({ el }) {
      this.el = el
      this.el.addEventListener(MODAL_EVENT_SHOW, this)
      this.el.addEventListener(MODAL_EVENT_HIDE, this)
      this._state = MODAL_STATE_UNDEFINED
    }

    // координатор событий
    handleEvent (event) {
      const name = event.type.split('-').pop()
      this['on' + name[0].toUpperCase() + name.slice(1)]()
    }

    // показывает модальное окно
    onShow () {

      // удалить код если уже был вызов
      const modal = this.el.querySelector('#' + MODAL)
      if (modal) {
        modal.remove()
      }

      // отрисовываем новое окно
      this.render()

      // Bootstrap's method
      $('#' + MODAL).modal('show')

      this._state = MODAL_STATE_SHOWING
    }

    // скрывает модальное окно
    onHide () {
      if (MODAL_STATE_SHOWING === this._state) {

        // Bootstrap's method
        $('#' + MODAL).modal('hide')

        this._state = MODAL_STATE_UNDEFINED
      }
    }

    // шаблон формы
    set formTemplate (value) {
      this._form = value.trim()
    }

    // отрисовка окна
    render () {
      this.el.append(Helper.createHTML(this.template()))
      this.el.dispatchEvent(new Event(MODAL_EVENT_RENDERED))
    }

    // шаблон модального окна
    template () {
      return `     
      <div class="modal fade" id="${MODAL}" tabindex="-1" role="dialog" aria-labelledby="${MODAL}-label">
        <div class="modal-dialog" role="document">
          <div class="modal-content">          
            <div class="modal-body">
                ${this._form}
            </div>
          </div>
        </div>
      </div>   
      `
    }
  }

  class App {
    constructor ({ ajaxUrl, currentUrl, csrfToken, action }) {
      this.el = window.document.body

      if (!ajaxUrl) {
        throw new Error('Неопределен обязательный параметр ajaxUrl')
      }

      // endpoint
      this.ajaxUrl = ajaxUrl

      // текущий урл страницы на которой произошел вызов
      this.currentUrl = currentUrl || window.location.href

      // токен формы
      this.csrfToken = csrfToken

      // экшин (используется в плагинах WP)
      this.action = action

      // инициализация сервиса отправки данных
      this.http = new HttpService()
      this.http.method = 'POST'
      this.http.ajax = this.ajaxUrl

      // прослушка событий
      this.listening()

      // инициализация компонента модального окна
      this.modal = new ModalComponent({ el: this.el })

      // предустановка компонента формы
      this.form = new FormComponent({ el: this.el })
      this.form.csrf = this.csrfToken
      this.form.action = this.action
      this.form.data = this.currentUrl
    }

    listening () {
      // отлов нажатия клавиши
      this.el.addEventListener('keydown', this)

      // отлов отрисовки формы в модальном окне
      this.el.addEventListener(MODAL_EVENT_RENDERED, this)

      // отлов отправки формы
      this.el.addEventListener(FORM_EVENT_SEND, this)

      // отлов успешного ответа после отправки формы
      this.el.addEventListener(FORM_EVENT_SUCCESS, this)

      // отлов НЕ успешного ответа после отправки формы
      this.el.addEventListener(FORM_EVENT_FAIL, this)
    }

    // координатор событий
    handleEvent (event) {
      const name = event.type.split('-').pop()
      this['on' + name[0].toUpperCase() + name.slice(1)](event)
    }

    // вызывается при нажатии на определенные клавиши
    onKeydown (event) {

      const selection = window.getSelection()

      // проверка условия нажатия определенных клавиш и наличия выделенного текста
      if (this.isKeyCorrect(event) && selection.toString()) {

        // выделяем выделенный текст в контексте содержания
        const data = Helper.wrapSelection(selection)

        // передадим шаблон формы в модальное окно
        this.modal.formTemplate = FormComponent.template(data)

        // заполняем форму данными
        this.form.data = data

        // запускаем событие для показа модального окна
        this.el.dispatchEvent(new CustomEvent(MODAL_EVENT_SHOW))
      }
    }

    // True если нажаты Ctrl + Enter
    isKeyCorrect (event) {
      return (event.which === 10 || event.which === 13) && event.ctrlKey
    }

    // инициализировать данные формы когда код формы отрисован
    onRendered () {
      this.el.dispatchEvent(new Event(FORM_EVENT_INIT))
    }

    // отправка формы при возникновении события FORM_EVENT_SUBMIT
    onSend (event) {

      // меняем состояние кнопки
      this.form.buttonState = BUTTON_STATE_SEND

      // кладем данные формы в запрос для отправки на сервер
      this.http.formData = event.detail

      // отправляем
      this.http.doRequest().then((response) => {

        // данные отправлены и получен код ответа 200
        if (200 === response.status) {
          this.el.dispatchEvent(new Event(FORM_EVENT_SUCCESS))
        }

        // данные отправлены и получен код ответа 40x или 50x
        if (400 <= response.status) {
          this.el.dispatchEvent(new Event(FORM_EVENT_FAIL))
        }

      }).catch(error => console.error(error))
    }

    // при успешной отправке данных
    onSuccess () {
      // форма отправилась, поменять статус у кнопки
      this.form.buttonState = BUTTON_STATE_SUCCESS

      // закрыть модальное окно
      setTimeout(() => {
        this.el.dispatchEvent(new Event(MODAL_EVENT_HIDE))
      }, 1000)
    }

    // при НЕ успешной отправке данных
    onFail () {
      // форма отправилась, поменять статус у кнопки
      this.form.buttonState = BUTTON_STATE_ERROR

      // закрыть модальное окно
      setTimeout(() => {
        this.el.dispatchEvent(new Event(MODAL_EVENT_HIDE))
      }, 2000)
    }

  }

  // для доступа в глобальном окружении
  window.SelectAndSend = App
}