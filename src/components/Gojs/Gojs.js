import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './Gojs.less';
import go from 'Gojs';
import FlowChartDesigner from './FlowChartDesigner'

class Gojs extends Component {

  constructor() {
    super();
    this.myDiagram = 'myDiagramDiv';
    this.state = {
      data: {
        'class': 'go.GraphLinksModel',
        'modelData': {'position': '-5 -5'},
        'nodeDataArray': [
          {'key': '1', 'text': '开始', 'figure': 'Circle', 'fill': '#4fba4f', 'stepType': 1, 'loc': '90 110'},
          {'key': '2', 'text': '结束', 'figure': 'Circle', 'fill': '#CE0620', 'stepType': 4, 'loc': '770 110'},
          {'key': '3', 'text': '填写请假信息 ', 'loc': '210 110', 'remark': ''},
          {'key': '4', 'text': '部门经理审核 ', 'loc': '370 110', 'remark': ''},
          {'key': '5', 'text': '人事审核  ', 'loc': '640 110', 'remark': ''},
          {'key': '6', 'text': '副总经理审核  ', 'loc': '510 40', 'remark': ''},
          {'key': '7', 'text': '总经理审核  ', 'loc': '500 180', 'remark': ''}
        ],
        'linkDataArray': [
          {'from': '1', 'to': '3'},
          {'from': '3', 'to': '4'},
          {'from': '4', 'to': '5'},
          {'from': '5', 'to': '2'},
          {'from': '4', 'to': '6', 'key': '1001', 'text': '小于5天 ', 'remark': '', 'condition': 'Days<5'},
          {'from': '6', 'to': '5'},
          {'from': '4', 'to': '7', 'key': '1002', 'text': '大于5天 ', 'remark': '', 'condition': 'Days>5'},
          {'from': '7', 'to': '5'}
        ]
      }
    }
  }

  componentDidMount() {
    // 流程图设计器
    FlowChartDesigner.init('myDiagramDiv');
    FlowChartDesigner.initToolbar('myPaletteDiv');
    FlowChartDesigner.displayFlow(this.state.data);// 在设计面板中显示流程图
  }

  doCreateStep() {
    if (!FlowChartDesigner) return;

    FlowChartDesigner.createStep();
  }

  saveDesigner() {
    let data = FlowChartDesigner.getFlowData();
    this.setState({
      data:data
    })
  }

  handleChange(event){
    this.setState({
      data: event.target.value
    })
  }

  render() {
    console.warn('GOJS')
    let json = JSON.stringify(this.state.data)
    return (
      <div id="go-js">
        <button onClick={this.doCreateStep.bind(this)}>新建步骤</button>
        <button onClick={this.saveDesigner.bind(this)}>保存步骤</button>
        <div id="myPaletteDiv" className="my-palette-div"></div>
        <div id="myDiagramDiv" className="my-diagram-div"></div>
        <textarea
          onChange={this.handleChange.bind(this)}
          name="mySavedModel"
          id="mySavedModel"
          cols="120"
          rows="10"
          value={json}
          disabled
        >
        </textarea>
      </div>
    );
  }

}

export default Gojs;
