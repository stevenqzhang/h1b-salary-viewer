// with es6

import React, { Component } from 'react';
import DataColumn from './data-column';
const Config = require('Config');
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import DocumentTitle from 'react-document-title'

/**
 * Add index to rows, and numercize count column
 */
function prepData(rows) {
  var i = 1;
  rows.forEach( (row) => {
    row.index = i;
    if (row.Count) {
      row.Count = +row.Count;
    }
    i++;
  });
  return rows;
}

/**
 * Base class for highestPaid{company,location,job} and top100{
 */
export default class HighestPaidAndTopBase extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
      tableData: null
    };
    this.getPaginationOptions = this.getPaginationOptions.bind(this);
    this.getLdJson = this.getLdJson.bind(this);
  }
  
  getLdJson() {
    return {
      "@context":"http://schema.org/",
      "@type":"Dataset",
      "name":"h1bdata.us H1B Visa Salary Database",
      "description":"Data is provided by https://www.foreignlaborcert.doleta.gov/performancedata.cfm#dis",
      "sameAs": "TODO insert URL"
      "keywords": ["Top salaries"],
      "creator":{
        "@type":"Company",
        "url": "http://h1bdata.us",
        "name":"OC/NOAA/NESDIS/NCEI > National Centers for Environmental Information, NESDIS, NOAA, U.S. Department of Commerce",
        }
     }
  },
    }
  ],
  "temporalCoverage":"1950-01-01/2013-12-18",
  "spatialCoverage":{
     "@type":"Place",
     "geo":{
        "@type":"GeoShape",
        "box":"18.0 -65.0 72.0 172.0"
     }
  }
}

  }  

  executeSearchRequest(){
    //TODO use this.props.match.path or params
    const url = `${Config.serverUrl}/${this.backendUrlPath}`;

    var parentThis = this;

    fetch(url, {
      method: "get"
    }).then(function(response){
      if (response == null) {
        throw "Empty response";
      }
      return response.json();
    }).then(function(data) {
      parentThis.setState({tableData: data});
    }).catch( function(e) {
      console.log(e);
    })
  }

  getPaginationOptions() {
    return {
      page: 1,  // which page you want to show as default
      sizePerPageList: [{
        text: '100', value: 100
      }, {
        text: '250', value: 250
      }, {
        text: 'All', value: this.state.tableData.length
      } ], // you can change the dropdown list for size per page
      sizePerPage: 100,  // which size per page you want to locate as default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 3,  // the pagination bar size.
      prePage: '', // Previous page button text
      nextPage: '', // Next page button text
      firstPage: '', // First page button text
      lastPage: '', // Last page button text
      paginationShowsTotal: false,    //this is the text surrounding the size per page
      paginationPosition: 'bottom',  // default is bottom, top and both is all available
      hideSizePerPage: false, // You can hide the dropdown for sizePerPage
      alwaysShowAllBtns: false, // Always show next and previous button
      hidePageListOnlyOnePage: true
      // withFirstAndLast: false > Hide the going to First and Last page button
    };
  }

  render() {
    const nonIndexColumns = DataColumn.getColumnInstancesFromData(this.state.tableData, this.columnNamesInOrder);
    if (nonIndexColumns == null) {
      return null;
    }

    var renderedColumns = [];

    const indexColumn = new DataColumn("index", 5);

    //Add index column. this is easier than using the column API
    renderedColumns.push(
      React.cloneElement(
        indexColumn.getReactElementForColumn(1),
        {
          filter: null
        }));

    var i = 2;
    nonIndexColumns.forEach(function(column) {
      renderedColumns.push(
        column.getPotentiallyLinkifiedReactElementForColumn(i)
      );
      i++;
    });


    return (
      <DocumentTitle title = {this.title + " for H1B visas | H1B Visa Salary Database"}>
        <div>
          <h1> {this.title} </h1>
          <BootstrapTable className="table-responsive"
                          tableStyle={ { margin: 0, background: 'white' }}
                          height="auto"
                          data={ prepData(this.state.tableData) }
                          columns = {nonIndexColumns.push(indexColumn)}
                          pagination
                          options={this.getPaginationOptions()}
                          hover>
            {renderedColumns}
          </BootstrapTable>
        </div>
      </DocumentTitle>
    );
  }
}

export class HighestPaidCompaniesTable extends HighestPaidAndTopBase {
  constructor(props)
  {
    super(props);
    this.columnNamesInOrder = ["EMPLOYER_NAME", "Count", "Avg_WAGE_RATE_OF_PAY_ADJ"];
    this.backendUrlPath = "highestpaidcompany";
    //TODO merge this with app.jsx strings of the same type in an elegant way
    this.title = "Highest paid companies";

    //This is hacky that we can't have this in the base, but if we don't have this
    //in the subclass, executeSearchRequest will happen when super is called, without
    //backendUrlPath being defined
    this.executeSearchRequest();
  }
}

export class HighestPaidJobsTable extends HighestPaidAndTopBase {
  constructor(props)
  {
    super(props);
    this.columnNamesInOrder = ["JOB_TITLE", "Count", "Avg_WAGE_RATE_OF_PAY_ADJ"];
    this.backendUrlPath = "highestpaidjob";
    this.title = "Highest paid jobs";

    //This is hacky that we can't have this in the base, but if we don't have this
    //in the subclass, executeSearchRequest will happen when super is called, without
    //backendUrlPath being defined
    this.executeSearchRequest();
  }
}

export class HighestPaidCitiesTable extends HighestPaidAndTopBase {
  constructor(props)
  {
    super(props);
    this.columnNamesInOrder = ["WORKSITE_CITY", "Count", "Avg_WAGE_RATE_OF_PAY_ADJ"];
    this.backendUrlPath = "highestpaidcity";
    this.title = "Highest paid cities";

    //This is hacky that we can't have this in the base, but if we don't have this
    //in the subclass, executeSearchRequest will happen when super is called, without
    //backendUrlPath being defined
    this.executeSearchRequest();
  }
}

export class MostPopularJobsTable extends HighestPaidAndTopBase {
  constructor(props)
  {
    super(props);
    this.columnNamesInOrder = ["JOB_TITLE", "Count"];
    this.backendUrlPath = "topjobs";
    this.title = "Most popular jobs";

    //This is hacky that we can't have this in the base, but if we don't have this
    //in the subclass, executeSearchRequest will happen when super is called, without
    //backendUrlPath being defined
    this.executeSearchRequest();
  }
}

export class MostPopularCitiesTable extends HighestPaidAndTopBase {
  constructor(props)
  {
    super(props);
    this.columnNamesInOrder = ["WORKSITE_CITY", "Count"];
    this.backendUrlPath = "topcities";
    this.title = "Most popular cities";

    //This is hacky that we can't have this in the base, but if we don't have this
    //in the subclass, executeSearchRequest will happen when super is called, without
    //backendUrlPath being defined
    this.executeSearchRequest();
  }
}
