import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './Gojs.less';
import go from 'Gojs';
import FlowChartDesigner from './FlowChartDesigner'

class Gojs extends Component {

  constructor() {
    super();
    this.myDiagram = 'myDiagramDiv';
  }

  componentDidMount() {
    // 流程图设计器
    FlowChartDesigner.init('myDiagramDiv');
    FlowChartDesigner.initToolbar('myPaletteDiv');
    // FlowChartDesigner.displayFlow(document.getElementById('mySavedModel'));// 在设计面板中显示流程图
  }


  render() {
    console.warn('GOJS')
    return (
      <div id="go-js">
        <div id="myPaletteDiv" className="my-palette-div"></div>
        <div id="myDiagramDiv" className="my-diagram-div"></div>
        <div id="mySavedModel" ></div>
      </div>
    );
  }

}

export default Gojs;
