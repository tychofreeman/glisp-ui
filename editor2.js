var model = [];
var currNode = model;

function map(xs, fn) {
  return Array.prototype.map.call(xs, fn);
}

function updateLast(xs, _default, updateFn) {
  if (!xs.length) {
    xs.push(_default);
  }
  return xs[xs.length - 1] = updateFn(xs[xs.length - 1]);
}

function traverse(modelNode, transform, append) {
  if (!modelNode) return;
  var r = transform(modelNode);
  console.log("Node->:", r);
  if (!r.hasChildNodes()) return r;
  var childs = map(modelNode, function(n) { 
    return traverse(n, transform, append);
  });
  console.log("    children", childs)
  childs.forEach( function(c) { append(r, c) } );
  console.log(" after", r);
  return r;
}

function modelNodeToHtmlNode(n) {
  if (typeof n === 'string') {
    return document.createTextNode(n);
  }
  var d = document.createElement("span");
  d.appendChild(document.createTextNode("("))
  d.appendChild(document.createTextNode(")"))
  return d;
}

function appendChildNode(parent, child) {
  console.log("Parent/Child", parent, child);
  if (parent.hasChildNodes()) {
    var lastChild = parent.childNodes[parent.childNodes.length - 1];
    var x = parent.insertBefore(child, lastChild);
    console.log("X:", x);
    return x;
  }
  return child;
}

function update(thisModel, node) {
  var stuff = traverse(thisModel, modelNodeToHtmlNode, appendChildNode);
  node.innerHTML = '';
  node.appendChild(stuff)
}

function onKeyPress(event) {
  if (event.key === 'Enter') {
    model += '<br>';
  } else if (event.key === '(') {
    var newCurr = [];
    if (currNode instanceof Array) {
      currNode.push(newCurr);
    }
    currNode = newCurr;
    console.log(model);
  } else if (event.key === ')') {
  } else {
    updateLast(currNode, "", function(t) { return t + event.key })
  }
}

window.addEventListener("load", function(event) {
  var editor = document.getElementsByClassName("editor")[0];
  document.body.addEventListener("keypress", function(event) {
    onKeyPress(event);
    update(model, editor);
  });
  update(model, editor);
});

