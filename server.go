// package main

// import (
// 	"log"
// 	"net/http"
// 	"path"
// 	"text/template"
// )

// var templates = template.Must(template.ParseGlob("./templates/*.html"))

// func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
// 	err := templates.ExecuteTemplate(w, tmpl, data)
// 	if err != nil {
// 		http.Error(w, "Page not found", http.StatusNotFound)
// 	}
// }

// func main() {
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		requestedPage := path.Base(r.URL.Path)
// 		if requestedPage == "/" || requestedPage == "" {
// 			requestedPage = "index" // Default to index if root or empty path
// 		}
// 		log.Printf("Serving %s page", requestedPage)
// 		renderTemplate(w, requestedPage+".html", nil)
// 	})

// 	// Serve static files for CSS, JS, images
// 	fs := http.FileServer(http.Dir("static"))
// 	http.Handle("/static/", http.StripPrefix("/static/", fs))

// 	log.Println("Server running on http://localhost:8080")
// 	log.Fatal(http.ListenAndServe(":8080", nil))
// }
