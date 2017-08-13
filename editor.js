function Editor(node) {
  this.node = node;
  var self = this;
  node.addEventListener("keydown", function(event) { return self.keyDown(event); });
  node.addEventListener("keyup", function(event) { return self.keyUp(event); });
  this.resetEditor();
  this.node.focus();
}

Editor.prototype.resetEditor = function() {
  this.node.innerHTML = '<span class="thingy">\xa0</span>';
  var sel = window.getSelection();
  var range = document.createRange();
  range.selectNode(this.node.childNodes[0].childNodes[0]);
  sel.empty();
  sel.addRange(range);
}

Editor.traverseAll = function(element, context, depth, parent) {
  depth = depth || 0;
  depth++;
  if (typeof context === 'function') {
    var fn = context;
    context = {enter: fn, text: fn, exit: fn};
  }
  if (element.nodeType === 3) {
    context.text(element, depth, parent);
  } else {
    context.enter(element, depth, parent);
    if (element && element.childNodes) {
      element.childNodes.forEach(e => Editor.traverseAll(e, context,  depth+1, element));
    }
    context.exit(element, depth, parent);
  }
}

function isOnlyBr(node) {
  return node 
    && node.childNodes.length === 1 
    && (node.childNodes[0].nodeName === 'BR' 
        || (node.childNodes[0].nodeName === 'SPAN' && isOnlyBr(node.childNodes[0])));
}

Editor.prototype.clean = function() {
  this.node.normalize();
  Editor.traverseAll(this.node, function(e, depth, p) {
    if (e && e.nodeName === 'SPAN' && e.childNodes && e.nodeType===1 && e.childNodes.length === 0) {
      e.appendChild(document.createTextNode(' '));
    }
  });
  if (isOnlyBr(this.node)) {
    this.resetEditor();
  }
}

Editor.prototype.keyUp = function(event) {
  if (event.key === '(') {
    var s = window.getSelection();
    var r = document.createRange();
    var y = window.getSelection().getRangeAt(0).endContainer;
    r.setStart(y, 1);
    r.setEnd(y, 1);
    s.empty();
    s.addRange(r);
  }

  this.clean();
}

Editor.prototype.newDiv = function() {
    var newDiv = document.createElement('span');
    newDiv.classList.add('thingy');
    newDiv.setAttribute('contenteditable', 'true');
    return newDiv;
}

Editor.prototype.keyDown = function(event) { 
  if (event.key === '(') {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var newDiv = this.newDiv();
    if (range.startContainer.nodeType === 1) {
      range.startContainer.appendChild(newDiv)
      surroundWith(newDiv, '\xa0')

    } else {
      range.surroundContents(newDiv);
      surroundWith(newDiv, '\xa0')
    }
    if (newDiv.childNodes.length === 0)
      newDiv.appendChild(text('\xa0'));
    var c = newDiv.childNodes[0];
    range.setStart(c, 0);
    range.setEnd(c, 0);
    window.getSelection().empty();
    window.getSelection().addRange(range);

    this.clean();
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  return true;
};

Editor.prototype.model = function() {
  var x = '';
  var textFn = e => { x += e.textContent; }
  var enterFn = e => { if (e.nodeName !== 'SPAN') return;  x += "(" }
  var exitFn = e => { if (e.nodeName !== 'SPAN') return;  x += ")" }
  Editor.traverseAll(this.node, {enter: enterFn, text: textFn, exit: exitFn})
  return x.replace(/\xa0/g, ' ');
};


function text(val) {
  return document.createTextNode(val);
}

function surroundWith(newDiv, t) {
  newDiv.parentNode.insertBefore(text(t), newDiv);
  var n = newDiv.nextSibling;
  if (n) {
    n.parentNode.insertBefore(text(t), n);
  } else {
    newDiv.parentNode.appendChild(text(t));
  }
}
