define(function (require, exports, module) {
    var common = require('common');
    var utils = require('utils');
    var events = require('events');
    var dragger = require('dragger');
    var mousetouch = require('mousetouch');
    var keyboard = require('keyboard');
    var renderer = require('renderer');
    var nodeCurve = require('nodeCurve');
    var geometry = require('geometry');
    var dataParser = require('dataParser');
    var editor = require('editor');
    var Point = geometry.Point;

    var currentNode;

    function getMousePosition(dom, evt) {

        if (!currentNode) {
            currentNode = evt.manager.src.parentNode;
            //console.log(currentNode.getAttribute('data-id'))
        }

        var parentNode;
        var dom2 = currentNode;

        var xy = {
            x: dom2.offsetLeft,
            y: dom2.offsetTop
        };

        while ((parentNode = dom2.parentNode) && parentNode != dom) {
            xy.x += (parentNode.offsetLeft || 0);
           // console.log("parentNode:", parentNode, parentNode.offsetLeft)
            xy.y += (parentNode.offsetTop || 0);
            dom2 = parentNode;
        }

        xy.x = evt.xy.x - xy.x;
        xy.y = evt.xy.y - xy.y;
        return xy;
    }

    var EventsManager = exports.EventsManager = function (parser) {
        this.parser = parser;
        this.offset = {
            x: 0,
            y: 0
        };
        this.event = events.listen(this.parser.dom).addComplexEvents(new dragger.Dragger(), new mousetouch.Click(), new mousetouch.Wheel());
        this.keyboard = events.listen(window).addComplexEvents(new keyboard.Key());
        this.pointDiv = document.createElement('div');
        with (this.pointDiv) {
            className = 'MMPointDiv';
            setAttribute('type', 'point');
            style.zIndex = dataParser.baseZindexMap.pointDiv;
        }
        this.init();
    };

    var randomHex = function () {
        return (parseInt(Math.random() * 100) % 16).toString(16);
    };

    common.mix(EventsManager.prototype, {
        scale: 1,
        step: 0.1,
        defaultValue: 'idea',
        init: function () {
            with (this.event) {
                on('mouseover', this, this.mouseover);
                on('mousedown', this, this.mousedown);
                on('mouseup', this, this.mouseup);
                on('$dragmove', this, this.dragmove);
                on('$downmove', this, this.downmove);
                on('$lclick', this, this.click);
                on('$dblclick', this, this.dblclick);
                on('$wheelup', this, function () {
                    this.transform(true);
                });
                on('$wheeldown', this, function () {
                    this.transform(false);
                });
            }
            this.keyboard.on('$keyup:delete', this, this.deleteNode);
            this.keyboard.on('$keyup:ctrl+enter', this, this.endEdit);
            this.keyboard.on('$keyup:esc', this, this.esc);
        },
        esc: function () {
            this.pointDiv.parentNode && this.pointDiv.parentNode.removeChild(this.pointDiv);
            this.setCurrentNode(null);
        },
        deleteNode: function (evt) {
            if (this.currentNode) {
                var id = this.currentNode.getAttribute('data-id');
                this.parser.remove(id);
            }
            this.esc();
        },
        downmove: function () {
            this._move = true;
        },
        mousedown: function (evt) {
            //console.log(this.parser.dom, evt.xy, evt.manager.src.parentNode.offsetTop);
            this.downPosition = getMousePosition(this.parser.dom, evt);
            var src = this.downDom = events.getSrcElement(evt);
            if ('DIV' == this.downDom.tagName) {
                this.downDomZindex = this.downDom.style.zIndex;
                this.downDom.style.zIndex = dataParser.baseZindexMap.maxZindex;
            }
            if ('Undefined' != utils.typeOf(this.editing) && 'TEXTAREA' != src.tagName) {
                this.endEdit();
            }
        },
        endEdit: function () {
            if (this.editing) {
                var _d = this.parser.table[this.editing];
                var inner=_d.data.title = this._editor().getTitle();
                _d.inner.innerText = inner;
                _d.inner.textContent=inner;
                _d.div.replaceChild(_d.inner, this.editor.domNode);
                this.editing = undefined;
            }
        },
        mouseup: function (evt) {
            this._move = false;
            currentNode = false;
            if ('DIV' == this.downDom.tagName) {
                this.downDom.style.zIndex = this.downDomZindex;
            }
            if (this.creating) {
                var td = this.tempData;
                this.creating = false;
                this.pointDiv.style.top = '';
                this.pointDiv.style.left = '';
                this.tempCanvas.parentNode.removeChild(this.tempCanvas);
                this.tempCanvas = null;
                this.tempData = null;
                this.parser.add(td);
                this.parser.table[td.id].div.appendChild(this.pointDiv);
            }
        },
        click: function (evt) {
            var src = events.getSrcElement(evt);
            if ('point' == src.getAttribute('type')) {
                var dataId = src.parentNode.getAttribute('data-id');
                var _d = this.parser.table[dataId];
                var visible = _d.data.visible = !_d.data.visible;
                var display = visible ? 'block' : 'none';
                this.pointDiv.innerHTML = visible ? '+' : '-';
                var _c = _d.data.children;
                for (var i = 0; i < _c.length; i++) {
                    var __d = this.parser.table[_c[i].id];
                    __d.div.style.display = display;
                    __d.canvas.style.display = display;
                }
            }
            if ('inner' == src.getAttribute('type')) {
                this.setCurrentNode(src);
            } else {
                this.esc();
            }
        },
        setCurrentNode: function (src) {
            //if (this.currentNode) {
            //	util.className(this.currentNode, 'MMnodeInnerDivHover', true);
            //	util.className(this.currentNode, 'MMcurrentNodeDiv');
            //}
            //if (src) {
            //	util.className(src, 'MMnodeInnerDivHover');
            //	util.className(src, 'MMcurrentNodeDiv', true);
            //}
            this.currentNode = src;
        },
        dblclick: function (evt) {
            var dataId, src = events.getSrcElement(evt);
            events.findElement(src, function (emt) {
                return dataId = emt.getAttribute('data-id');
            });
            if (dataId && 'inner' == src.getAttribute('type')) {
                var _d = this.parser.table[dataId];
                var ed = this._editor();
                ed.setTitle(_d.data.title);
                ed.domNode.style.zIndex = dataParser.baseZindexMap.maxZindex;
                _d.div.replaceChild(ed.domNode, _d.inner);
                ed.focus();
                this.editing = dataId;
            } else if (this.downDom == this.parser.dom || this.downDom.tagName == 'polyline') {
                this.transform(true, 1);
                this.center();
            }
        },
        dragmove: function (evt) {
            if (this._move) {
                if (this.downDom == this.parser.dom || this.downDom.tagName == 'polyline') {
                    //拖拽容器
                    this.dragContainer(evt);
                } else if (this.downDom == this.pointDiv) {
                    //拖拽圆点
                    this.dragPoint(evt);
                } else if (!this.editing) {
                    //拖拽节点
                    this.dragNode(evt);
                }
            }
        },
        mouseover: function (evt) {
            if (this.creating) {
                return;
            }
            var src = events.getSrcElement(evt);
            var dataId = src.getAttribute('data-id'), type = src.getAttribute('type');
            if (dataId && /border|inner/g.test(type)) {
                var _d = this.parser.table[dataId];
                _d.div.appendChild(this.pointDiv);
                this.pointDiv.innerHTML = _d.data.visible ? '+' : '-';
            }
        },
        transformTemplate: '; -webkit-transform: scale(\\d+\\.\\d+);transform: scale(\\d+\\.\\d+)',
        transform: function (up, scale) {
            var step = this.step * ( up ? 1 : -1);
            this.scale = scale ? scale : this.scale += step;
            var scale = this.transformTemplate.replace(/\\d\+\\.\\d\+/g, this.scale);
            if (this.parser.rootDom) {
                this.parser.rootDom.style.cssText = this.parser.rootDom.style.cssText.replace(new RegExp(this.transformTemplate, 'g'), '') + scale;
            }
        },
        center: function () {
            var domStyle = this.parser.rootDom.style;
            domStyle.left = parseInt(domStyle.left.replace('px', '')) - this.offset.x + 'px';
            domStyle.top = parseInt(domStyle.top.replace('px', '')) - this.offset.y + 'px';
            this.offset.x = 0;
            this.offset.y = 0;
        },
        dragContainer: function (evt) {

            var downPosition = evt.xy; //getMousePosition(this.parser.dom, evt);
            var d = {
                x: downPosition.x - this.downPosition.x,
                y: downPosition.y - this.downPosition.y
            };
            this.offset.x += d.x;
            this.offset.y += d.y;
            this.downPosition = downPosition;
            if (this.parser.rootDom) {
                var domStyle = this.parser.rootDom.style;
                domStyle.left = parseInt(domStyle.left.replace('px', '')) + d.x + 'px';
                domStyle.top = parseInt(domStyle.top.replace('px', '')) + d.y + 'px';
            }
        },
        dragNode: function (evt) {
            var position = dragger.dragMove(evt);
            position.x = position.x / this.scale;
            position.y = position.y / this.scale;
            events.stopEvent(evt);
            var dataId = evt.dragInfo.src.getAttribute('data-id'); //evt.dragging.draggingElement.getAttribute('data-id');
            if (dataId) {
                this.parser.table[dataId].data.position = position;
                this.parser._render(dataId);
            }
        },
        createNode: function (parentId) {
            var parentData = this.parser.table[parentId].data;
            var width = (parentData.style.width || this.parser.rootLineWidth) - 2;
            width = width > 2 ? width : 2;

            this.tempData = {
                id: common.createId(),
                parentId: parentId,
                visible: true,
                title: this.defaultValue,
                position: {
                    x: 0,
                    y: 0
                },
                style: {
                    color: parentData.style.color || '#' + randomHex() + randomHex() + randomHex(),
                    width: width,
                    alpha: parentData.style.alpha || 1
                },
                children: [],
                visible: true
            };
        },
        dragPoint: function (evt) {
            if (!this.tempData) {
                this.creating = true;
                this.createNode(this.downDom.parentNode.getAttribute('data-id'));
            }
            var data = this.tempData;
            var dom = this.downDom.parentNode;
            var parentData = this.parser.table[dom.getAttribute('data-id')].data;
            var root = !parentData.parentId;
            var width = parseInt(dom.style.width.replace('px', ''));
            var height = parseInt(dom.style.height.replace('px', ''));
            var pdw = height + (parentData.style.width || this.parser.startOffset) / 2;
            var position = getMousePosition(dom, evt);
            var p1 = new Point(1, pdw);
            var p2 = new Point(width - 1, pdw);
            var p3 = new Point(position.x - 1, position.y);
            var p4 = new Point(position.x + 1, position.y);
            var points = nodeCurve.curveForDom(p1, p2, p3, p4, !parentData.parentId);
            this.tempCanvas = renderer.drawCurve({
                points: points,
                color: data.style.color,
                width: data.style.width,
                alpha: data.style.alpha
            }, this.tempCanvas);
            dom.appendChild(this.tempCanvas);
            this.pointDiv.style.left = position.x - 12 + 'px';
            this.pointDiv.style.top = position.y - 12 + 'px';
            data.position = {
                x: position.x - this.parser.width,
                y: position.y - this.parser.height
            };
        },
        //编辑器
        _editor: function () {
            if (!this.editor) {
                this.editor = new editor.SimpleEditor();
            }
            return this.editor;
        }
    });

});
