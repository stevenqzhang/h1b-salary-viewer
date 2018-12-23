//This file is to proxy google analytics, hotjar, and mixpanel calls so they don't get blocked by user's adblock

package main

import (
  "fmt"
  "net/http"
  "net/http/httputil"
  "net/url"
  "strings"
)

func NewMultipleHostReverseProxy(target *url.URL) *httputil.ReverseProxy {
        director := func(req *http.Request) {
                fmt.Println("reqURL: " + req.URL.String())
                newURL := strings.Replace(req.URL.String(), "/r/", "/", 1)
                newURL = "/" + strings.SplitN(newURL, "/", 3)[2]
                fmt.Println("newURL: " + newURL)
                req.URL, _ = url.Parse(newURL)
                
                req.Host = target.Host
                req.URL.Scheme = target.Scheme
                req.URL.Host = req.Host

                
                values := req.URL.Query()

                path := "/" + strings.SplitN(newURL, "/", 3)[1]
                if path == "g-a" {
                  delete(values, "dl")
                  values.Add("dl", "h1bdata.us")
                  req.URL.RawQuery = values.Encode()  
                }

                fmt.Print("target: ")
                fmt.Println(target)
                fmt.Print("req: ")
                fmt.Println(req)
        }

       // modifyResponse := func(resp *http.Response) error {
       // fmt.Print("Response: ")
       //   fmt.Println(resp)
       //   return nil
       // }

        return &httputil.ReverseProxy{Director: director}
        //return &httputil.ReverseProxy{Director: director, ModifyResponse: modifyResponse}
}

func main() {
  gaProxy := NewMultipleHostReverseProxy(&url.URL{
                  Scheme: "http",
                  Host:   "www.google-analytics.com",
          })
  shjProxy := NewMultipleHostReverseProxy(&url.URL{
                  Scheme: "https",
                  Host:   "script.hotjar.com",
          })
  vhjProxy := NewMultipleHostReverseProxy(&url.URL{
                  Scheme: "https",
                  Host:   "vars.hotjar.com",
          })
  apiMpProxy := NewMultipleHostReverseProxy(&url.URL{
                  Scheme: "https",
                  Host:   "api.mixpanel.com",
          })
  mpProxy := NewMultipleHostReverseProxy(&url.URL{
                  Scheme: "https",
                  Host:   "mixpanel.com",
          })

  fmt.Println("Proxy server running on port 9000")
  http.HandleFunc("/g-a/", gaProxy.ServeHTTP)
  http.HandleFunc("/s-h-j/", shjProxy.ServeHTTP)
  http.HandleFunc("/v-h-j/", vhjProxy.ServeHTTP)
  http.HandleFunc("/a-m-p/", apiMpProxy.ServeHTTP)
  http.HandleFunc("/m-p/", mpProxy.ServeHTTP)
  http.ListenAndServe(":9000", nil)
}
