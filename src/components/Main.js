require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
// import Line from './Line/Line';
// import Area from './Area/Area';
// import Workflow from './Workflow/Workflow';
// import Bar from './Bar/Bar';
// import Trag from './Trag/Trag';
// import Dagre from './Dagre/Dagre';
import Pde from './Pde/Pde';

class AppComponent extends React.Component {

  constructor(){
    super();
  }

  render() {
    return (
      <div className="index">
        <Pde/>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
