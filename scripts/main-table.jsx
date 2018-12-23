// with es6

import React, { Component } from 'react';
var ReactDOM = require('react-dom');
import DataColumn from './data-column';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
//TODO better names

export default class MainTable extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
      columns: null
    }
    this.getPaginationOptions = this.getPaginationOptions.bind(this);
  }

  getPaginationOptions() {
    return {
      page: 1,  // which page you want to show as default
      sizePerPageList: [{
        text: '25', value: 25
      }, {
        text: '50', value: 50
      }, {
        text: '100', value: 100
      }, {
        text: '500', value: 500
      }, {
        text: 'All', value: this.props.data.length
      } ], // you can change the dropdown list for size per page
      sizePerPage: 100,  // which size per page you want to locate as default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 1,  // the pagination bar size.
      prePage: '', // Previous page button text
      nextPage: '', // Next page button text
      firstPage: '', // First page button text
      lastPage: '', // Last page button text
      paginationShowsTotal: false,    //this is the text surrounding the size per page
      paginationPosition: 'both',  // default is bottom, top and both is all available
      hideSizePerPage: false, // You can hide the dropdown for sizePerPage
      alwaysShowAllBtns: true, // Always show next and previous button
      hidePageListOnlyOnePage: true,
      withFirstAndLast: false //Hide the going to First and Last page button
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data == nextProps.data) {
      return;
    }

    this.columns = DataColumn.getColumnInstancesFromData(nextProps.data, DataColumn.MainTableColumnNames);
  }

  render() {
    if (this.columns == null) {
      return null;
    }

    var renderedColumns = []

    var columns = this.columns;
    var i = 0;
    columns.forEach(function(column) {
      i++;

      renderedColumns.push(
        column.getReactElementForColumn(i)
      )
    });

    return (
      <BootstrapTable className="table-responsive"
                      height="auto"
                      data={ this.props.data }
                      columns = {this.state.columns}
                      tableStyle={ { margin: 0, background: 'white' }}
                      pagination
                      options={this.getPaginationOptions()}
                      hover>
        {renderedColumns}
      </BootstrapTable>
    );
  }
}
