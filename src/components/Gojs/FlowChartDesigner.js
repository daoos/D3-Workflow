import go from 'Gojs';

class FlowChartDesigner {

  constructor() {
    this.G = go.GraphObject.make;
    this._designer = {};
    this._jsonNewStep = {key: this.guid(), text: '新步骤', remark: ''};
    this.onDiagramModified = this.onDiagramModified.bind(this);
    this.onObjectDoubleClicked = this.onObjectDoubleClicked.bind(this);
    this.setLinkTextBg = this.setLinkTextBg.bind(this);
  }

  /**
   * 初始化流程设计器
   * @param divId 设计器Div
   */
  init(divId) {
    const _self = this;
    this._designer = this.G(go.Diagram, divId, // must name or refer to the DIV HTML element
      {
        grid: this.G(go.Panel, 'Grid',
          this.G(go.Shape, 'LineH', {stroke: 'lightgray', strokeWidth: 0.5}),
          this.G(go.Shape, 'LineH', {stroke: 'gray', strokeWidth: 0.5, interval: 10}),
          this.G(go.Shape, 'LineV', {stroke: 'lightgray', strokeWidth: 0.5}),
          this.G(go.Shape, 'LineV', {stroke: 'gray', strokeWidth: 0.5, interval: 10})
        ),
        allowDrop: true, // must be true to accept drops from the Palette
        allowTextEdit: false,
        allowHorizontalScroll: false,
        allowVerticalScroll: false,
        'clickCreatingTool.archetypeNodeData': this._jsonNewStep, // 双击创建新步骤
        'draggingTool.dragsLink': true,
        'draggingTool.isGridSnapEnabled': true,
        'linkingTool.isUnconnectedLinkValid': true,
        'linkingTool.portGravity': 20,
        'relinkingTool.isUnconnectedLinkValid': true,
        'relinkingTool.portGravity': 20,
        'relinkingTool.fromHandleArchetype':
          this.G(go.Shape, 'Diamond', {
            segmentIndex: 0,
            cursor: 'pointer',
            desiredSize: new go.Size(8, 8),
            fill: 'tomato',
            stroke: 'darkred'
          }),
        'relinkingTool.toHandleArchetype':
          this.G(go.Shape, 'Diamond', {
            segmentIndex: -1,
            cursor: 'pointer',
            desiredSize: new go.Size(8, 8),
            fill: 'darkred',
            stroke: 'tomato'
          }),
        'linkReshapingTool.handleArchetype':
          this.G(go.Shape, 'Diamond', {desiredSize: new go.Size(7, 7), fill: 'lightblue', stroke: 'deepskyblue'}),
        'undoManager.isEnabled': true
      });

    // 流程图如果有变动，则提示用户保存
    this._designer.addDiagramListener('Modified', this.onDiagramModified);

    // 双击事件
    this._designer.addDiagramListener('ObjectDoubleClicked', this.onObjectDoubleClicked);

    // 流程步骤的样式模板
    this._designer.nodeTemplate = this.makeNodeTemplate();

    // 流程连接线的样式模板
    this._designer.linkTemplate = this.makeLinkTemplate();

  }

  /**
   * 初始化图例面板
   * @returns {*}
   */
  initToolbar(div) {
    return this.G(go.Palette, div, // 必须是DIV元素
      {
        maxSelectionCount: 3,
        nodeTemplateMap: this._designer.nodeTemplateMap, // 跟设计图共同一套样式模板
        model: new go.GraphLinksModel([
          {key: this.guid(), text: '开始', figure: 'Circle', fill: '#4fba4f', stepType: 1},
          this._jsonNewStep,
          {key: this.guid(), text: '结束', figure: 'Circle', fill: '#CE0620', stepType: 4}
        ])
      });

  }

  /**
   * 创建新步骤
   */
  createStep() {
    let jsonNewStep = {key: this._jsonNewStep.key, text: this._jsonNewStep.text};
    jsonNewStep.loc = '270 140';// “新步骤”显示的位置
    console.log(this._designer.model, this._designer);
    this._designer.model.addNodeData(jsonNewStep);
  }

  /**
   * 获取流程图数据
   * @returns {*}
   */
  getFlowData() {
    this._designer.model.modelData.position = go.Point.stringify(this._designer.position);
    return this._designer.model.toJson();
  };

  /**
   * 在设计面板中显示流程图
   * @param flowData  流程图json数据
   */
  displayFlow(flowData) {

    if (!flowData) return;

    this._designer.model = go.Model.fromJson(flowData);

    let pos = this._designer.model.modelData.position;
    if (pos) this._designer.initialPosition = go.Point.parse(pos);

    // 更改所有连线中间的文本背景色
    this.setLinkTextBg();
  }

