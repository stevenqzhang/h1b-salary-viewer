package main

import (
	"database/sql"
  "encoding/json"
  "fmt"
  _ "github.com/go-sql-driver/mysql"
  "io"
  "io/ioutil"
	"net/http"
  "net/http/httputil"
  "net/url"
  "os"
  "path/filepath"
  "strings"
)

var db *sql.DB
var err error

func ifnil(arg1 interface{}, arg2 interface{}) interface{}{
  if arg1!=nil { return arg1 }
  return arg2
}

func firstArg(args []string) interface{} {
  if len(args)>0 && len(args[0])>0 {
    return args[0]
  }

  return nil
}

func buildTableQuery(u *url.URL) string{
  params := u.Query()
  fmt.Println("Build table query params were:", params)

  employer := firstArg(params["em"])
  job := firstArg(params["job_title"])
  city := firstArg(params["city"])
  startDate := firstArg(params["year"])
  limit := ifnil(firstArg(params["limit"]), "100").(string)

  whereClause := fmt.Sprintf("WHERE CASE_STATUS != 'DENIED' AND (EMPLOYER_NAME LIKE '%s%%' OR EMPLOYER_NAME LIKE '%% %s%%') AND (JOB_TITLE LIKE '%s%%' OR JOB_TITLE LIKE '%% %s%%') AND (WORKSITE_CITY LIKE '%s%%' OR WORKSITE_CITY LIKE '%% %s%%') AND EMPLOYMENT_START_DATE LIKE '%%%s%%'", ifnil(employer, "%"), ifnil(employer, "%"), ifnil(job,"%"), ifnil(job,"%"), ifnil(city,"%"),ifnil(city,"%"), ifnil(startDate,"%"))
  limitClause := " ORDER BY WAGE_RATE_OF_PAY_ADJ DESC LIMIT " + limit
  query := "SELECT CASE_NUMBER, EMPLOYER_NAME,JOB_TITLE,WAGE_RATE_OF_PAY_ADJ,WORKSITE_CITY,WORKSITE_STATE,  DATE_FORMAT(STR_TO_DATE(CASE_SUBMITTED, '%Y-%c-%d'), '%c/%d/%Y') AS CASE_SUBMITTED, DATE_FORMAT(STR_TO_DATE(EMPLOYMENT_START_DATE, '%Y-%c-%d'), '%c/%d/%Y') AS EMPLOYMENT_START_DATE, CASE_STATUS FROM h1b_copy " + whereClause + limitClause
  fmt.Println(query)
  return query
}

func executeQuery(query string) []map[string]interface{} {
  tableData := make([]map[string]interface{}, 0)

  rows, err := db.Query(query)
  if err != nil {
    fmt.Println(err)
    return nil
  }

  defer rows.Close()
  columns, err := rows.Columns()
  if err != nil {
    fmt.Println(err)
    return nil
  }

  columnCount := len(columns)


  values := make([]interface{}, columnCount)
  valuePtrs := make([]interface{}, columnCount)

  for rows.Next() {
    for i,_ := range columns {
      valuePtrs[i] = &values[i]
    }

    rows.Scan(valuePtrs...)
    entry := make(map[string]interface{})
    for i,col := range columns {
      var v interface{}
      val := values[i]
      b, ok := val.([]byte)

      if (ok) {
        v = string(b)
      } else {
        v = val
      }

      entry[col] = v
    }
    tableData = append(tableData, entry)
  }

  return tableData
}

func queryTable(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)

  query := buildTableQuery(r.URL)
  tableData := executeQuery(query)
  if tableData == nil {
    fmt.Println("Query failed to execute for " + query)
    return
  }

  jsonData, err := json.Marshal(tableData)
  if err != nil {
    fmt.Println(err)
    return
  }

  io.WriteString(w, string(jsonData))
  return
}

func buildAutoCompleteQuery(u *url.URL) string {
  params := u.Query()
  fmt.Println("Autocomplete params were:", params)

  employer := firstArg(params["em"])
  job := firstArg(params["job"])
  city := firstArg(params["city"])
  limit := ifnil(firstArg(params["limit"]), "10").(string)
  sort := ifnil(firstArg(params["sort"]), "true").(string)
  contains := ifnil(firstArg(params["contains"]), "true").(string)

  param := ""
  paramValue := ""

  if employer!=nil {
    param = "EMPLOYER_NAME"
    paramValue = fmt.Sprintf("%s", employer)
  } else if job != nil {
    param = "JOB_TITLE"
    paramValue = fmt.Sprintf("%s", job)
  } else if city != nil {
    param = "WORKSITE_CITY"
    paramValue = fmt.Sprintf("%s", city)
  }

  if param == "" {
    return ""
  }

  whereClause := fmt.Sprintf("WHERE (%s LIKE '%s%%' OR %s LIKE '%% %s%%')", param, paramValue, param, paramValue)
  if contains=="false" {
    whereClause = fmt.Sprintf("WHERE %s LIKE '%s%%'", param, paramValue)
  }
  cityWhereClause := " "
  if param == "WORKSITE_CITY" {
    cityWhereClause = " WHERE CNT > 20  "
  }
  limitClause := " LIMIT " + limit
  sortClause := " ORDER BY COUNT(1) DESC "
  if sort == "false" {
    sortClause = " "
  }

  query := "SELECT " + param + " FROM (SELECT " + param + ", COUNT(*) AS CNT FROM h1b_copy " + whereClause + " GROUP BY " + param + sortClause + limitClause + ") t" + cityWhereClause
  fmt.Println(query)
  return query
}

