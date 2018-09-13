import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './Dagre.less';
import * as d3 from 'd3';
// import dagre from 'dagre';
// import graphlib from 'graphlib';
// import * as dagreD3 from 'dagre-d3';

/**
 * 拖拽
 */
class Dagre extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    console.log(d3);
    // console.log(dagreD3);
  }


  render() {

    return (
      <div id="container-trag">

      </div>
    );
  }

}

export default Dagre;
