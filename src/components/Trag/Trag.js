import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
import './Trag.less';
import * as D3 from 'd3';

/**
 * 拖拽
 */
class Trag extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    // 绘制圆
    let circles = [
      {cx: 150, cy: 200, r: 30},
      {cx: 250, cy: 200, r: 30}
    ];

    let svg = D3.select('#container-trag')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    // 拖拽
    let drag = D3.drag()
      .on('drag', this.dragmove);

    svg.selectAll('circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return d.cx;
      })
      .attr('cy', function (d) {
        return d.cy;
      })
      .attr('r', function (d) {
        return d.r;
      })
      .attr('stroke', 'black')
      .attr('stroke-width', '2px')
      .attr('fill', '#fff')
      .attr('fill-opacity', .95)
      .style('cursor', 'pointer')
      .call(drag).append('text').text('开始');  //这里是刚才定义的drag行为

  }

  // 拖拽
  dragmove(d) {
    D3.event.sourceEvent.stopPropagation(); // silence other listeners
    D3.select(this)
      .attr('cx', d.cx = D3.event.x)
      .attr('cy', d.cy = D3.event.y)
  }


  render() {

    return (
      <div id="container-trag">

      </div>
    );
  }

}

export default Trag;
