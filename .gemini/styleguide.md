# Project Style Guide

This document outlines the coding standards and best practices for our NodeJS backend and Vue 3 frontend. Adhering to these guidelines helps maintain code consistency, readability, and quality across the project.

---

## 1. General Principles

* **Readability First:** Write code that is easy to understand and follow. Prioritize clarity over cleverness.
* **Consistency:** Be consistent with existing patterns and conventions within the codebase.
* **Modularity:** Break down complex logic into smaller, reusable functions or components.
* **Testability:** Write code that is easy to test.
* **Performance:** Be mindful of performance implications, especially in critical paths.
* **Security:** Always consider security best practices, particularly on the backend.

---

## 2. Naming Conventions

* **Variables, Functions, Properties:** `camelCase` (e.g., `userName`, `calculateTotalPrice`).
* **Classes, Components (Vue):** `PascalCase` (e.g., `UserService`, `UserProfileComponent`).
* **Constants (Global/Module-level):** `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`, `API_KEY`).
* **File Names:**
    * **NodeJS:** `kebab-case` for general files (e.g., `user-controller.js`). `index.js` for entry points.
    * **Vue Components:** `PascalCase.vue` (e.g., `UserProfile.vue`).
    * **Vue Composables/Utilities:** `camelCase.js` or `kebab-case.js` (e.g., `useAuth.js`, `date-utils.js`).
* **Folders:** `kebab-case` (e.g., `user-service`, `components`).

---

## 3. Formatting

* **Indentation:** 2 spaces (no tabs).
* **Line Length:** Max 100-120 characters (soft limit, use discretion for long strings/URLs).
* **Quotes:** Single quotes `'` for strings.
* **Semicolons:** Always use semicolons `;`.
* **Trailing Commas:** Use trailing commas for multi-line arrays, objects, and function calls (ESLint/Prettier will enforce this).
* **Braces:**
    * Always use braces for `if`/`else`, `for`, `while` statements, even for single-line bodies.
    * `if (condition) { return true; }`
* **Whitespace:**
    * One space after keywords (e.g., `if (`, `for (`).
    * One space before and after binary operators (e.g., `a + b`).
    * No space inside parentheses or brackets (e.g., `func(arg)`, `arr[index]`).
    * Blank line between logical blocks of code for readability.

---

## 4. JavaScript / TypeScript (General)

* **ESM Modules:** Use `import`/`export` syntax consistently.
* **`const` and `let`:** Prefer `const` over `let`. Only use `let` if the variable needs to be reassigned. Avoid `var`.
* **Arrow Functions:** Prefer arrow functions for anonymous functions, especially in callbacks, for clearer `this` context.
* **Destructuring:** Use object and array destructuring for cleaner code.
* **Template Literals:** Prefer template literals `` ` `` for string concatenation.
* **Error Handling:**
    * Use `try...catch` blocks for synchronous error handling.
    * Use `async/await` with `try...catch` for asynchronous operations.
    * Throw descriptive `Error` objects.
* **Comments:**
    * Use `//` for single-line comments.
    * Use `/* ... */` for multi-line comments.
    * Explain *why* something is done, not just *what* it does (unless the "what" is complex).
    * Add JSDoc comments for complex functions/methods, especially in public APIs.
* **Type Safety (If TypeScript):**
    * Explicitly type function arguments and return values.
    * Avoid `any` unless absolutely necessary and justified with a comment.
    * Define interfaces or types for complex objects.

---

## 5. NodeJS Backend Specifics

* **Folder Structure:** Organize by feature or domain, rather than by type (e.g., `src/users/user.controller.js`, `src/users/user.service.js` instead of `src/controllers/user.js`, `src/services/user.js`).
* **API Design:**
    * Follow RESTful principles for APIs where appropriate.
    * Use meaningful and consistent resource names (e.g., `/users`, `/products/{id}`).
    * Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE).
    * Return consistent JSON response structures, including error messages.
* **Asynchronous Code:**
    * Prefer `async/await` over Promises `.then().catch()` chains for better readability.
    * Handle unhandled promise rejections gracefully (e.g., using `process.on('unhandledRejection')`).
* **Middleware:** Keep middleware functions small and focused on a single responsibility.
* **Configuration:** Use environment variables for sensitive data and deployment-specific settings (e.g., `dotenv` or similar). Do not hardcode secrets.
* **Logging:** Use a structured logging library (e.g., Winston, Pino) for consistent and searchable logs. Log appropriate levels (info, warn, error).
* **Database Interactions:**
    * Use an ORM/ODM (e.g., Mongoose, Sequelize, Prisma) for database interactions.
    * Sanitize and validate all user inputs to prevent injection attacks.
    * Handle database errors gracefully.

---

## 6. Vue 3 Frontend Specifics

* **SFC (Single File Components):** Always use SFCs (`.vue` files).
* **Script Setup (`<script setup>`):** Prefer `<script setup>` for better performance, simpler syntax, and improved TypeScript inference.
* **Reactivity:**
    * Use `ref()` for primitive values and `reactive()` for objects.
    * Understand when to use `toRefs()` for destructuring reactive objects.
* **Props:**
    * Define props with `defineProps` and provide type validation and default values where appropriate.
    * Use `kebab-case` for prop names in templates (e.g., `<MyComponent user-name="John"/>`) and `camelCase` in script (e.g., `props.userName`).
* **Emits:**
    * Define emitted events using `defineEmits` for clarity and validation.
    * Use `kebab-case` for event names (e.g., `update:modelValue`, `item-selected`).
* **Composables:** Extract reusable stateful logic into composable functions (e.g., `useAuth`, `useNotifications`).
* **Styling:**
    * Prefer `scoped` styles in SFCs to prevent style leakage.
    * Consider using CSS Modules or a CSS-in-JS solution for larger projects.
    * Organize styles logically within the SFC or separate files.
* **Templates:**
    * Keep templates clean and readable. Avoid excessive logic in templates; move complex computations to computed properties or methods.
    * Use `v-if`/`v-else-if`/`v-else` for conditional rendering.
    * Use `v-for` with a `key` attribute on repeated elements.
* **Lifecycle Hooks:** Understand and use lifecycle hooks appropriately (`onMounted`, `onUpdated`, `onUnmounted`, etc.).
* **Accessibility (A11y):** Strive for accessible HTML markup. Use semantic HTML elements and ARIA attributes where necessary.
* **Routing:** Use Vue Router. Define routes clearly and use lazy loading for routes to improve initial load performance.
* **State Management:** Use Pinia for state management. Organize stores logically by feature.

---

## 7. Security (Backend Focus)

* **Input Validation:** Validate and sanitize all user input on the backend (and ideally on the frontend too).
* **Authentication & Authorization:** Implement robust authentication and authorization mechanisms (e.g., JWT, OAuth).
* **Password Hashing:** Always hash passwords using a strong, slow hashing algorithm (e.g., bcrypt) with a salt.
* **CORS:** Properly configure CORS headers.
* **Rate Limiting:** Implement rate limiting to prevent abuse.
* **Dependency Security:** Regularly update dependencies and scan for known vulnerabilities (e.g., using `npm audit`).
* **Environment Variables:** Never commit sensitive information (API keys, database credentials) to version control. Use environment variables.

---

## 8. Performance

* **Frontend:**
    * Lazy load components and routes.
    * Optimize images.
    * Minimize bundle size.
    * Debounce/throttle events.
    * Efficient

