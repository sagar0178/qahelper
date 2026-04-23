"""
AI logic for generating test cases, edge cases, and QA checklist
from a plain-English software requirement.

This module uses deterministic rule-based generation enhanced with
keyword analysis to produce meaningful, requirement-specific outputs
without relying on an external LLM API.
"""

import re
from typing import List, Dict, Any


# ── Helpers ──────────────────────────────────────────────────────────────────

def _title(s: str) -> str:
    """Capitalise the first letter of a string."""
    return s[0].upper() + s[1:] if s else s


def _detect_keywords(requirement: str) -> Dict[str, bool]:
    """
    Scan the requirement text for domain-specific keywords.
    Returns a dict of boolean flags used to tailor generated content.
    """
    text = requirement.lower()
    return {
        "auth":        any(k in text for k in ["login", "logout", "sign in", "sign up", "register", "auth", "password", "credential"]),
        "form":        any(k in text for k in ["form", "input", "field", "submit", "fill"]),
        "search":      any(k in text for k in ["search", "filter", "query", "find"]),
        "upload":      any(k in text for k in ["upload", "file", "attachment", "image", "document"]),
        "payment":     any(k in text for k in ["payment", "pay", "checkout", "cart", "order", "purchase", "billing"]),
        "api":         any(k in text for k in ["api", "endpoint", "request", "response", "rest", "graphql"]),
        "user_mgmt":   any(k in text for k in ["user", "profile", "account", "admin", "role", "permission"]),
        "data":        any(k in text for k in ["data", "record", "database", "crud", "create", "update", "delete", "edit"]),
        "notification":any(k in text for k in ["notification", "email", "sms", "alert", "message"]),
        "report":      any(k in text for k in ["report", "export", "download", "csv", "pdf", "analytics"]),
        "navigation":  any(k in text for k in ["navigate", "redirect", "link", "menu", "page"]),
        "mobile":      any(k in text for k in ["mobile", "responsive", "tablet", "device"]),
    }


