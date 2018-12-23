// with es6

import React from 'react';
import _ from 'lodash';
import {TableHeaderColumn} from 'react-bootstrap-table';
import { Link } from 'react-router-dom';

//TODO use underscore
var intersection = function(){
  return Array.from(arguments).reduce(function(previous, current){
    return previous.filter(function(element){
      return current.indexOf(element) > -1;
    });
  });
};

//http://stackoverflow.com/a/23823717/1621636
var arrayAverage = function average(arr) {
  var finalstate=arr.reduce(function(state,a) { state.sum+=a;state.count+=1; return state },
    {sum:0,count:0});
  return finalstate.sum/finalstate.count
};


function priceFormatter(cell, row) {
  return `<i class='glyphicon glyphicon-usd'></i> ${parseInt(cell).toLocaleString()}`;
}

function linkifyFormatterFor(cell, row, column_raw_name) {
  var url = ((raw_name) => {
    switch (raw_name) {
      case "JOB_TITLE":
        return `/?em=&job_title=${cell}&city=&year=`;
      case "EMPLOYER_NAME":
        return `/?em=${cell}&job_title=&city=&year=`
      case "WORKSITE_CITY":
        return `/?em=&job_title=&city=${cell}&year=`;
      default:
        throw "linkifyFormatter has a column_raw_name that can't be linkified";
    }
  })(column_raw_name);

  return <Link to={url}> {camelCaseFormatter(cell)} </Link>;
}

function linkifyEmployerNameFormatter(cell, row) {
  return linkifyFormatterFor(cell, row, "EMPLOYER_NAME");
}

function linkifyJobTitleFormatter(cell, row) {
  return linkifyFormatterFor(cell, row, "JOB_TITLE");
}

function linkifyWorksiteCityFormatter(cell, row) {
  return linkifyFormatterFor(cell, row, "WORKSITE_CITY");
}



//From http://stackoverflow.com/a/7592235/1621636
function camelCaseFormatter(cell, row) {
  if (typeof cell == "string") {
    return cell.toLowerCase().replace(/(?:^|\s)\S/g, l => l.toUpperCase());
  }

  return cell;
}

export default class DataColumn {
  constructor(name, bestWidthInChars) {
    this.rawName = name;

    //best width to use. mostly using average
    this.bestWidthInChars = bestWidthInChars;
    this.bootstrapResponsiveUtilityClasses = ""; //http://getbootstrap.com/css/#responsive-utilities-classes

    this.customSortFunc = this.customSortFunc.bind(this);
  }

  //custom sort function override, if needed
  //needed for financial and date data
  //todo bind this?
  customSortFunc(a, b, order, sortField, extraData) {
    if (this.isFinancialColumnHeader) {
      if (order === 'asc') {
        return a[sortField] - b[sortField]
      }
      return b[sortField] - a[sortField]
    }

    if (this.isDateColumnHeader) {
      return DataColumn.compareDates(a[sortField], b[sortField], order);
    }
  }

  //TODO this should be static?
  static compareDates(a, b, order){
    const ascending_comparator = new Date(a) - new Date(b);

    return order == 'asc'? ascending_comparator: -ascending_comparator;
  }

  //TODO unit test
  static getFormattedNameForRawName(rawName) {
    switch (rawName) {
      //TODO extract these into enums for resuse in other methods
      case "EMPLOYER_NAME":
        return "Employer";
      case "WAGE_RATE_OF_PAY_ADJ":
        return "Salary"; //Shortened to revent word wrapping
      case "WORKSITE_CITY":
        return "Location";
      case "CASE_SUBMITTED":
        return "Submit date";
      case "EMPLOYMENT_START_DATE":
        return "Start date";
      case "Avg_WAGE_RATE_OF_PAY_ADJ":
        return "Average Salary";
      case "index":
        return "#";
      case "Count":
        return "# of H1B Filings";
      default:
        return _.startCase(rawName.split("_").join(" ").toLowerCase());
    }
  }

