import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
import './Bar.less';
import * as D3 from 'D3';
// import string from '../../data/a.dsv'
/**
 * 面积图表
 */
class Area extends Component {

  constructor() {
    super();
    // var data = d3.csvParseRows(string, function(d, i) {
    //   return {
    //     year: new Date(+d[0], 0, 1), // convert first colum column to Date
    //     make: d[1],
    //     model: d[2],
    //     length: +d[3] // convert fourth column to number
    //   };
    // });
    // console.log(string)
    this.data = [3, 3, 5, 7, 9, 10, 22, 8, 34, 46];
    this.style_bar = {
      height: 50,
      padding: 10,
    };
    this.style_svg = {
      width: 500,
      height: (this.style_bar.height + this.style_bar.padding) * this.data.length,
    }

    // 缩放函数
    this.scale = D3.scaleLinear() // D3.scale.linear()
      .domain([0, D3.max(this.data)]) // 输入范围
      .range([0, this.style_svg.width]) // 输出范围
  }

  componentDidMount() {
    //add svg && set height width
    let svg = D3.select('#container-bar')
      .append('svg')
      .attr('height', this.style_svg.height)
      .attr('width', this.style_svg.width)

    let bar = svg.selectAll('g')
      .data(this.data)
      .enter()
      .append('g')
      .attr('transform', (d,i)=>{;return "translate(0, " + i*(this.style_bar.height + this.style_bar.padding) + ")";})

    bar.append('rect')
      .attr(
        'width', d => this.scale(d),
       )
      .attr(
        'height', this.style_bar.height
      )
      .style('fill', 'steelblue')

    bar.append('text')
      .text(d => d)
      .attr('x', d => this.scale(d))
      .attr('y', this.style_bar.height / 2 )
      .attr('text-anchor', 'end' )
  }

  render() {

    return (
      <div id="container-bar">

      </div>
    );
  }

}

export default Area;
