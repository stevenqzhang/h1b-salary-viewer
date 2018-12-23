"use strict";

import {getDocumentTitleFromRequestParams, DOCUMENT_TITLE_DEFAULT } from '../search-box-and-main-table.jsx';

describe('getDocumentTitleFromRequestParams tests', () => {
  function docTitleHelper(em, job_title, city, year, expectedDocTitleWithoutSuffix) {
    const request_params = {
      em: em,
      job_title: job_title,
      city: city,
      year: year
    };
    expect(getDocumentTitleFromRequestParams(request_params)
      .toEqual(expectedDocTitleWithoutSuffix + " | " + DOCUMENT_TITLE_DEFAULT));
  }

  it('should render document title correctly when employer is in search query', () => {
    docTitleHelper("EM", "TITLE", "CITY", 1999, "EM TITLE salaries in CITY");
    docTitleHelper("EM", "TITLE", null, 1999, "EM TITLE salaries");
    docTitleHelper("EM", null, "CITY", 2001, "EM salaries in CITY");
    docTitleHelper("EM", null, null, 1999, "EM salaries");
  });

  it('should render document title correctly when employer is not in search query', () => {
    docTitleHelper(null, "TITLE", "CITY", 1999, "TITLE salaries in CITY");
    docTitleHelper(null, "TITLE", null, 1999, "TITLE salaries");
    docTitleHelper(null, null, "CITY", 2001, "Salaries in CITY");
  });

  it('should revert to default doc title with no search params", () => {
    const request_params = {};
    expect(getDocumentTitleFromRequestParams(request_params)
      .toEqual(DOCUMENT_TITLE_DEFAULT));
  });
});
