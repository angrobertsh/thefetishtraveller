import * as React from 'react';
import {Route} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import EventPage from './event_page';
import EventEdit from './event_edit';
import EventSearch from './event_search';
import LocationCreation from './location_creation';
import LocationEdit from './location_edit';
import Imprint from './imprint';
import Container from '../components/container';
import Header from '../components/header';
import Footer from '../components/footer';

export default class Application extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="application">
          <Header/>
          <main>
            <Route path="/" exact component={EventSearch}/>
            <Route path="/events/:id" exact component={EventPage}/>
            <Route path="/events/:id/edit" exact component={EventEdit}/>
            <Route path="/locations/new" exact component={LocationCreation}/>
            <Route path="/locations/:id/edit" exact component={LocationEdit}/>
            <Route path="/imprint" exact component={Imprint}/>
          </main>
          <Footer/>
        </div>
      </BrowserRouter>
    );
  }
}
