package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var templates = template.Must(template.ParseGlob("./templates/*.html"))

func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	err := templates.ExecuteTemplate(w, tmpl, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		// Parse form data
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Unable to parse form", http.StatusBadRequest)
			return
		}

		// Retrieve form values
		name := r.FormValue("name")
		email := r.FormValue("email")
		message := r.FormValue("message")

		// Log form data for now (or send an email/store in a database)
		log.Printf("Received contact form submission: Name=%s, Email=%s, Message=%s\n", name, email, message)

		// Send a response or redirect to a thank you page
		http.Redirect(w, r, "/thank-you", http.StatusSeeOther)
	} else {
		// Render contact page if accessed with GET
		renderTemplate(w, "contact.html", nil)
	}
}

func thankYouHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "<html><body><h1>Thank You!</h1><p>Thank you for reaching out, %s. I'll get back to you soon!</p></body></html>", r.URL.Query().Get("name"))
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		renderTemplate(w, "index.html", nil)
	})
	http.HandleFunc("/contact", contactHandler)
	http.HandleFunc("/thank-you", thankYouHandler)

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
