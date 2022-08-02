import React from 'react';
import { Router, Route, Switch } from "react-router-dom";
import history from "./routerHistory";
import {
  CreateFarm
} from "@cryption/dapp-factory-sdk";
import useEagerConnect from "./hooks/useEagerConnect";
import Home from './views/Home';
import './App.css';

function App() {
  useEagerConnect();
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/create" exact>
          <CreateFarm />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
