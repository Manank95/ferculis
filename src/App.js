import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Menu from './components/Menu';
import Pen from './components/Pen';

class App extends Component {
  render() {
    return (
      <Router>
        <>
          <Switch>
            <Route path="/menu" exact component={Menu} />
            <Route path="/pen" exact component={Pen} />
          </Switch>
        </>
      </Router>
    );
  }
}

export default App;
