# Select And Send

## Сценарий

Пользователь выделяет часть текста мышкой (подразумевается, что это орфографическая ошибка), затем нажимает сочетания 
клавиш Ctrl + Enter, появляется модальное окно с выделенным текстом и контекстом, а также кнопкой отправки данных.

## Инициализация

```js
import { SendAndSelect } from './app.js';

new SelectAndSend({
  ajaxUrl: '/',
  data: {},
})
```

```ajaxUrl``` - (обязательный параметр) урл для ajax запросов

```data``` - (не обязательный параметр) можно передать дополнительные данные, которые будут отправлены на сервер

## Требования

Код и стили модального окна используется от https://bulma.io