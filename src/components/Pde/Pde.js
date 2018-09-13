import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
import './Pde.less';
import * as  D3 from 'd3';

import Node from '../../common/Node/Node'

/**
 * 拖拽
 */
class Pde extends Component {

  constructor() {
    super();
    // 绘制圆
    this.circles = [
      {cx: 200, cy: 100, r: 18}
    ];

    //svg
    this.svg = null

    this.dx = 0;
    this.dy = 0;
    this.dragElem = null;

    this.addNode = this.addNode.bind(this);

    this.state = {}
  }

  componentDidMount() {

    this.svg = D3.select('#hb-bpmn')
      .append('g')
      .attr('class', 'viewport');

    let circle = this.svg.selectAll('circle')
      .data(this.circles)
      .enter()
      .append('circle')
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', function (d) {
        return d.r;
      })
      .attr('stroke', 'black')
      .attr('stroke-width', '2px')
      .attr('fill', '#fff')
      .attr('fill-opacity', .95)
      .attr('class', 'zz zb')
      .classed('zz', false)
      .classed('zb', true)
      .style('cursor', 'pointer')
      .call(
        D3.drag()
          .on('drag', this.dragMove)
      )
  }

  // 拖拽
  dragMove(d) {
    D3.event.sourceEvent.stopPropagation(); // silence other listeners
    D3.select(this)
      .attr('cx', d.cx = D3.event.x)
      .attr('cy', d.cy = D3.event.y)
  }


  // 添加节点
  addNode(e) {

    if (e === undefined) return;

    const el = e && e.currentTarget;

    let node = {
      id: new Date().getTime(),
      dataId: D3.select(el).attr('data-id'),
      text: D3.select(el).attr('title'),
      x: 155,
      y: (170 * D3.selectAll('.node').size()) + 170 //自动布局
    };

    // console.log();
    let g = this.svg.append('g')
      // .data(node)
      .attr('class', 'node')
      .attr('data-id', node.dataId)
      .attr('id', node.id)
      // .attr('x', d => d.x)
      // .attr('y', d => d.y)
      .attr('transform', 'translate(' + node.x + ', ' + node.y + ')')
      .call(
        D3.drag()
          .on('start', this.dragStarted)
          .on('drag', this.dragGed)
          .on('end', this.dragEnded)
      );

    let rect = g.append('rect')
      .attr('width', 100)
      .attr('height', 80)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .attr('fill-opacity', .95)
      .attr('fill', '#fff');

    let bound = rect.node().getBoundingClientRect();
    let width = bound.width;
    let height = bound.height;

    // text
    g.append('text')
      .text(node.text)
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle') // 水平居中


    return g;
  }

  addChildrenNode(e) {

  }

  dragStarted() {
    let transform = D3.select(this).attr('transform');
    let [x, y] = transform.substring(transform.indexOf('(') + 1, transform.indexOf(')')).split(',')
    // let translate = this.getTranslate(transform);
    this.dx = D3.event.x - parseInt(x);
    this.dy = D3.event.y - parseInt(y);
    this.dragElem = D3.select(this);
  }

  dragGed() {
    this.dragElem.attr('transform', 'translate(' + (D3.event.x - this.dx) + ', ' + (D3.event.y - this.dy) + ')');
    this.updateCable(this.dragElem);
  }

  dragEnded() {
    this.dx = this.dy = 0;
    this.dragElem = null;
  }

  getTranslate(transform) {
    let arr = transform.substring(transform.indexOf('(') + 1, transform.indexOf(')')).split(',');
    return [+arr[0], +arr[1]];
  }

  updateCable(elem) {
    let bound = elem.node().getBoundingClientRect();
    let width = bound.width;
    let height = bound.height;
    let id = elem.attr('id');
    let transform = elem.attr('transform');
    let t1 = this.getTranslate(transform);


    // 更新输出线的位置
    D3.selectAll('path[from="' + id + '"]')
      .each(function () {
        var start = D3.select(this).attr('start').split(',');
        start[0] = +start[0] + t1[0];
        start[1] = +start[1] + t1[1];

        var path = D3.select(this).attr('d');
        var end = path.substring(path.lastIndexOf(' ') + 1).split(',');
        end[0] = +end[0];
        end[1] = +end[1];

        D3.select(this).attr('d', function () {
          return 'M' + start[0] + ',' + start[1]
            + ' C' + start[0] + ',' + (start[1] + end[1]) / 2
            + ' ' + end[0] + ',' + (start[1] + end[1]) / 2
            + ' ' + end[0] + ',' + end[1];
        });
      });

    // 更新输入线的位置
    D3.selectAll('path[to="' + id + '"]')
      .each(function () {
        var path = D3.select(this).attr('d');
        var start = path.substring(1, path.indexOf('C')).split(',');
        start[0] = +start[0];
        start[1] = +start[1];

        var end = D3.select(this).attr('end').split(',');
        end[0] = +end[0] + t1[0];
        end[1] = +end[1] + t1[1];

        D3.select(this).attr('d', function () {
          return 'M' + start[0] + ',' + start[1]
            + ' C' + start[0] + ',' + (start[1] + end[1]) / 2
            + ' ' + end[0] + ',' + (start[1] + end[1]) / 2
            + ' ' + end[0] + ',' + end[1];
        });
      });

  }


  render() {

    return (
      <div id="container-pde">
        <div>
          <ul className="control-list">
            <li className="control">
              <button title="add" data-id="1001" onClick={this.addNode}>
                <i className="add"/>
              </button>
            </li>
            <li className="control">
              <button title="add-children" data-id="1002" onClick={this.addChildrenNode.bind(this)}>
                <i className="copy"/>
              </button>
            </li>
            <li className="control">
              <button title="addChild">
                <i className="addChild"/>
              </button>
            </li>
            <li className="control">
              <button title="addBq">
                <i className="addBq"/>
              </button>
            </li>
            <li className="control">
              <button title="save">
                <i className="save"/>
              </button>
            </li>
            <li className="control">
              <button title="undo">
                <i className="undo"/>
              </button>
            </li>
            <li className="control ">
              <button title="redo">
                <i className="redo"/>
              </button>
            </li>
            <li className="control ">
              <button title="delete">
                <i className="delete"/>
              </button>
            </li>
            <li className="control">
              <button title="zoom in">
                <i className="zoomIn"/>
              </button>
            </li>
            <li className="control ">
              <button title="zoom out">
                <i className="zoomOut"/>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <svg id="hb-bpmn" width="100%" height="100%">

          </svg>
        </div>
      </div>
    );
  }

}

export default Pde;
