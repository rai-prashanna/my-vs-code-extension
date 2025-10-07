Ruby on Rails (often just called Rails) is a Model-View-Controller (MVC) web framework. Its architecture is designed to promote separation of concerns, convention over configuration, and DRY (Don't Repeat Yourself) principles.

Here are the important layers (or components) of the Ruby on Rails framework:

1. Model Layer

Purpose: Handles the business logic and database interaction.

Core Component: ActiveRecord

This is Rails' Object-Relational Mapping (ORM) layer.

Models represent database tables and provide methods to create, read, update, and delete (CRUD) records.

Example: A User model maps to a users table in the database.

2. View Layer

Purpose: Handles the presentation logic — what the user sees (HTML, CSS, JS).

Core Component: ActionView

Responsible for rendering templates, partials, layouts.

Supports embedded Ruby (.erb) and other templating systems like Haml or Slim.

Example: app/views/users/show.html.erb displays a specific user's profile.

3. Controller Layer

Purpose: Handles user requests, fetches data from models, and passes it to views.

Core Component: ActionController

Manages the request/response cycle.

Defines actions (e.g., index, show, create) that are mapped to routes.

Example: UsersController has an action show to render a specific user's profile.

4. Routing Layer

Purpose: Maps HTTP requests to controller actions.

Core Component: ActionDispatch::Routing

Defined in config/routes.rb

Supports RESTful routes, nested routes, concerns, namespaces, etc.

Example: get '/users/:id' => 'users#show'

5. ActiveSupport Layer

Purpose: Provides utility classes and extensions to Ruby core classes.

Includes: Time zones, string inflections, callbacks, concerns, etc.

Example: 2.days.ago, String#titleize

6. Middleware Layer

Purpose: Processes requests and responses before reaching the controller or returning to the browser.

Core Component: Rack middleware stack.

Handles tasks like sessions, cookies, parameter parsing, etc.

Example: Rack::Runtime, ActionDispatch::Cookies

7. Database Layer

Purpose: Defines database schema and migrations.

Tools:

Migrations (db/migrate/)

Schema (db/schema.rb or db/structure.sql)

Works closely with ActiveRecord to manage schema changes.

| Layer         | Component          | Purpose                             |
| ------------- | ------------------ | ----------------------------------- |
| Model         | `ActiveRecord`     | Business logic, DB interaction      |
| View          | `ActionView`       | Rendering HTML, UI templates        |
| Controller    | `ActionController` | Request handling, data coordination |
| Routing       | `ActionDispatch`   | Maps URLs to controller actions     |
| ActiveSupport | `ActiveSupport`    | Utilities and Ruby core extensions  |
| Middleware    | `Rack Middleware`  | Pre-processing HTTP requests        |
| Database      | Migrations, Schema | Schema definition and versioning    |
