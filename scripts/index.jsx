import React, { Component } from 'react';
import { render } from 'react-dom';
import '../index.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import App from './app'
import $ from 'jquery';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import {browserHistory} from 'react-router';

//For karma testing. Pretty hacky
//https://stackoverflow.com/questions/30751385/karma-coverage-and-babelbrowserify-preprocessing
if ($('#root').length <= 0) {
  $('body').prepend('<div id="root"></div>');
}

//Use browser history for now...
//TODO maybe use https://github.com/adjohnson916/anchorate
render(
  <App/>,
  document.getElementById('root'));