  /**
   * 生成GUID
   * @returns {string}
   */
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 步骤图的样式模板
   * @returns {*}
   */
  makeNodeTemplate() {
    const _self = this;
    return this.G(go.Node, 'Spot',
      {locationSpot: go.Spot.Center},
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      {selectable: true, selectionAdornmentTemplate: this.makeNodeSelectionAdornmentTemplate()},
      new go.Binding('angle').makeTwoWay(),
      // the main object is a Panel that surrounds a TextBlock with a Shape
      this.G(go.Panel, 'Auto',
        {name: 'PANEL'},
        new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        this.G(go.Shape, 'RoundedRectangle', // default figure
          {
            portId: '', // the default port: if no spot on link data, use closest side
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            fill: '#7e7e7f', // 默认背景色
            strokeWidth: 1,
            stroke: '#DDDDDD'
          },
          new go.Binding('figure'),
          new go.Binding('fill')),
        this.G(go.TextBlock,
          {
            font: 'bold 11pt Helvetica, Arial, sans-serif',
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true,
            stroke: 'white'
          },
          new go.Binding('text').makeTwoWay()), // the label shows the node data's text
        {
          toolTip:// this tooltip Adornment is shared by all nodes
            this.G(go.Adornment, 'Auto',
              this.G(go.Shape, {fill: '#FFFFCC'}),
              this.G(go.TextBlock, {margin: 4}, // the tooltip shows the result of calling nodeInfo(data)
                new go.Binding('text', '', this.nodeInfo))
            ),
          // 绑定上下文菜单
          contextMenu: this.makePartContextMenu()
        }
      ),
      // 4个连接点
      this.makeNodePort('T', go.Spot.Top, false, true),
      this.makeNodePort('L', go.Spot.Left, true, true),
      this.makeNodePort('R', go.Spot.Right, true, true),
      this.makeNodePort('B', go.Spot.Bottom, true, false),
      {
        mouseEnter: function (e, node) {
          _self.showNodePort(node, true);
        },
        mouseLeave: function (e, node) {
          _self.showNodePort(node, false);
        }
      }
    );
  }

  /**
   * 选中节点的样式
   * @returns {*}
   */
  makeNodeSelectionAdornmentTemplate() {
    return this.G(go.Adornment, 'Auto',
      this.G(go.Shape, {fill: null, stroke: 'deepskyblue', strokeWidth: 1.5, strokeDashArray: [4, 2]}),
      this.G(go.Placeholder)
    );
  }

  /**
   * 创建连接点
   * @param name
   * @param spot
   * @param output
   * @param input
   * @returns {*}
   */
  makeNodePort(name, spot, output, input) {
    // the port is basically just a small transparent square
    return this.G(go.Shape, 'Circle',
      {
        fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
        stroke: null,
        desiredSize: new go.Size(7, 7),
        alignment: spot, // align the port on the main Shape
        alignmentFocus: spot, // just inside the Shape
        portId: name, // declare this object to be a "port"
        fromSpot: spot,
        toSpot: spot, // declare where links may connect at this port
        fromLinkable: output,
        toLinkable: input, // declare whether the user may draw links to/from here
        cursor: 'pointer' // show a different cursor to indicate potential link point
      });
  };