func autoComplete(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)

  query := buildAutoCompleteQuery(r.URL)
  tableData := executeQuery(query)
  if tableData == nil {
    fmt.Println("Query failed to execute for " + query)
    return
  }

  resultSet := make([]string, len(tableData))

  for i:=0; i<len(tableData); i++ {
    result := tableData[i]
    for k := range(result) {
      resultSet[i] = result[k].(string)
    }
  }

  jsonData, err := json.Marshal(resultSet)
  if err != nil {
    fmt.Println(err)
    return
  }

  io.WriteString(w, string(jsonData))
  return
}

func proxyRequest(w http.ResponseWriter, r *http.Request) {
  fmt.Println("proxyRequest")
  setCORS(w, r)

  params := r.URL.Query()
  affiliateURL := params["affiliateURL"][0]
  delete(params, "affiliateURL")

  affiliateURL = affiliateURL + "?" + params.Encode()
  fmt.Println(affiliateURL)

  resp, err := http.Get(affiliateURL)

  if err != nil {
    fmt.Println("proxy Request failed for: " + affiliateURL )
    fmt.Println(err)
    return
  }

  body, err := ioutil.ReadAll(resp.Body)
  if err != nil {
    fmt.Println(err)
    return
  }

  io.WriteString(w, string(body))
  return
}

func setCORS(w http.ResponseWriter, r *http.Request) {
  host := r.Host
  if (strings.Contains(host, "h1bdata.us") || strings.Contains(host, "104.196.247.145")) || strings.Contains(host, "localhost") {
    w.Header().Set("Access-Control-Allow-Origin", "*")
  }
}

func executeQueryAndWriteJson(w http.ResponseWriter, r *http.Request, query string) {
  fmt.Println("Executing query: " + query)

  tableData := executeQuery(query)
  if tableData == nil {
    fmt.Println("Query failed to execute for " + query)
    return
  }

  jsonData, err := json.Marshal(tableData)
  if err != nil {
    fmt.Println(err)
    return
  }

  io.WriteString(w, string(jsonData))
}

func topjobs(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)
  query := "SELECT JOB_TITLE, Count FROM top1000jobcounts ORDER BY 2 DESC LIMIT 1000"
  executeQueryAndWriteJson(w, r, query)
}

func topcities(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)
  query := "SELECT WORKSITE_CITY, Count FROM top1000cities ORDER BY 2 DESC LIMIT 1000"
  executeQueryAndWriteJson(w, r, query)
}
func highestpaidcompany(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)
  query := "SELECT EMPLOYER_NAME, Count, Avg_WAGE_RATE_OF_PAY_ADJ FROM top1000employersalaries ORDER BY 3 DESC LIMIT 1000"
  executeQueryAndWriteJson(w, r, query)
}

func highestpaidjob(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)
  query := "SELECT JOB_TITLE, Count, Avg_WAGE_RATE_OF_PAY_ADJ FROM top1000jobsalaries ORDER BY 3 DESC LIMIT 1000"
  executeQueryAndWriteJson(w, r, query)
}
func highestpaidcity(w http.ResponseWriter, r *http.Request) {
  setCORS(w, r)
  query := "SELECT WORKSITE_CITY, Count, Avg_WAGE_RATE_OF_PAY_ADJ FROM top1000citysalaries ORDER BY 3 DESC LIMIT 1000"
  executeQueryAndWriteJson(w, r, query)
}

func proxyAnalytics(w http.ResponseWriter, r *http.Request) {
  fmt.Println("proxying analytics request")
  fmt.Println(r)

  proxy := httputil.NewSingleHostReverseProxy(&url.URL{
                Scheme: "http",
                Host:   "www.google-analytics.com",
        })
  proxy.ServeHTTP(w, r)
}

func main() {
  db, err = sql.Open("mysql", "rhau:password@tcp(146.148.32.104:3306)/h1b")
  if err != nil {
    panic(err.Error())
  }

  defer db.Close()

  err = db.Ping()
  if err != nil {
    fmt.Println(err)
    panic(err.Error())
  }


  http.HandleFunc("/proxyRequest", proxyRequest)
  http.HandleFunc("/autocomplete", autoComplete)
  http.HandleFunc("/", queryTable)
  http.HandleFunc("/topjobs", topjobs)
  http.HandleFunc("/topcities", topcities)
  http.HandleFunc("/highestpaidcompany", highestpaidcompany)
  http.HandleFunc("/highestpaidjob", highestpaidjob)
  http.HandleFunc("/highestpaidcity", highestpaidcity)
  http.HandleFunc("/analytics_scripts/", func(w http.ResponseWriter, r *http.Request) {
    dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
    http.ServeFile(w, r, dir + "/" + r.URL.Path[1:])
  })
  http.HandleFunc("/analytics/", proxyAnalytics)

  http.ListenAndServe(":8000", nil)
}

