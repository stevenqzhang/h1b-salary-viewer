import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import BannerAd from './banner-ad';
import SearchBox from './search-box';
import MainTable from './main-table';
import '../index.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Panel, Well } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import { LinkContainer} from 'react-router-bootstrap';
import DocumentTitle from 'react-document-title';

//todo move to string constants class
export const DOCUMENT_TITLE_DEFAULT = "H1B Visa Salary Database 2017";

export function getDocumentTitleFromRequestParams(request_params) {
  const suffix = " | " + DOCUMENT_TITLE_DEFAULT;
  const e = request_params.em;
  const j = request_params.job_title;
  const c = request_params.city;

  if (e && j && c) {
    return e + " " + j + " salaries in " + c + suffix;
  }
  if (e && j && !c) {
    return e + " " + j + " salaries" + suffix;
  }
  if (e && !j && c) {
    return e + " salaries in " + c + suffix;
  }
  if (e && !j && !c) {
    return e + " salaries" + suffix;
  }
  if (!e && j && c) {
    return j + " salaries in " + c + suffix;
  }
  if (!e && j && !c) {
    return j + " salaries" + suffix;
  }
  if (!e && !j && c) {
    return "Salaries in " + c + suffix;
  }
  if (!e && !j && !c) {
    return DOCUMENT_TITLE_DEFAULT;
  }
  return DOCUMENT_TITLE_DEFAULT;
}

export default class SearchBoxAndMainTable extends Component {
  //Allows this to access parent prop types
  static propTypes = {
    location: PropTypes.object.isRequired
  };

  constructor(props) {  //es6 replacement for getInitialstate
    super(props);
    this.state = {
      params: this.urlParamsAsObject,
      data: null,
      documentTitle: DOCUMENT_TITLE_DEFAULT
    };
    this.transferData = this.transferData.bind(this);
  }

  transferData(request_params, response_data) {
    console.log("request parameters " + request_params);
    console.log("transferring data " + response_data);
    //TODO replace with response
    this.setState({data: response_data, params:request_params,
      documentTitle: getDocumentTitleFromRequestParams(request_params)});

    window.prerenderReady = true;
  }


  render() {
    return (
      <DocumentTitle title={this.state.documentTitle}>
        <div>
          <h1> Search H1B Salary Data </h1>
          <SearchBox
            onBackendResponse={this.transferData}
            fullQueryString = {this.props.location.search}
          />
          <BannerAd data={this.state}/>

          <MainTable data={this.state.data}/>
          <div>
            <p></p>
            <p></p>
            <p>This website stores and serves Excel data from the <a href='https://en.wikipedia.org/wiki/Labor_Condition_Application'>Labor Condition Application (LCA)</a> database</p>
            <p> A certified Labor Condition Application (ETA Form 9035), is a prerequisite to H1B approval. The LCA must be certified by the Department of Labor (DOL) before the H1B petition is submitted to USCIS. The employer must also document compliance with the LCA requirements in a public access file.</p>
            <p>The underlying Excel data can be found at the <a href='https://www.foreignlaborcert.doleta.gov/performancedata.cfm#dis'> US Department of Labor Performance Data Site</a></p>
          </div>
        </div>
      </DocumentTitle>);
  }
}
