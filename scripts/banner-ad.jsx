import React, { Component } from 'react';
var ReactDOM = require('react-dom');
import $ from 'jquery';
var Config = require('Config');

export default class BannerAd extends Component {
  constructor(props)
  {
    super(props);
    this.city = null;

    //TODO clean up state subobjects that are not used
    this.state = {
      data: null,
      params: null,
      userAgent: null,
      publisher: null,
      city: null,
      indeedNumResults: null
    }
  }

  //TODO this should all be renamed and refactored using redux
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);

    this.parentComponentParams = nextProps.data['params'];
    this.data = nextProps.data['data'];
    this.userAgent = navigator.userAgent;
    this.publisher = '6078546487927598';
    if (this.parentComponentParams != null) {
      this.city = this.parentComponentParams.city;
    }

    //TODO delete if this is too costly, but this will make code cleaner if we leave it in.
    this.getIndeedAd();
    this.generateAd();
  }

  generateAd() {
    if (this.parentComponentParams == null) {
      return <div></div>;;
    }

    if (this.parentComponentParams.em) {
      console.log("Rendering banner-ad from amazon employer affiliate link");
      return <a href="http://amzn.to/2qZHUn0"> Crack the coding interview and land a job at <i><b>{this.parentComponentParams.em}</b></i>.</a>;
    }

    if (this.parentComponentParams.job_title) {
      console.log("Rendering banner-ad from amazon job-title affiliate link");
      return <a href="http://amzn.to/2qZHUn0"> Crack the coding interview and land a job as a <i><strong>{this.parentComponentParams.job_title}</strong></i>.</a>;
    }

    if (this.parentComponentParams.city) {
      console.log("Rendering banner-ad from indeed city results");
      if (this.indeedNumResults == null || this.city == null) {
        return <div></div>;
      }

      return (
        <a href={'http://www.indeed.com/jobs?l='+this.city+'&indpubnum='+this.publisher}> We found {this.indeedNumResults} jobs near <i><strong>{this.city}</strong></i>.</a>
      )
    }

    return <div></div>;
  }

  getIndeedAd() {
    if (this.parentComponentParams == null) {
      return;
    }
    var paramObj = {
      affiliateURL: 'http://api.indeed.com/ads/apisearch',
      publisher: this.publisher,
      format: 'json',
      l: this.city,
      co:'us',
      userip:'1.2.3.4',
      useragent: this.userAgent,
      v: '2'
    }

    var parentThis = this;
    const params = $.param(paramObj);
    const url = `${Config.serverUrl}/proxyRequest?${params}`
    // const url = `http://api.indeed.com/ads/apisearch?${params}`;
    fetch(url, {
      method: 'get', mode: 'cors', crossDomain: 'true'
    }).then(function(response) {
      if (response == null) {
        console.log("Empty Response")
      }
      return response.json();
     }).then(function(json) {
      console.log(json)
      parentThis.indeedNumResults = json['totalResults'];
      parentThis.city = json['location'];
      parentThis.forceUpdate();
     });
  }

  render() {
    return (
      <div id="bannerAdContainer">
        {this.generateAd()}
      </div>
    );
  }
}