  get formattedName() {
    return DataColumn.getFormattedNameForRawName(this.rawName);
  }

  //See https://github.com/AllenFang/react-bootstrap-table/issues/753
  get responsiveUtilityClasses() {
    const alwaysShow = "";
    const hidePhones = "hidden-xs";
    const hidePhonesAndTablets = "hidden-xs hidden-sm";

    //decreasing order of importance
    switch (this.rawName) {
      case "JOB_TITLE":
        return alwaysShow;
      case "WAGE_RATE_OF_PAY_ADJ":
        return alwaysShow;
      case "EMPLOYER_NAME":
        return alwaysShow;
      case "WORKSITE_CITY":
        return alwaysShow;
      case "CASE_SUBMITTED":
        return alwaysShow;
      case  "CASE_STATUS":
        return alwaysShow;
      case "EMPLOYMENT_START_DATE":
        return alwaysShow;
      default:
        return alwaysShow;
    }
  }

  get isFinancialColumnHeader() {
    //TODO un-statify all the below and go from there
    //var financial_columns = ["WAGE_RATE_OF_PAY_ADJ"];

    if (["WAGE_RATE_OF_PAY_ADJ"].indexOf(this.rawName) > -1) { //TODO extract into DataColumnsManager class?
      return true;
    }

    if (this.rawName == "Avg_WAGE_RATE_OF_PAY_ADJ") {
      return true;
    }

    return false;
  }

  //TODO should be removed once we turn this into subclasses
  get isLinkifiableColumnHeader() {
    switch (this.rawName) {
      case "JOB_TITLE":
        return true;
      case "EMPLOYER_NAME":
        return true;
      case "WORKSITE_CITY":
        return true;
      default:
        return false;
    }
  }


  get isDateColumnHeader() {
    //todo extract these to constants
    if (this.rawName == "CASE_SUBMITTED" || this.rawName == "EMPLOYMENT_START_DATE") {
      return true;
    }
    return false;
  }

  //TODO extract this to multipe levels of importers somehow?
  static get MainTableColumnNames(){
    return ["EMPLOYER_NAME", "JOB_TITLE",  "WAGE_RATE_OF_PAY_ADJ", "WORKSITE_CITY",
      "CASE_SUBMITTED", "EMPLOYMENT_START_DATE", "CASE_STATUS"];
  }

  /**
   * If col_names_intersect_override is defined, then we'll use it to intersect with the list of columns in data
   * Useful for sorting by column order
   */
  static getColumnInstancesFromData(data, col_names_intersect_override = "") {
    //I could be using truthy, but it's too opaque/confusing
    if ((typeof data == 'undefined' || data == null) || data.length == 0) {
      return;
    }

    var col_names = Object.keys(data[0]);
    if (col_names_intersect_override != "") {
      col_names = intersection(col_names_intersect_override, col_names);
    }

    console.log("Column names collected:" + col_names);

    var dataColumns = col_names.map( (col_name) =>
      new DataColumn(
        col_name,
        this.getWidthForGivenColumn(data, col_name)));

    dataColumns = this.getWidthPercentageOfTotal(dataColumns);
    return dataColumns;
  }

  //compare width with all other widths in column to generate width in percentage points
  static getWidthPercentageOfTotal(columns) {
    var sum : number = columns.reduce( (sum, col) => sum + +col.bestWidthInChars, 0);
    columns.forEach( function(column) {
      //round down so that the total sum % is guaranteed to be <= 100%
      column.widthPercentageOfTotal = Math.floor((column.bestWidthInChars/sum * 100));
      console.log(`Percentage width of column ${column.rawName} is: ${column.widthPercentageOfTotal} %`);
    })

    return columns;
  }

