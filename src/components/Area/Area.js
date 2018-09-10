import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
import './Area.less';
import * as D3 from 'D3';

/**
 * 面积图表
 */
class Area extends Component {

  constructor() {
    super();
    this.data = [3, 3, 5, 7, 9, 10, 22, 8, 34, 46];
    // http://bl.ocks.org/emmasaunders/c25a147970def2b02d8c7c2719dc7502
    this.interpolateTypes = [
      D3.curveLinear,
      D3.curveStepBefore,
      D3.curveStepAfter,
      D3.curveBasis,
      D3.curveBasisOpen,
      D3.curveBasisClosed,
      D3.curveBundle,
      D3.curveCardinal,
      D3.curveCardinal,
      D3.curveCardinalOpen,
      D3.curveCardinalClosed,
      D3.curveNatural
    ];
    this.style_svg = {
      width: 500,
      height: 250,
      margin: {top: 30, right: 20, bottom: 20, left: 50}
    }
    this.style_g = {
      width: this.style_svg.width - this.style_svg.margin.left - this.style_svg.margin.right,
      height: this.style_svg.height - this.style_svg.margin.top - this.style_svg.margin.bottom,
      transform: `translate(${this.style_svg.margin.left}, ${this.style_svg.margin.top})`
    }

    this.scale_x = D3.scaleLinear() // D3.scale.linear()
      .domain([0, this.data.length - 1]) // 输入范围
      .range([0, this.style_g.width]) // 输出范围

    this.scale_y = D3.scaleLinear()
      .domain([0, D3.max(this.data)]) // 输入范围
      // .range([0, this.style_g.height]) // 输出范围
      .range([this.style_g.height, 0]) // 输出范围

    this.area_generator = D3.area()
      .x((d, i) => {
        return this.scale_x(i)
      })
      .y0(this.style_g.height)
      .y1((d) => {
        return this.scale_y(d)
      })
      .curve(this.interpolateTypes[8]);

    this.axis_x = D3.axisBottom().scale(this.scale_x);
    this.axis_y = D3.axisLeft().scale(this.scale_y);

  }

  componentDidMount() {
    //add svg && set height width
    let svg = D3.select('#container-area')
      .append('svg')
      .attr('height', this.style_svg.height)
      .attr('width', this.style_svg.width)

    // add g
    let g = svg
      .append('g')
      .attr('transform', this.style_g.transform)

    g.append('path')
      .attr('d', this.area_generator(this.data))
      .style('fill', 'steelblue')

    g.append('g')
      .call(this.axis_x)
      .attr('transform', `translate(0, ${this.style_g.height})`)

    g.append('g')
      .call(this.axis_y)
  }

  render() {

    return (
      <div id="container-area">

      </div>
    );
  }

}

export default Area;
