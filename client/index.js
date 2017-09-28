


import React from 'react';
import {render} from 'react-dom';
import BrowserRouter from "react-router-dom/BrowserRouter";
import Route from "react-router-dom/Route";
import Switch from "react-router-dom/Switch";

import Main from './pages/main';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Switch>
                        <Route exact path={`/`} component={ Main }/>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

render(<App/>, document.getElementById('app'));

