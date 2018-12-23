// with es6

import React, { Component, PropTypes } from 'react';
import { Button, Col, Form, FormGroup, FormControl, ControlLabel, HelpBlock, OverlayTrigger, Panel,Popover } from 'react-bootstrap';
import $ from 'jquery';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
var Config = require('Config');
import { browserHistory } from 'react-router';
import _ from 'lodash';

const queryString = require('query-string');


//TODO should these be m-v or globals? There are no static variables in es6 so...
//Should match this code in main.go
//func buildAutoCompleteQuery(u *url.URL) string {
//  params := u.Query()
//  fmt.Println("Autocomplete arams were:", params)
//
//  employer := firstArg(params["em"])
//  job := firstArg(params["job"])
//  city := firstArg(params["city"])

const EMPLOYER_KEY = "em";
const JOB_KEY = "job";
const CITY_KEY = "city";
const MAX_ROWS_PER_QUERY = 10000;

export default class SearchBox extends Component {
  constructor(props) {  //es6 replacement for getInitialstate
    super(props);

    this.onSubmitPressed = this.onSubmitPressed.bind(this);
    this.handleNonTypeaheadChange = this.handleNonTypeaheadChange.bind(this);
    this.handleTypeaheadSearchForField = this.handleTypeaheadSearchForField.bind(this);
    this.getYearSelections = this.getYearSelections.bind(this);
    this.handleTypeaheadTextChangeForField = this.handleTypeaheadTextChangeForField.bind(this);
    this.urlParamsAsObject = this.urlParamsAsObject.bind(this);

    this.state = {
      value: '',
      status: "",
      open:true,
      isLoading: false,
      popoverShown: false,
      autocompleteOptions: {[EMPLOYER_KEY]: [], [JOB_KEY]:[], [CITY_KEY]:[] },
      initialAllFieldsBlank: true,
      queryParams: {}
    };

    this.numRows = 0;



    //TODO is this unkosher in react?
    this.componentWillReceiveProps(props);
  }

  urlParamsAsObject(queryParamsString: string) {
    var allParams = queryString.parse(queryParamsString);

    if (!("limit" in allParams)) {
      allParams.limit = MAX_ROWS_PER_QUERY;
    }

    var paramObj = (({ em, job_title, city, limit }) => ({ em, job_title, city, limit }))(allParams);


    return paramObj
  }

  componentWillReceiveProps(nextProps) {
    var nextQueryParams = this.urlParamsAsObject(nextProps.fullQueryString);

    this.typeaheadCurrentText = {[EMPLOYER_KEY]: nextQueryParams.em,
      [JOB_KEY]: nextQueryParams.job_title,
      [CITY_KEY]: nextQueryParams.city};

    //TODO maybe these next lines aren't necessary?
    if (nextProps.fullQueryString == "") {
      this.typeaheadCurrentText = {[EMPLOYER_KEY]: "", [JOB_KEY]:"", [CITY_KEY]:"" };
      return;
    }

    if (_.isEqual(this.state.queryParams, nextQueryParams)) {
      return
    }

    this.setState({isLoading: true, initialAllFieldsBlank : false, queryParams: nextQueryParams});
    this.executeSearchRequest(nextQueryParams);
    this.setState({initialAllFieldsBlank: false});
  }

  //validation not needed for v1
  getValidationState() {
    const length = this.state.value.length;
    if (length > 10) return 'success';
    if (length > 5) return 'warning';
    if (length > 0) return 'error';
  }


  //see https://facebook.github.io/react/docs/forms.html
  //"handling multiple inputs"
  handleNonTypeaheadChange(event) {
    if (this.state.initialAllFieldsBlank) {
      this.setState({initialAllFieldsBlank: false});
    }

    const target = event.target;
    if (target.type == "text" || target.type == "select-one") {
      const name = target.id.toString();
      this.setState({[name]: target.value });
    }
  }

  handleTypeaheadSearchForField(field, query) {
    if (!query) {
      return;
    }

    this.fetchTypeaheadOptionsForField(field, query);
  }

  fetchTypeaheadOptionsForField(field, str) {
    const paramObj = {[field]: str, limit: "10", sort: "true"};
    const autocompleteParams = $.param(paramObj);
    const url = `${Config.serverUrl}/autocomplete?${autocompleteParams}`;
    var parentThis = this;
    fetch(url, {
      method: "get"
    }).then(function(response){
      if (response == null) {
        throw "Empty response";
      }
      return response.json();
    }).then(function(json) {
      var autocompleteState = parentThis.state.autocompleteOptions;
      autocompleteState[field] = json;

      parentThis.setState({autocompleteOptions: autocompleteState});
    });
  }

  getYearSelections() {
    var options = [];
    var i = 0;
    options.push(<option value="" key={0}>All Years</option>);
    var parentThis = this;
    [2012, 2013, 2014, 2015, 2016].forEach(function(year) {
      i++;
      options.push(
        <option value={year.toString()} key={year}> {parentThis.returnSameAsString(year)} </option>
      )
    });

    return options;
  }

  //workaround for react devtools bug 354
  // from https://github.com/alces-software/alces-access-manager/commit/e96db006b6acb5c6c6e3dae32eebed2682e26115
  //todo make anonymous functioN?
  returnSameAsString(val) {
    return val.toString();
  }