  //TODO unit test this
  static getWidthForGivenColumn(data, col_name) {
    const column = data.map( (row) => {return row[col_name]});
    var width = 0;

    //todo this should be done using composition instead
    if (col_name == "WORKSITE_CITY") {
      const unflattedNestedList = column.map((x) => {return x.split(" ")})
      var listOfLengths = [].concat.apply([], unflattedNestedList).map(x =>x.length);
      listOfLengths.push("Location".length);
      width = Math.max(...listOfLengths) + 3;

      console.log(`Best width of ${col_name}'s data is: ${width} characters, calculated using max`);
      return width
    }

    //Wages are wrapped by glyficon, so....
    //TODO this might be a performance issue...
    if (col_name == "WAGE_RATE_OF_PAY_ADJ") {

      var widths = column.map( (x) => {return parseFloat(x).toLocaleString().length});
      //+2 characers. one for for the dollar sign and another one just in case
      width = Math.max(...widths) + 2

      console.log(`Best width of ${col_name}'s data is: ${width} characters, calculated by parsing number into a local-specific financial data string`);
      return width
    }

    //TODo clean this static method up
    var widths = column.map( (x) => { return (typeof x == 'undefined' || x == null) ? 0: x.length});
    width = arrayAverage(widths).toFixed();
    width = Math.max(this.getFormattedNameForRawName(col_name).length, width);
    console.log(`Best width of ${col_name}'s data is: ${width} characters, calculated using average`);
    return width;
  }

  getBaseReactElementForColumn(i) {
    const DEFAULT_FILTER = { type: 'TextFilter', delay: 1000, placeholder: " "};

    return (
      <TableHeaderColumn
        key={this.rawName}
        column = {this}
        dataField = {this.rawName}
        filter= { DEFAULT_FILTER}
        isKey= {i==1 ? true: false}
        dataSort
        width =  {+this.bestWidthInChars + 1 + "ch"}
        tdStyle={ { whiteSpace: 'normal' } }
        className= {this.responsiveUtilityClasses}
        columnClassName= {this.responsiveUtilityClasses}
        dataFormat= {camelCaseFormatter}
      >
        {this.formattedName}
      </TableHeaderColumn>
    )
  }

  /**
   * Takes into account types
   * TODO should indexForKey be stuffed into column object?
   **/
  getReactElementForColumn(indexForKey) {
    if (this.isFinancialColumnHeader) {
      console.log(this.rawName + "is financial data, reformatting");
      return React.cloneElement(
          this.getBaseReactElementForColumn(indexForKey),
          {
            dataFormat: priceFormatter,
            sortFunc: this.customSortFunc,
            width :  +this.bestWidthInChars + "ch"
          });
    }

    if (this.isDateColumnHeader) {
      return React.cloneElement(
        this.getBaseReactElementForColumn(indexForKey),
        {
          sortFunc: this.customSortFunc,
        });
    }

    return this.getBaseReactElementForColumn(indexForKey);
  }

  /**
   * Will linkify rows if employer, company, or otherwise return regular
   * @param indexForKey
   * @returns {*}
     */
  getPotentiallyLinkifiedReactElementForColumn(indexForKey) {
    switch (this.rawName) {
      case "JOB_TITLE":
        console.log(this.rawName + " can be linkified as a job title search, reformatting");
        return React.cloneElement(
          this.getReactElementForColumn(indexForKey),
          {
            dataFormat: linkifyJobTitleFormatter
          });
      case "EMPLOYER_NAME":
        console.log(this.rawName + " can be linkified as employer name search, reformatting");
        return React.cloneElement(
          this.getReactElementForColumn(indexForKey),
          {
            dataFormat: linkifyEmployerNameFormatter
          });
      case "WORKSITE_CITY":
        console.log(this.rawName + " can be linkified as worksite city search, reformatting");
        return React.cloneElement(
          this.getReactElementForColumn(indexForKey),
          {
            dataFormat: linkifyWorksiteCityFormatter
          });
      default:
        return this.getReactElementForColumn(indexForKey);
    }


  }
}
