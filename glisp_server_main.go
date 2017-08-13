package main

import (
  "fmt"
  "io"
  "io/ioutil"
  "os"
  "net/http"
  "glisp"
)

func editorJs(w http.ResponseWriter, r *http.Request) {
  f, _ := os.Open("editor.js")
  io.Copy(w, f)
}

func showFile(w http.ResponseWriter, filename string) {
  if f, err := os.Open(filename); err == nil {
    io.Copy(w, f)
  } else {
    http.Error(w, "No such resource", http.StatusNotFound)
  }
}

func slash(w http.ResponseWriter, r *http.Request) {
  if (r.URL.Path == "/") {
    showFile(w, "glisp_index.html")
  } else {
    filename := r.URL.Path[1:]
    fmt.Printf("URL: %v\n", filename)
    showFile(w, filename)
  }
}

func evalHandler(w http.ResponseWriter, r *http.Request) {
    r.ParseForm();
    if body, err := ioutil.ReadAll(r.Body); err != nil {
      fmt.Fprintf(w, "Could not read body: %v\n", err)
    } else {
      fmt.Printf("Got Body: [%v]\n", body)
      x := glisp.Process(string(body));

      fmt.Fprintf(w, "%v", x)
    }
}

func ServerMain() {
  http.HandleFunc("/eval", evalHandler)
  http.HandleFunc("/editor.js", editorJs)
  http.HandleFunc("/", slash)
  http.ListenAndServe(":8080", nil)
}

func main() {
  ServerMain()
}