def _extract_action(requirement: str) -> str:
    """Try to extract the primary action verb phrase from the requirement."""
    patterns = [
        r"(?:user|admin|system)\s+(?:should\s+be\s+able\s+to|can|must)\s+(.+)",
        r"(?:ability|feature)\s+to\s+(.+)",
        r"(?:allow|enable|implement)\s+(.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, requirement.lower())
        if match:
            return _title(match.group(1).strip().rstrip("."))
    # Fallback: use the entire requirement
    return _title(requirement.strip().rstrip("."))


# ── Test-case generation ──────────────────────────────────────────────────────

def _generate_test_cases(requirement: str, kw: Dict[str, bool]) -> List[Dict[str, Any]]:
    """
    Produce a list of test-case dicts tailored to the detected keywords.
    Every test case follows the schema used by the frontend.
    """
    action = _extract_action(requirement)
    cases: List[Dict[str, Any]] = []
    tc_id = 1

    def add(title: str, preconditions: List[str], steps: List[str],
            test_data: str, expected_result: str) -> None:
        nonlocal tc_id
        cases.append({
            "id": f"TC{tc_id:03d}",
            "title": title if title.lower().startswith("verify") else f"Verify that {title[0].lower() + title[1:]}",
            "preconditions": preconditions,
            "steps": steps,
            "test_data": test_data,
            "expected_result": expected_result if expected_result.lower().startswith(("user should", "system should")) else f"System should {expected_result[0].lower() + expected_result[1:]}",
        })
        tc_id += 1

    # ── Generic happy-path test case (always included) ──────────────────────
    add(
        title=f"Verify that {action[0].lower() + action[1:]} works with valid input",
        preconditions=["Application is running", "User has valid credentials or access"],
        steps=[
            "Navigate to the relevant page/feature",
            "Provide valid required inputs",
            "Submit or trigger the action",
            "Observe the result",
        ],
        test_data="Valid data as per business requirements",
        expected_result="System should complete the action successfully and display a confirmation",
    )

    # ── Auth-specific test cases ─────────────────────────────────────────────
    if kw["auth"]:
        add(
            title="Verify that user can log in with valid email and password",
            preconditions=["User account exists in the system", "Application login page is accessible"],
            steps=[
                "Open the login page",
                "Enter a registered email address",
                "Enter the correct password",
                "Click the 'Login' button",
            ],
            test_data="Email: user@example.com | Password: ValidPass@123",
            expected_result="User should be redirected to the dashboard/home page after successful login",
        )
        add(
            title="Verify that login fails with an incorrect password",
            preconditions=["User account exists in the system", "Login page is accessible"],
            steps=[
                "Open the login page",
                "Enter a registered email address",
                "Enter an incorrect password",
                "Click the 'Login' button",
            ],
            test_data="Email: user@example.com | Password: WrongPassword",
            expected_result="System should display an error message: 'Invalid email or password'",
        )
        add(
            title="Verify that login fails with a non-existent email",
            preconditions=["Login page is accessible"],
            steps=[
                "Open the login page",
                "Enter an unregistered email address",
                "Enter any password",
                "Click the 'Login' button",
            ],
            test_data="Email: notregistered@example.com | Password: AnyPass@123",
            expected_result="System should display an error message indicating the account does not exist",
        )
        add(
            title="Verify that password field masks the entered characters",
            preconditions=["Login page is open"],
            steps=[
                "Locate the password input field",
                "Type any characters into the field",
                "Observe the displayed characters",
            ],
            test_data="Any password string",
            expected_result="System should display bullet/asterisk characters instead of the actual password",
        )

    # ── Form-specific test cases ─────────────────────────────────────────────
    if kw["form"]:
        add(
            title="Verify that form submission works with all required fields filled",
            preconditions=["Form page is accessible", "User is logged in (if required)"],
            steps=[
                "Navigate to the form",
                "Fill in all required fields with valid data",
                "Click the 'Submit' button",
            ],
            test_data="All required fields populated with valid values",
            expected_result="System should accept the submission and show a success message",
        )
        add(
            title="Verify that form validation prevents submission when required fields are empty",
            preconditions=["Form page is accessible"],
            steps=[
                "Navigate to the form",
                "Leave one or more required fields empty",
                "Click the 'Submit' button",
            ],
            test_data="Empty required fields",
            expected_result="System should highlight empty required fields and display validation error messages",
        )

    # ── Search-specific test cases ───────────────────────────────────────────
    if kw["search"]:
        add(
            title="Verify that search returns relevant results for a valid keyword",
            preconditions=["Application is running", "Data exists in the system"],
            steps=[
                "Navigate to the search feature",
                "Enter a valid keyword that matches existing records",
                "Click 'Search' or press Enter",
            ],
            test_data="Keyword: existing record name",
            expected_result="System should display a list of matching results",
        )
        add(
            title="Verify that search displays a 'no results' message for an unknown keyword",
            preconditions=["Application is running"],
            steps=[
                "Navigate to the search feature",
                "Enter a keyword that does not match any record",
                "Click 'Search' or press Enter",
            ],
            test_data="Keyword: xyznonexistent123",
            expected_result="System should display a 'No results found' message",
        )

    # ── Upload-specific test cases ───────────────────────────────────────────
    if kw["upload"]:
        add(
            title="Verify that a valid file can be uploaded successfully",
            preconditions=["User is logged in", "Upload feature is accessible"],
            steps=[
                "Navigate to the upload section",
                "Click 'Upload' or 'Choose File'",
                "Select a valid file from the local system",
                "Confirm the upload",
            ],
            test_data="File: valid_document.pdf (< 5 MB)",
            expected_result="System should upload the file and display a success confirmation with the file name",
        )
        add(
            title="Verify that uploading an unsupported file type is rejected",
            preconditions=["User is logged in", "Upload feature is accessible"],
            steps=[
                "Navigate to the upload section",
                "Attempt to upload a file with an unsupported extension",
                "Confirm the upload",
            ],
            test_data="File: malware.exe",
            expected_result="System should reject the upload and display an 'Invalid file type' error",
        )

    # ── Payment-specific test cases ──────────────────────────────────────────
    if kw["payment"]:
        add(
            title="Verify that payment is processed successfully with valid card details",
            preconditions=["User is logged in", "Items are in the cart", "Payment gateway is configured"],
            steps=[
                "Navigate to the checkout page",
                "Enter valid card number, expiry date, and CVV",
                "Click 'Pay Now'",
            ],
            test_data="Card: 4111111111111111 | Expiry: 12/26 | CVV: 123",
            expected_result="System should process the payment and display an order confirmation page",
        )
        add(
            title="Verify that payment fails gracefully with invalid card details",
            preconditions=["User is logged in", "Items are in the cart"],
            steps=[
                "Navigate to the checkout page",
                "Enter an invalid card number",
                "Click 'Pay Now'",
            ],
            test_data="Card: 1234567890123456 | Expiry: 01/20 | CVV: 000",
            expected_result="System should display a payment failure message and allow the user to retry",
        )

    # ── Data / CRUD test cases ───────────────────────────────────────────────
    if kw["data"]:
        add(
            title="Verify that a new record can be created with valid data",
            preconditions=["User is logged in with appropriate permissions"],
            steps=[
                "Navigate to the create/add section",
                "Fill in all required fields",
                "Click 'Save' or 'Create'",
            ],
            test_data="Valid field values as per data model",
            expected_result="System should save the new record and display it in the list",
        )
        add(
            title="Verify that an existing record can be updated",
            preconditions=["User is logged in", "At least one record exists"],
            steps=[
                "Navigate to the record list",
                "Select an existing record and click 'Edit'",
                "Modify one or more fields",
                "Click 'Save'",
            ],
            test_data="Updated field values",
            expected_result="System should persist the changes and reflect them immediately in the UI",
        )
        add(
            title="Verify that an existing record can be deleted",
            preconditions=["User is logged in with delete permissions", "At least one record exists"],
            steps=[
                "Navigate to the record list",
                "Select a record and click 'Delete'",
                "Confirm the deletion in the prompt",
            ],
            test_data="ID of an existing record",
            expected_result="System should remove the record from the database and update the list accordingly",
        )

    # ── Notification test cases ──────────────────────────────────────────────
    if kw["notification"]:
        add(
            title="Verify that a notification is sent after a successful action",
            preconditions=["User has notifications enabled", "Notification service is configured"],
            steps=[
                "Perform the action that triggers a notification",
                "Check the notification channel (email, SMS, or in-app)",
            ],
            test_data="Valid user with notification preferences set",
            expected_result="User should receive a notification containing the relevant action details",
        )

    # ── Report / export test cases ───────────────────────────────────────────
    if kw["report"]:
        add(
            title="Verify that the report is generated and downloaded successfully",
            preconditions=["User is logged in", "Data is available for the report"],
            steps=[
                "Navigate to the reports section",
                "Select the desired report type and date range",
                "Click 'Generate' or 'Export'",
            ],
            test_data="Date range: last 30 days",
            expected_result="System should generate the report file and prompt the user to download it",
        )

    return cases


# ── Edge-case generation ──────────────────────────────────────────────────────

def _generate_edge_cases(requirement: str, kw: Dict[str, bool]) -> List[str]:
    """Generate a list of edge-case strings relevant to the requirement."""
    cases: List[str] = []

    # Always include boundary and general cases
    cases += [
        "Empty input: submit the form/request with all fields left blank",
        "Whitespace-only input: fields containing only spaces or tabs",
        "Maximum length input: enter the maximum allowed characters in each text field",
        "Exceeding maximum length: enter one character more than the allowed maximum",
        "SQL injection attempt: enter ' OR '1'='1 in input fields",
        "XSS attempt: enter <script>alert('xss')</script> in text fields",
        "Special characters in input: !@#$%^&*()_+-=[]{}|;':\",./<>?",
        "Unicode / emoji characters: 😀 日本語 Ärger",
        "Very large payload: submit a request with an extremely large body",
        "Concurrent requests: simulate multiple users performing the same action simultaneously",
        "Network interruption: lose connectivity mid-action and verify graceful error handling",
        "Session expiry: perform an action after the session has timed out",
    ]

    if kw["auth"]:
        cases += [
            "Brute-force login: attempt login with 100+ consecutive wrong passwords",
            "Account lockout: verify account is locked after N failed attempts",
            "Password containing only spaces",
            "Email without '@' or domain (e.g., 'userexample.com')",
            "Email with leading/trailing spaces (e.g., ' user@example.com ')",
            "Case sensitivity: verify 'User@Example.COM' resolves to the same account as 'user@example.com'",
            "Login with a deactivated/banned account",
            "Concurrent logins from multiple devices/browsers",
        ]

    if kw["form"]:
        cases += [
            "Submit form by pressing Enter key (keyboard submission)",
            "Double-click the Submit button to check for duplicate submissions",
            "Paste extremely long text into a text area",
            "Tab through all fields and verify correct focus order (accessibility)",
        ]

    if kw["search"]:
        cases += [
            "Search with a single character (e.g., 'a')",
            "Search with only numbers",
            "Search with SQL injection string",
            "Very long search query (500+ characters)",
            "Search immediately after clearing a previous search",
        ]

    if kw["upload"]:
        cases += [
            "Upload a 0-byte (empty) file",
            "Upload a file at exactly the size limit",
            "Upload a file 1 byte over the size limit",
            "Upload a file with a double extension (e.g., 'image.png.exe')",
            "Upload the same file twice in quick succession",
            "Cancel upload mid-way and verify no partial files are stored",
        ]

    if kw["payment"]:
        cases += [
            "Payment with an expired card",
            "Payment with insufficient funds",
            "Payment session timeout before confirmation",
            "Refreshing the page during payment processing",
            "Applying an invalid or expired coupon code",
        ]

    if kw["data"]:
        cases += [
            "Create a record with the minimum required fields only",
            "Update a record with no changes and click Save",
            "Delete a record that is referenced by other records (foreign key constraint)",
            "Restore a deleted record if soft-delete is supported",
        ]

    return cases


# ── Checklist generation ──────────────────────────────────────────────────────

def _generate_checklist(requirement: str, kw: Dict[str, bool]) -> List[str]:
    """Generate a QA checklist tailored to the requirement."""
    items: List[str] = []

    # ── UI / UX ──────────────────────────────────────────────────────────────
    items += [
        "[ UI ] Page/component renders without layout breaks on desktop (1920×1080)",
        "[ UI ] Page/component is responsive on tablet (768×1024)",
        "[ UI ] Page/component is responsive on mobile (375×812)",
        "[ UI ] All interactive elements have visible focus indicators (accessibility)",
        "[ UI ] Colour contrast meets WCAG AA standard (4.5:1 for normal text)",
        "[ UI ] Loading spinner/skeleton is shown while data is being fetched",
        "[ UI ] Error messages are displayed in a user-friendly, non-technical format",
        "[ UI ] Success messages are displayed after a completed action",
        "[ UI ] Empty states are handled with informative placeholder text",
        "[ UI ] All buttons and links have clear, descriptive labels",
    ]

    # ── Functional ───────────────────────────────────────────────────────────
    items += [
        "[ Functional ] Happy path completes without errors",
        "[ Functional ] All input validations (required, format, length) are enforced",
        "[ Functional ] Business rules are correctly applied",
        "[ Functional ] Data persists correctly after page refresh",
        "[ Functional ] Navigation/routing works as expected after the action",
        "[ Functional ] Browser back/forward buttons behave correctly",
        "[ Functional ] Multiple tabs/windows do not cause data conflicts",
    ]

    # ── API ──────────────────────────────────────────────────────────────────
    items += [
        "[ API ] Correct HTTP method is used (GET/POST/PUT/DELETE)",
        "[ API ] Request payload is validated on the server side",
        "[ API ] API returns appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)",
        "[ API ] API response matches the documented schema",
        "[ API ] API handles missing/null fields gracefully",
        "[ API ] API rate limiting is enforced (if applicable)",
        "[ API ] Sensitive data is not exposed in the response body",
        "[ API ] CORS headers are correctly configured",
    ]

    # ── Security ─────────────────────────────────────────────────────────────
    items += [
        "[ Security ] Inputs are sanitised to prevent SQL injection",
        "[ Security ] Inputs are sanitised to prevent XSS",
        "[ Security ] CSRF protection is in place",
        "[ Security ] Sensitive data is encrypted in transit (HTTPS)",
        "[ Security ] Sensitive data is not stored in plain text",
    ]

    # ── Auth-specific checklist ───────────────────────────────────────────────
    if kw["auth"]:
        items += [
            "[ Auth ] JWT / session token is set with appropriate expiry",
            "[ Auth ] Logout clears all session/token data from client storage",
            "[ Auth ] Protected routes redirect unauthenticated users to login",
            "[ Auth ] Password complexity rules are enforced",
            "[ Auth ] Account lockout is triggered after repeated failed attempts",
            "[ Auth ] 'Forgot Password' flow sends email to registered address only",
            "[ Auth ] Re-authentication is required before sensitive operations",
        ]

    # ── Performance ───────────────────────────────────────────────────────────
    items += [
        "[ Performance ] Page loads within 3 seconds on a standard connection",
        "[ Performance ] API responds within 500 ms under normal load",
        "[ Performance ] No memory leaks after repeated interactions",
    ]

    if kw["upload"]:
        items += [
            "[ Upload ] Only whitelisted file types are accepted",
            "[ Upload ] File size limit is enforced client-side and server-side",
            "[ Upload ] Uploaded files are stored securely (not in a public directory)",
            "[ Upload ] Malware/virus scanning is performed on uploaded files",
        ]

    if kw["payment"]:
        items += [
            "[ Payment ] PCI-DSS compliance is verified",
            "[ Payment ] No card details are logged or stored unencrypted",
            "[ Payment ] Duplicate transaction prevention is in place",
            "[ Payment ] Transaction receipts are emailed to the user",
        ]

    # ── Accessibility ─────────────────────────────────────────────────────────
    items += [
        "[ A11y ] All images have descriptive alt text",
        "[ A11y ] Page is navigable using keyboard only",
        "[ A11y ] Screen reader announces dynamic content changes (ARIA live regions)",
        "[ A11y ] Form fields have associated <label> elements",
    ]

    return items


# ── Public API ────────────────────────────────────────────────────────────────

def generate_test_artifacts(requirement: str) -> Dict[str, Any]:
    """
    Entry point: given a requirement string, return a dict containing
    test_cases, edge_cases, and checklist.
    """
    kw = _detect_keywords(requirement)
    test_cases = _generate_test_cases(requirement, kw)
    edge_cases = _generate_edge_cases(requirement, kw)
    checklist = _generate_checklist(requirement, kw)

    return {
        "test_cases": test_cases,
        "edge_cases": edge_cases,
        "checklist": checklist,
    }
