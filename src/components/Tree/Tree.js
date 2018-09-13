import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
import './Tree.less';
import * as d3 from 'd3';

/**
 * Tree
 */
class Tree extends Component {

  constructor() {
    super();

    this.addNode = this.addNode.bind(this);
    this.addChildrenNode = this.addChildrenNode.bind(this);
  }

  componentDidMount() {
    this.tree()
  }

  tree() {
    var svgW = 558, svgH = 460, vRad = 18, tree = {cx: 300, cy: 30, w: 40, h: 70};
    tree.vis = {v: 0, l: '开始', p: {x: tree.cx, y: tree.cy}, c: []};
    tree.size = 1;
    tree.glabels = [];
    tree.incMatx = [];
    tree.incX = 500, tree.incY = 30, tree.incS = 20;

    tree.getVertices = function(){
      var v = [];

      function getVertices(t, f) {
        v.push({v: t.v, l: t.l, p: t.p, f: f});
        t.c.forEach(function (d) {
          return getVertices(d, {v: t.v, p: t.p});
        });
      }

      getVertices(tree.vis, {});
      return v.sort(function (a, b) {
        return a.v - b.v;
      });
    }

    tree.getEdges = function () {
      var e = [];

      function getEdges(_) {
        _.c.forEach(function (d) {
          e.push({v1: _.v, l1: _.l, p1: _.p, v2: d.v, l2: d.l, p2: d.p});
        });
        _.c.forEach(getEdges);
      }

      getEdges(tree.vis);
      return e.sort(function (a, b) {
        return a.v2 - b.v2;
      });
    }

    tree.addLeaf = function (_) {
      console.log(_);

      function addLeaf(t) {
        if (t.v == _) {
          t.c.push({v: tree.size++, l: '节点' + _, p: {}, c: []});
          return;
        }
        t.c.forEach(addLeaf);
      }

      addLeaf(tree.vis);
      reposition(tree.vis);
      if (tree.glabels.length != 0) {
        tree.glabels = []
        relabel(
          {
            lbl: d3.range(0, tree.size).map(function (d) {
              return '?';
            }),
            incMatx: d3.range(0, tree.size - 1).map(function () {
              return 0;
            })
          });
        d3.select('#labelnav').style('visibility', 'hidden');
      }
      else tree.incMatx = d3.range(0, tree.size - 1).map(function () {
        return 0;
      });
      redraw();
    }

    tree.gracefulLabels = function () {
      tree.glabels = [];
      let v = tree.getVertices();
      var vlbls = [], elbls = [];
      let gracefulLbl = function (c) {
        if (c == tree.size) {
          var lbl = {
            lbl: vlbls.map(function (_) {
              return _;
            })
          };
          relabel(lbl);
          updateIncMatx();
          var incMatx = tree.incMatx.map(function (_) {
            return _;
          });
          if ((tree.incMatx[0] & 2) >> 1 == 1 && tree.glabels.every(function (d) {
              return d.incMatx.toString() != incMatx.toString();
            })) {
            lbl.incMatx = incMatx;
            tree.glabels.push(lbl);
          }
          return;
        }
        d3.range(0, tree.size)
          .filter(function (d) {
            return (vlbls.indexOf(d) == -1) && (elbls.indexOf(Math.abs(vlbls[v[c].f.v] - d)) == -1);
          })
          .forEach(function (d) {
            vlbls[c] = d;
            elbls[c] = Math.abs(vlbls[v[c].f.v] - d);
            gracefulLbl(c + 1);
            delete vlbls[c];
            delete elbls[c];
          });
      }
      d3.range(0, tree.size).forEach(function (d) {
        vlbls = [d];
        elbls = [];
        gracefulLbl(1);
      });
      tree.showLabel(1);
      d3.select('#labelpos').text(tree.currLbl + '/' + tree.glabels.length);
      d3.select('#labelnav').style('visibility', 'visible');
    }

    let updateIncMatx = function () {
      var n = tree.size - 1;
      tree.incMatx = d3.range(0, tree.size - 1).map(function () {
        return 0;
      });
      let updateIncMatxl = function (t) {
        t.c.forEach(function (c) {
          t.l < c.l ? tree.incMatx[t.l] = tree.incMatx[t.l] | (1 << (n - c.l)) : tree.incMatx[c.l] = tree.incMatx[c.l] | (1 << (n - t.l));
          updateIncMatxl(c);
        });
      }
      updateIncMatxl(tree.vis);
    }

    let getIncMatxRow = function (i) {
      return d3.range(0, tree.size - 1 - i).map(function (d, j) {
        var n = tree.size - 2 - i - j;
        return (tree.incMatx[i] & 1 << n) >> n;
      });
    }

    tree.showLabel = function (i) {
      if (i > tree.glabels.length || i < 1) {
        alert('invalid label position');
        return;
      }

      relabel(tree.glabels[i - 1]);
      redraw();
      tree.currLbl = i;
      d3.select('#labelpos').text(tree.currLbl + '/' + tree.glabels.length);
    }

    let relabel = function (lbl) {
      function relbl(t) {
        t.l = lbl.lbl[t.v];
        t.c.forEach(relbl);
      }

      relbl(tree.vis);
      tree.incMatx = lbl.incMatx;
    }

    let redraw = function () {
      var edges = d3.select('#g_lines').selectAll('line').data(tree.getEdges());

      edges.transition().duration(500)
        .attr('x1', function (d) {
          return d.p1.x;
        }).attr('y1', function (d) {
        return d.p1.y;
      })
        .attr('x2', function (d) {
          return d.p2.x;
        }).attr('y2', function (d) {
        return d.p2.y;
      })

      edges.enter().append('line')
        .attr('x1', function (d) {
          return d.p1.x;
        }).attr('y1', function (d) {
        return d.p1.y;
      })
        .attr('x2', function (d) {
          return d.p1.x;
        }).attr('y2', function (d) {
        return d.p1.y;
      })
        .transition().duration(500)
        .attr('x2', function (d) {
          return d.p2.x;
        }).attr('y2', function (d) {
        return d.p2.y;
      });

      var circles = d3.select('#g_circles').selectAll('circle').data(tree.getVertices());

      circles.transition().duration(500).attr('cx', function (d) {
        return d.p.x;
      }).attr('cy', function (d) {
        return d.p.y;
      });

      circles.enter().append('circle').attr('cx', function (d) {
        return d.f.p.x;
      }).attr('cy', function (d) {
        return d.f.p.y;
      }).attr('r', vRad)
        .on('click', function (d) {
          return tree.addLeaf(d.v);
        })
        .transition().duration(500).attr('cx', function (d) {
        return d.p.x;
      }).attr('cy', function (d) {
        return d.p.y;
      });

      var labels = d3.select('#g_labels').selectAll('text').data(tree.getVertices());

      labels.text(function (d) {
        return d.l;
      }).transition().duration(500)
        .attr('x', function (d) {
          return d.p.x;
        }).attr('y', function (d) {
        return d.p.y + 5;
      });

      labels.enter().append('text').attr('x', function (d) {
        return d.f.p.x;
      }).attr('y', function (d) {
        return d.f.p.y + 5;
      })
        .text(function (d) {
          return d.l;
        }).on('click', function (d) {
        return tree.addLeaf(d.v);
      })
        .transition().duration(500)
        .attr('x', function (d) {
          return d.p.x;
        }).attr('y', function (d) {
        return d.p.y + 5;
      });

      var elabels = d3.select('#g_elabels').selectAll('text').data(tree.getEdges());

      elabels
        .attr('x', function (d) {
          return (d.p1.x + d.p2.x) / 2 + (d.p1.x < d.p2.x ? 8 : -8);
        }).attr('y', function (d) {
        return (d.p1.y + d.p2.y) / 2;
      })
        .text(function (d) {
          return tree.glabels.length == 0 ? '' : Math.abs(d.l1 - d.l2);
        });

      elabels.enter().append('text')
        .attr('x', function (d) {
          return (d.p1.x + d.p2.x) / 2 + (d.p1.x < d.p2.x ? 8 : -8);
        }).attr('y', function (d) {
        return (d.p1.y + d.p2.y) / 2;
      })
        .text(function (d) {
          return tree.glabels.length == 0 ? '' : Math.abs(d.l1 - d.l2);
        });


      d3.select('#incMatx').selectAll('.incrow').data(tree.incMatx)
        .enter().append('g').attr('class', 'incrow');

      d3.select('#incMatx').selectAll('.incrow').selectAll('.incRect')
        .data(function (d, i) {
          return getIncMatxRow(i).map(function (v, j) {
            return {y: i, x: j, f: v};
          })
        })
        .enter().append('rect').attr('class', 'incRect');

      d3.select('#incMatx').selectAll('.incRect')
        .attr('x', function (d, i) {
          return (d.x + d.y) * tree.incS;
        }).attr('y', function (d, i) {
        return d.y * tree.incS;
      })
        .attr('width', function () {
          return tree.incS;
        }).attr('height', function () {
        return tree.incS;
      })
        .attr('fill', function (d) {
          return d.f == 1 ? 'black' : 'white'
        });

      d3.select('#incMatx').selectAll('.incrowlabel').data(d3.range(0, tree.size)).enter()
        .append('text').attr('class', 'incrowlabel');

      d3.select('#incMatx').selectAll('.incrowlabel').text(function (d) {
        return d;
      })
        .attr('x', function (d, i) {
          return (i - 0.5) * tree.incS
        }).attr('y', function (d, i) {
        return (i + 0.8) * tree.incS
      });
    }



    let getLeafCount = function (_) {
      if (_.c.length == 0) return 1;
      else return _.c.map(getLeafCount).reduce(function (a, b) {
        return a + b;
      });
    }

    let reposition = function (v) {
      var lC = getLeafCount(v), left = v.p.x - tree.w * (lC - 1) / 2;
      v.c.forEach(function (d) {
        var w = tree.w * getLeafCount(d);
        left += w;
        d.p = {x: left - (w + tree.w) / 2, y: v.p.y + tree.h};
        reposition(d);
      });
    }


    // 初始化 树
    let initialize = function () {

      d3.select('#navdiv').append('button').attr('type', 'button').text('Generate labels')
        .on('click', function (d) {
          return tree.gracefulLabels();
        });

      d3.select('#navdiv').append('nav').attr('id', 'labelnav').style('display', 'inline-block').style('visibility', 'hidden');

      d3.select('#labelnav').append('button').attr('type', 'button').text('<').attr('id', 'prevlabel')
        .on('click', function (d) {
          return tree.showLabel(tree.currLbl == 1 ? tree.glabels.length : tree.currLbl - 1);
        });

      d3.select('#labelnav').append('text').text('').attr('id', 'labelpos');

      d3.select('#labelnav').append('button').attr('type', 'button').text('>').attr('id', 'nextlabel')
        .on('click', function () {
          return tree.showLabel(tree.currLbl == tree.glabels.length ? 1 : tree.currLbl + 1);
        });

      d3.select('#treediv')
        .append('svg')
        .attr('width', svgW)
        .attr('height', svgH)
        .attr('id', 'treesvg');

      d3.select('#treesvg')
        .append('g')
        .attr('id', 'g_lines')
        .selectAll('line')
        .data(tree.getEdges())
        .enter().append('line')
        .attr('x1', function (d) {
          return d.p1.x;
        })
        .attr('y1', function (d) {
          return d.p1.y;
        })
        .attr('x2', function (d) {
          return d.p2.x;
        })
        .attr('y2', function (d) {
          return d.p2.y;
        });

      d3.select('#treesvg')
        .append('g')
        .attr('id', 'g_circles')
        .selectAll('circle')
        .data(tree.getVertices())
        .enter()
        .append('circle')
        .attr('cx', function (d) {
          return d.p.x;
        })
        .attr('cy', function (d) {
          return d.p.y;
        })
        .attr('r', vRad)
        .on('click', function (d) {
          return tree.addLeaf(d.v);
        });

      d3.select('#treesvg')
        .append('g')
        .attr('id', 'g_labels')
        .selectAll('text')
        .data(tree.getVertices())
        .enter().append('text')
        .attr('x', function (d) {
          return d.p.x;
        })
        .attr('y', function (d) {
          return d.p.y + 5;
        })
        .text(function (d) {
          return d.l;
        })
        .on('click', function (d) {
          return tree.addLeaf(d.v);
        });

      d3.select('#treesvg')
        .append('g')
        .attr('id', 'g_elabels')
        .selectAll('text')
        .data(tree.getEdges())
        .enter()
        .append('text')
        .attr('x', function (d) {
          return (d.p1.x + d.p2.x) / 2 + (d.p1.x < d.p2.x ? 8 : -8);
        })
        .attr('y', function (d) {
          return (d.p1.y + d.p2.y) / 2;
        })
        .text(function (d) {
          return tree.glabels.length == 0 ? '' : Math.abs(d.l1 - d.l2);
        });

      // d3.select("body").select("svg").append('g').attr('transform',function(){ return 'translate('+tree.incX+','+tree.incY+')';})
      // 	.attr('id','incMatx').selectAll('.incrow')
      // 	.data(tree.incMatx.map(function(d,i){ return {i:i, r:d};})).enter().append('g').attr('class','incrow');

      // d3.select("#incMatx").selectAll('.incrowlabel').data(d3.range(0,tree.size)).enter()
      // 	.append('text').attr('class','incrowlabel').text(function(d){ return d;})
      // 	.attr('x',function(d,i){ return (i-0.5)*tree.incS}).attr('y',function(d,i){ return (i+.8)*tree.incS});


      // 默认初始化节点个数
      // tree.addLeaf(0);
      // tree.addLeaf(10);
      // tree.addLeaf(0);
      // tree.addLeaf(0);
    }
    initialize();

    return tree;
  }

  addNode() {
    console.log(1)
  }

  addChildrenNode() {
    console.log(2)
  }

  initialize() {
    // console.log('initialize tree')
    // D3.select('#navdiv')
    //   .append('button')
    //   .attr('type', 'button')
    //   .text('Generate labels')
    //   .on('click', () => {
    //     return this.gracefulLabels();
    //   });
  }

  render() {
    return (
      <div id="container-tree">
        <div>
          <ul className="control-list">
            <li className="control">
              <button title="add" data-id="1001" onClick={this.addNode}>
                <i className="add"/>
              </button>
            </li>
            <li className="control">
              <button title="add-children" data-id="1002" onClick={this.addChildrenNode}>
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

        <div id="navdiv">

        </div>
        <div id="treediv">

        </div>
      </div>
    );
  }

}

export default Tree;