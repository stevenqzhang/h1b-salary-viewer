import React, { Component } from 'react';
import { render } from 'react-dom';
import SearchBoxAndMainTable from './search-box-and-main-table.jsx';
import {HighestPaidCompaniesTable, HighestPaidJobsTable, HighestPaidCitiesTable, MostPopularJobsTable, MostPopularCitiesTable} from './highest-paid-and-top-tables';
import '../index.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Panel, Well } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import { LinkContainer} from 'react-router-bootstrap';

//TODO these should be stuffed into the highestpaid*table classes themselves as static members
const HIGHEST_PAID_COMPANIES_PATH = "highestpaidcompanies";
const HIGHEST_PAID_JOBS_PATH = "highestpaidjobs";
const HIGHEST_PAID_CITIES_PATH = "highestpaidcities";
const MOST_POPULAR_JOBS_PATH = "mostpopularjobs";
const MOST_POPULAR_CITIES_PATH = "mostpopularcities";

export default class App extends Component {
  constructor(props) {  //es6 replacement for getInitialstate
    super(props);
  }

  //TODO static function?
  generateCompaniesDropdownItems() {
    //TODO how do we update these companies on regular basis?
    var companies = ["Google", "Facebook", "Yahoo", "Apple", "Linkedin", "Twitter", "Amazon", "Microsoft", "Uber", "Airbnb"];

    //Some companies, like Uber match other employers ("Kellog Huber", "Neuberger"), so we need to override
    var searchOverride = {Uber: "Uber Technologies", Apple: "Apple Inc"};

    return this.generateDropdownItemsForField((company) =>{return `?em=${company}&job_title=&city=&year=`}, companies, searchOverride);
  }

  //TODO share logic with generateCompaniesDropdown?
  generateJobTitlesDropdownItems() {
    return this.generateDropdownItemsForField(
      (job_title) =>{return `?em=&job_title=${job_title}&city=&year=`},
      ["Accountant", "Analyst", "Associate", "Programmer", "Software Developer",
        "Software Engineer", "Hardware Engineer", "Senior Software Engineer",
        "Vice President", "CEO"],
      {CEO: "Chief Executive"});
  }

  generateCitiesDropdownItems() {
    return this.generateDropdownItemsForField(
      (city) =>{return `?em=&job_title=&city=${city}&year=`},
      ["New York", "Houston", "San Francisco", "Atlanta", "Chicago", "San Jose", "Sunnyvale", "Mountain View", "Seattle", "Boston"],
      {CEO: "Chief Executive"});
  }

  //Generic helper method used by others
  generateDropdownItemsForField(generateUrlFunc, items, searchOverride) {
    var renderedItems = [];
    var tempUrl = "";
    items.sort();

    items.forEach( (item) =>{
      if (searchOverride[item]) {
        tempUrl = generateUrlFunc(searchOverride[item]);
      }
      else {
        tempUrl = generateUrlFunc(item);
      }

      renderedItems.push(
        <LinkContainer to={"/" + tempUrl}>
          <MenuItem>
          {item}
          </MenuItem>
        </LinkContainer>
      );
    });

    return renderedItems;
  }

  render() {
    return (
      <Router>
        <div>
          <Navbar inverse collapseOnSelect fluid fixedTop>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/"> H1B Salary Database </a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav>
                <NavDropdown eventKey={1.1} title="Companies"  id="companies-nav-dropdown">
                  {this.generateCompaniesDropdownItems()}
                </NavDropdown>
                <NavDropdown eventKey={1.2} title="Job Titles"  id="jobs-nav-dropdown">
                  {this.generateJobTitlesDropdownItems()}
                </NavDropdown>
                <NavDropdown eventKey={1.3} title="Cities"  id="cities-nav-dropdown">
                  {this.generateCitiesDropdownItems()}
                </NavDropdown>
                <NavDropdown eventKey={1.4} title="Highest Paid"  id="highest-paid-nav-dropdown">
                  <LinkContainer to={HIGHEST_PAID_COMPANIES_PATH}>
                    <MenuItem>
                      Highest paid companies
                    </MenuItem>
                  </LinkContainer>
                  <LinkContainer to={HIGHEST_PAID_JOBS_PATH}>
                    <MenuItem>
                      Highest paid jobs
                    </MenuItem>
                  </LinkContainer>
                  <LinkContainer to={HIGHEST_PAID_CITIES_PATH}>
                    <MenuItem>
                      Highest paid cities
                    </MenuItem>
                  </LinkContainer>
                </NavDropdown>
                <NavDropdown eventKey={1.4} title="Most Popular"  id="most-popular-nav-dropdown">
                  <LinkContainer to={MOST_POPULAR_CITIES_PATH}>
                    <MenuItem>
                      Most popular cities
                    </MenuItem>
                  </LinkContainer>
                  <LinkContainer to={MOST_POPULAR_JOBS_PATH}>
                    <MenuItem>
                      Most popular jobs
                    </MenuItem>
                  </LinkContainer>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <div id="mainContent" className="container-fluid">
            <Route exact path="/" component={SearchBoxAndMainTable}/>
            <Route path={"/" + HIGHEST_PAID_COMPANIES_PATH} component={HighestPaidCompaniesTable}/>
            <Route path={"/" + HIGHEST_PAID_JOBS_PATH} component={HighestPaidJobsTable}/>
            <Route path={"/" + HIGHEST_PAID_CITIES_PATH} component={HighestPaidCitiesTable}/>
            <Route path={"/" + MOST_POPULAR_JOBS_PATH} component={MostPopularJobsTable}/>
            <Route path={"/" + MOST_POPULAR_CITIES_PATH} component={MostPopularCitiesTable}/>
          </div>
          <Navbar fluid fixedBottom className="hidden-xs">
            <Navbar.Text>
              Indexed more than 3 million H1B salaries from 2012 through 2017.
            </Navbar.Text>
            <Navbar.Collapse>
              <Navbar.Text pullRight>
                Made by some guys in Seattle with
                <img draggable="false" className="emoji" alt="❤" src="https://s.w.org/images/core/emoji/2.2.1/svg/2764.svg"/>.
                  © 2017.
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </Router>
    );
  }
}