  //TODO this should probably be redux/flux-ified
  onSubmitPressed(e) {
    e.preventDefault();
    if(this.state.isLoading || this.state.initialAllFieldsBlank) {
      return;
    }

    var paramObj = {em: this.typeaheadCurrentText[EMPLOYER_KEY],
                    job_title: this.typeaheadCurrentText[JOB_KEY],
                    city: this.typeaheadCurrentText[CITY_KEY],
                    year: this.state.searchYear,
                    limit: MAX_ROWS_PER_QUERY};

    this.setState({queryParams: paramObj});

    //we only care about updating URL if we come here by clicking submit
    //otherwise react router takes care of this..
    //See https://github.com/ReactTraining/react-router/issues/975 and https://knowbody.github.io/react-router-docs/guides/NavigateOutsideComponents.html
    this.context.router.history.push("?" + $.param(paramObj));

    //TODO probably refactor this
    this.executeSearchRequest(paramObj);
  }

  executeSearchRequest(paramObj: Object){
    const paramString = $.param(paramObj);
    const url = `${Config.serverUrl}/?${paramString}`;
    this.setState({isLoading: true});

    var parentThis = this;

    fetch(url, {
      method: "get"
    }).then(function(response){
      if (response == null) {
        throw "Empty response";
      }
      return response.json();
    }).then(function(o) {
      parentThis.numRows = o.length;
      parentThis.props.onBackendResponse(paramObj, o);
      parentThis.generateStatusMessageAndSetState();
    }).catch( function(e) {
      //TODO Issue:2
      if (e.message == "React.Children.only expected to receive a single React element child.") {
        //TODO after issue 2 is fixed, move this up to the then block
        //For now, must be here since calling parenThis.props.onBackendResponse triggers a render which
        //throws the above error message
        parentThis.generateStatusMessageAndSetState();
        return;
            }
            console.log(e);
            parentThis.setState({status: "Querying database failed. Please try again." + e, isLoading: false});
        })
    }

  generateStatusMessageAndSetState() {
    var statusString;

    if (this.numRows == 0) {
      statusString = "No records found"
    } else if (this.numRows < MAX_ROWS_PER_QUERY) {
      statusString = `All ${this.numRows} records shown below.`;
    } else if (this.numRows >= MAX_ROWS_PER_QUERY) {
      statusString = `First ${this.numRows} records shown below.`;
    }

    //TODO make a function that displays a better string below
    //if 0, we should say something different
    //if < MAX_PER_PAGE, we should say "all records"
    //IF >= MAX_PER_PAGE, we should say "first 1000"
    this.setState({status: statusString, isLoading: false, initialAllFieldsBlank: false});
  }

  handleTypeaheadTextChangeForField(field, text) {
    if (this.state.initialAllFieldsBlank) {
      this.setState({initialAllFieldsBlank: false});
    }

    this.typeaheadCurrentText[field] = text;
  }

  //Type explained here https://github.com/react-bootstrap/react-bootstrap/issues/2068*/}
  //password, file: basically
  //see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input, attribute:type
  render() {
    let isLoading = this.state.isLoading;
    return (
      <div id="searchboxContainer">
        <Panel collapsible expanded={this.state.open} className="text-center">
          <Form className="text-center" onSubmit={this.onSubmitPressed}>
            <Col md={4}>
              <AsyncTypeahead
                id="searchEmployer"
                options={this.state.autocompleteOptions[EMPLOYER_KEY]}
                placeholder= "Employer Name"
                onSearch={(query) => this.handleTypeaheadSearchForField(EMPLOYER_KEY, query)}
                onInputChange={(text) => this.handleTypeaheadTextChangeForField(EMPLOYER_KEY, text)}
                selected={[this.state.queryParams.em]}
                submitFormOnEnter
              />
            </Col>
            <Col md={3}>
              <AsyncTypeahead
                id="searchJobTitle"
                options={this.state.autocompleteOptions[JOB_KEY]}
                placeholder= "and/or Job Title"
                onSearch={(query) => this.handleTypeaheadSearchForField(JOB_KEY, query)}
                onInputChange={(text) => this.handleTypeaheadTextChangeForField(JOB_KEY, text)}
                selected={[this.state.queryParams.job_title]}
                submitFormOnEnter
              />
            </Col>
            <Col md={3}>
              <AsyncTypeahead
                id="searchCity"
                options={this.state.autocompleteOptions[CITY_KEY]}
                placeholder="and/or City"
                onSearch={(query) => this.handleTypeaheadSearchForField(CITY_KEY, query)}
                onInputChange={(text) => this.handleTypeaheadTextChangeForField(CITY_KEY, text)}
                selected={[this.state.queryParams.city]}
                submitFormOnEnter
              />
            </Col>
            <Col md={2}>
              <FormGroup controlId="searchYear">
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  onChange={this.handleNonTypeaheadChange}>
                  {this.getYearSelections()}
                </FormControl>
              </FormGroup>
            </Col>
            <div className="text-center">
              <Button type="submit"
                      bsSize="large"
                      bsStyle="primary"
                      disabled={isLoading || this.state.initialAllFieldsBlank}>
                {isLoading ? 'Loading results...' : 'Search'}
              </Button>
            </div>
          </Form>
          <Button onClick={ ()=> this.setState({ open: !this.state.open })}
                  bsStyle="link" bsSize="xsmall">
            [-] Hide
          </Button>

          <div id="search_status">
            {//TODO style this div
              this.state.status}
          </div>
        </Panel>
        {!this.state.open &&
          <Button onClick={ ()=> this.setState({ open: !this.state.open })}
                  bsStyle="link" bsSize="xsmall">
            [+] Show search
          </Button>
        }
      </div>
    );
  }
}

SearchBox.contextTypes = {
  router: PropTypes.object.isRequired
};