  /**
   * 定义连接线的样式模板
   * @returns {*}
   */
  makeLinkTemplate() {
    return this.G(go.Link, // the whole link panel
      {selectable: true, selectionAdornmentTemplate: this.makeLinkSelectionAdornmentTemplate()},
      {relinkableFrom: true, relinkableTo: true, reshapable: true},
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5,
        toShortLength: 4
      },
      this.G(go.Shape, // 线条
        {stroke: 'black'}),
      this.G(go.Shape, // 箭头
        {toArrow: 'standard', stroke: null}),
      this.G(go.Panel, 'Auto',
        this.G(go.Shape, // 标签背景色
          {
            fill: null,
            stroke: null
          }, new go.Binding('fill', 'pFill')),
        this.G(go.TextBlock, // 标签文本
          {
            textAlign: 'center',
            font: '10pt helvetica, arial, sans-serif',
            stroke: '#555555',
            margin: 4
          },
          new go.Binding('text', 'text')), // the label shows the node data's text
        {
          toolTip:// this tooltip Adornment is shared by all nodes
            this.G(go.Adornment, 'Auto',
              this.G(go.Shape, {fill: '#FFFFCC'}),
              this.G(go.TextBlock, {margin: 4}, // the tooltip shows the result of calling nodeInfo(data)
                new go.Binding('text', '', this.nodeInfo))
            ),
          // this context menu Adornment is shared by all nodes
          contextMenu: this.makePartContextMenu()
        }
      )
    );
  };

  /**
   * tooltip上显示的信息
   * @param d
   * @returns {string}
   */
  nodeInfo(d) {
    return '双击或单击右键可编辑';
  }

  /**
   * 右键菜单
   * @returns {*}
   */
  makePartContextMenu() {
    const _self = this;
    return this.G(go.Adornment, 'Vertical',
      this.makeMenuItem('编辑',
        function (e, obj) { // OBJ is this Button
          let contextmenu = obj.part; // the Button is in the context menu Adornment
          let part = contextmenu.adornedPart; // the adornedPart is the Part that the context menu adorns
          // now can do something with PART, or with its data, or with the Adornment (the context menu)
          _self.showEditNode(part);
        }),
      this.makeMenuItem('剪切',
        function (e, obj) {
          e.diagram.commandHandler.cutSelection();
        },
        function (o) {
          return o.diagram.commandHandler.canCutSelection();
        }),
      this.makeMenuItem('复制',
        function (e, obj) {
          e.diagram.commandHandler.copySelection();
        },
        function (o) {
          return o.diagram.commandHandler.canCopySelection();
        }),
      this.makeMenuItem('删除',
        function (e, obj) {
          e.diagram.commandHandler.deleteSelection();
        },
        function (o) {
          return o.diagram.commandHandler.canDeleteSelection();
        })
    );
  };

  /**
   * 生成右键菜单项
   * @param text
   * @param action
   * @param visiblePredicate
   * @returns {*}
   */
  makeMenuItem(text, action, visiblePredicate) {
    return this.G('ContextMenuButton',
      this.G(go.TextBlock, text, {
        margin: 5,
        textAlign: 'left',
        stroke: '#555555'
      }),
      {click: action},
      // don't bother with binding GraphObject.visible if there's no predicate
      visiblePredicate ? new go.Binding('visible', '', visiblePredicate).ofObject() : {});
  }

  /**
   * 连接线的选中样式
   * @returns {*}
   */
  makeLinkSelectionAdornmentTemplate() {
    return this.G(go.Adornment, 'Link',
      this.G(go.Shape,
        // isPanelMain declares that this Shape shares the Link.geometry
        {isPanelMain: true, fill: null, stroke: 'deepskyblue', strokeWidth: 0}) // use selection object's strokeWidth
    );
  }

  /**
   * 流程图元素的双击事件
   * @param ev
   */
  onObjectDoubleClicked(ev) {
    let part = ev.subject.part;
    this.showEditNode(part);
  }

  /**
   * 流程图如果有变动，则提示用户保存
   * @param e
   */
  onDiagramModified(e) {
    let button = document.getElementById('btnSaveFlow');
    if (button) button.disabled = !this._designer.isModified;
    let idx = document.title.indexOf('*');
    if (this._designer.isModified) {
      if (idx < 0) document.title += '*';
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  }

  /**
   * 是否显示步骤的连接点
   * @param node
   * @param show
   */
  showNodePort(node, show) {
    node.ports.each(function (port) {
      if (port.portId !== '') { // don't change the default port, which is the big shape
        port.fill = show ? 'rgba(255,0,0,.5)' : null;
      }
    });
  }

  /**
   * 编辑节点信息
   */
  showEditNode(node) {
    if ((node instanceof go.Node) && node.data.figure === 'Circle') {
      alert('开始和结束步骤不可编辑~');
      return;
    }

    alert('编辑步骤');
    // layer.prompt({
    //   formType: 3,
    //   value: node.data.text,
    //   title: '编辑步骤'
    // }, function(value, index, elem){
    //   updateNodeData(node,value);
    //   layer.close(index);
    // });
  }

  /**
   * 更改所有连线中间的文本背景色
   */
  setLinkTextBg() {
    this._designer.links.each(link => {
      this._designer.startTransaction('vacate');
      if (link.data.text) {
        this._designer.model.setDataProperty(link.data, 'pFill', window.go.GraphObject.make(go.Brush, 'Radial', {
          0: 'rgb(240, 240, 240)',
          0.3: 'rgb(240, 240, 240)',
          1: 'rgba(240, 240, 240, 0)'
        }));
      }
      this._designer.commitTransaction('vacate');
    });
  }
}

export default new FlowChartDesigner();
