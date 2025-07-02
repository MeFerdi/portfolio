package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	"gopkg.in/gomail.v2"
)

func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	var err error
	var t *template.Template
	if tmpl == "index.html" {
		t = template.Must(template.ParseFiles(tmpl))
	} else {
		t = template.Must(template.ParseFiles("templates/" + tmpl))
	}
	err = t.ExecuteTemplate(w, tmpl, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Home Page Handler
func homeHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "index.html", nil)
}

// Maintenance Mode Handler - redirects all other routes to home
func maintenanceHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
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
		m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
		m.SetHeader("To", "destination-email@example.com")
		m.SetHeader("Subject", "New Contact Form Submission")
		m.SetBody("text/plain", fmt.Sprintf("Name: %s\nEmail: %s\nMessage: %s", name, email, message))

		// Set up the SMTP server using environment variables
		d := gomail.NewDialer("smtp.gmail.com", 587, os.Getenv("SMTP_EMAIL"), os.Getenv("SMTP_PASSWORD"))

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

	// During maintenance mode, redirect all other routes to home
	http.HandleFunc("/contact", maintenanceHandler)
	http.HandleFunc("/about", maintenanceHandler)
	http.HandleFunc("/project", maintenanceHandler)
	http.HandleFunc("/skills", maintenanceHandler)
	http.HandleFunc("/blog", maintenanceHandler)
	http.HandleFunc("/experience", maintenanceHandler)

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Server running in maintenance mode on http://localhost:8090")
	log.Fatal(http.ListenAndServe(":8090", nil))
}
