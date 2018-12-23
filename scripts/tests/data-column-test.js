"use strict";

//debugger;
import DataColumn from '../data-column.js';

describe('data-column custom sort date columns', () => {
  it('Same MM, YYYY, DD RH bigger', () => {
    expect(DataColumn.compareDates(
      "1/1/2001",
      "1/2/2001",
      'asc'
    )).toBeLessThan(0);
  });

  it('DD same; MM YYYY different ', () => {
    expect(DataColumn.compareDates("1/1/2016", "10/1/2015", 'asc')).toBeGreaterThan(0);
  });

  it('LH month bigger, but day smaller, same year', () => {
    expect(DataColumn.compareDates("10/1/2016", "9/2/2016", 'asc')).toBeGreaterThan(0);
  });
});
