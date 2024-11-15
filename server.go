package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"gopkg.in/gomail.v2"
)

var templates = template.Must(template.ParseGlob("./*.html"))

func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	err := templates.ExecuteTemplate(w, tmpl, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Home Page Handler
func homeHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "index.html", nil)
}

// Contact Page Handler
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

		// Configure email settings
		m := gomail.NewMessage()
		m.SetHeader("From", "your-email@example.com")
		m.SetHeader("To", "destination-email@example.com")
		m.SetHeader("Subject", "New Contact Form Submission")
		m.SetBody("text/plain", fmt.Sprintf("Name: %s\nEmail: %s\nMessage: %s", name, email, message))

		// Set up the SMTP server
		d := gomail.NewDialer("gmail.com", 587, "ferdinandodhis254@gmail.com", "123456")

		// Send the email
		if err := d.DialAndSend(m); err != nil {
			log.Println("Failed to send email:", err)
			http.Error(w, "Failed to send email", http.StatusInternalServerError)
			return
		}

		// Redirect to thank-you page after successful submission
		http.Redirect(w, r, "/thank-you", http.StatusSeeOther)
	} else {
		renderTemplate(w, "contact.html", nil)
	}
}

// // Thank You Page Handler
// func thankYouHandler(w http.ResponseWriter, r *http.Request) {
// 	renderTemplate(w, "thank-you.html", nil)
// }

// Additional Page Handlers
func aboutHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "about.html", nil)
}

func experienceHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "experience.html", nil)
}

func skillsHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "skills.html", nil)
}

func projectHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "project.html", nil)
}

func blogHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "blog.html", nil)
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/contact", contactHandler)
	// http.HandleFunc("/thank-you", thankYouHandler)
	http.HandleFunc("/about", aboutHandler)
	http.HandleFunc("/project", projectHandler)
	http.HandleFunc("/skills", skillsHandler)
	http.HandleFunc("/blog", blogHandler)
	http.HandleFunc("/experience", experienceHandler)

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
