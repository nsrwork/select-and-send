export function createHTML(template) {
  const node = document.createElement('div');
  node.innerHTML = template.trim();

  return node.firstChild;
}

const CHAR_CUT = 60;
const MAX_LIMIT = 256;

export function wrapSelection(selection) {
  try {
    if (!selection.getRangeAt) return;

    const range = selection.getRangeAt(0);
    let text = range.toString();

    let pre = window.document.createRange();
    pre.setStartBefore(range.startContainer.ownerDocument.body);
    pre.setEnd(range.startContainer, range.startOffset);
    pre = pre.toString();

    let suf = range.cloneRange();
    suf.setStart(range.endContainer, range.endOffset);
    suf.setEndAfter(range.endContainer.ownerDocument.body);
    suf = suf.toString();

    pre = text.startsWith(' ') ? pre + ' ' : pre;
    suf = text.endsWith(' ') ? ' ' + suf : suf;
    text = text.trim();

    if (!text) return;

    pre = pre.substring(pre.length - CHAR_CUT, pre.length).replace(/^\S{1,10}\s+/, '');
    suf = suf.substring(0, CHAR_CUT).replace(/\s+\S{1,10}$/, '');

    const result = ('' + pre + '<strong>' + text + '</strong>' + suf).replace(/[\r\n]+/g, ' ').replace(/^\s+|\s+$/g, '');

    if (result.length > MAX_LIMIT) return;

    return result;

  } catch (e) {
    return;
  }
}
