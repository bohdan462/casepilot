# CasePilot - Design Specification
## Internal Law Firm Management Application

---

## 1. Screen Inventory

### Core Screens
1. **Login / Authentication** - Email/password entry with firm branding
2. **Dashboard (Home)** - Role-specific overview with cases, tasks, and activity
3. **Cases List** - Filterable table/card view of all accessible cases
4. **Case Detail View** - Comprehensive case management with tabs (Overview, Tasks, Documents, Notes)
5. **Tasks View (Global)** - All tasks across cases with filtering and status management
6. **Clients List** - Directory of all clients with case counts
7. **Client Detail** - Individual client information and associated cases
8. **Notifications Panel** - In-app notification center (dropdown/panel)
9. **Settings / Profile** - User preferences and account management
10. **Admin / User Management** - Owner-only user administration (invite, roles, deactivate)

---

## 2. Navigation Structure

### Layout Approach: **Sidebar + Topbar Hybrid**

**Topbar (Fixed, Full Width)**
- Left: CasePilot logo (clickable → Dashboard)
- Center: Global search bar (search cases, clients, tasks)
- Right: 
  - Notifications bell icon (with unread count badge)
  - User avatar dropdown (Profile, Settings, Logout)
  - Role indicator badge (Owner/Lawyer/Assistant)

**Left Sidebar (Collapsible, ~240px when expanded)**
- Navigation menu items:
  - Dashboard (icon: home)
  - Cases (icon: briefcase)
  - Tasks (icon: checklist)
  - Clients (icon: users)
  - Calendar (icon: calendar) - *Future feature, grayed out*
  - [Divider]
  - Admin (icon: shield) - *Owner only, visually distinct*
  - Settings (icon: gear)

**Breadcrumbs** (Below topbar, above main content)
- Shows: Dashboard > Cases > [Case Name]
- Clickable navigation path

**Responsive Behavior**
- On tablet: Sidebar collapses to icon-only mode
- On mobile: Sidebar becomes hamburger menu overlay

---

## 3. Detailed Screen Wireframes

### 3.1 Login / Authentication

**Layout: Centered card on full-screen background**

**Components:**
- Top section:
  - Law firm logo (large, centered)
  - Tagline: "CasePilot – Your firm's control center"
  - Subtitle: "Internal case management system"
- Middle section (white card, ~400px wide):
  - Email input field (full width, placeholder: "your.email@firm.com")
  - Password input field (full width, show/hide toggle)
  - "Remember me" checkbox
  - "Sign In" button (primary, full width)
- Bottom section:
  - "Forgot password?" link (grayed out, disabled state with tooltip: "Coming soon")
  - "Single Sign-On" link (grayed out, disabled state with tooltip: "Coming soon")

**Visual Notes:**
- Professional, clean aesthetic
- Subtle background pattern or gradient
- Error messages appear below form fields in red

---

### 3.2 Dashboard (Home)

**Layout: Three-column grid with responsive stacking**

**Header Section:**
- Page title: "Dashboard"
- Date range filter tabs: "All", "Today", "This Week", "This Month"
- Role-specific subtitle:
  - Owner: "Firm Overview"
  - Lawyer: "My Cases & Tasks"
  - Assistant: "My Assignments"

**Main Content Area (varies by role):**

**For Owner:**
- **Top Row - Metrics Cards (4 cards, equal width):**
  - Total Open Cases (number, trend indicator)
  - Active Tasks (number, breakdown by status)
  - Overdue Tasks (number, red highlight if > 0)
  - Active Users (number of logged-in users today)
- **Second Row - Two Column Layout:**
  - Left (60%): "All Open Cases" table (compact, 5 rows, "View All" link)
    - Columns: Case ID, Client, Attorney, Status, Next Deadline
  - Right (40%): "Tasks by User" widget
    - List of users with task counts (expandable to see task details)
- **Third Row:**
  - "Recent Activity" feed (full width)
    - Timeline-style list: "Document X uploaded to Case Y", "Task Z completed", etc.
    - Each item clickable → navigates to relevant case

**For Lawyer:**
- **Top Row - Two Cards:**
  - "My Open Cases" (count, link to cases list)
  - "My Tasks" (count, breakdown: Overdue, Due Today, Upcoming)
- **Second Row - Two Column Layout:**
  - Left (60%): "My Cases" table (compact, 5 most recent)
    - Columns: Case ID, Client, Status, Next Deadline, Actions
  - Right (40%): "My Tasks" list
    - Grouped by: Overdue (red), Due Today (yellow), Upcoming (gray)
    - Each task: title, case name, due date, status badge
- **Third Row:**
  - "Recent Activity" feed (same as Owner, but filtered to user's cases)

**For Assistant:**
- **Top Row - Single Card:**
  - "My Tasks" (count, breakdown: Overdue, Due Today, Upcoming)
- **Main Content - Single Column:**
  - "My Tasks" list (full width)
    - Grouped by: Overdue, Due Today, Upcoming
    - Each task: title, case name, assigned by (lawyer name), due date, status badge
    - Click task → navigates to case detail, scrolls to that task
  - "Assigned Cases" compact list (cases where assistant has tasks)
    - Case name, # of tasks, last activity

**AI-Ready Placeholder:**
- Small panel on right side (collapsible): "AI Insights (Future)"
  - Placeholder text: "AI-powered case summaries and task prioritization will appear here"

---

### 3.3 Cases List

**Layout: Full-width table with filters above**

**Header Section:**
- Left: Page title "Cases"
- Right: "New Case" button (primary, prominent)
- Below: Filter bar (horizontal, collapsible)
  - Search box (placeholder: "Search by case name, client, or ID")
  - Status dropdown (multi-select): All, Open, In Progress, Closed, On Hold
  - Attorney dropdown (multi-select): All attorneys + "Unassigned"
  - Client dropdown (searchable): All clients
  - Company dropdown (searchable): All companies
  - "Clear Filters" button
  - Filter count badge (shows active filter count)

**Main Content:**
- **Table View (default):**
  - Columns:
    - Case ID (link, monospace font)
    - Case Name (link → Case Detail)
    - Client (link → Client Detail)
    - Case Type (badge)
    - Status (colored badge: Open=blue, In Progress=yellow, Closed=gray, On Hold=orange)
    - Lead Attorney (avatar + name)
    - Next Deadline (date, red if overdue)
    - Actions (three-dot menu: Edit, Duplicate, Archive)
  - Row hover: subtle highlight
  - Click row → navigates to Case Detail
  - Pagination at bottom (20 per page)

- **Card View (toggle option, top right):**
  - Grid of cards (3 columns on desktop, 2 on tablet, 1 on mobile)
  - Each card shows: Case ID, Name, Client, Status badge, Attorney avatar, Next deadline
  - Click card → navigates to Case Detail

**Bulk Actions (Owner only, appears when rows selected):**
- Floating action bar: "Archive Selected", "Change Status", "Assign Attorney"

**Empty State:**
- Illustration + message: "No cases found. Create your first case to get started."
- "New Case" button

---

### 3.4 Case Detail View

**This is the most important screen - comprehensive layout with tabs**

**Header Section (Fixed, scrolls with page):**
- Left:
  - Case ID (large, monospace): "CASE-2024-001"
  - Case Name (editable inline or via "Edit" button): "Smith v. Insurance Co."
  - Status dropdown (inline, colored): Open / In Progress / Closed / On Hold
- Right:
  - Client name (link, prominent): "John Smith" → Client Detail
  - Primary Attorney: Avatar + name (clickable → user profile)
  - Assistant(s): Avatar chips (if assigned)
  - Key dates (compact):
    - Opened: [date]
    - Next hearing: [date] (highlighted if upcoming)
    - Statute of limitations: [date] (red if approaching)
  - Action buttons (horizontal):
    - "Edit Case" (secondary)
    - "Add Task" (primary)
    - "Upload Document" (primary)
    - Three-dot menu: "Duplicate Case", "Archive", "Delete" (Owner only)

**Tab Navigation (Below header, sticky on scroll):**
- Tabs: Overview | Tasks | Documents | Notes | Timeline (future)
- Active tab indicator (underline)
- Tab badges: Tasks (count), Documents (count)

**Tab Content Areas:**

#### Tab 1: Overview
**Layout: Two-column (70/30 split)**

**Left Column (Main Content):**
- **Case Information Card:**
  - Case Type (dropdown, editable)
  - Description (textarea, editable)
  - Related Companies section:
    - Insurer: [Company name, link]
    - Bank: [Company name, link]
    - Medical Provider: [Company name, link]
    - "+ Add Company" button
  - Custom fields section (expandable):
    - Key-value pairs (e.g., "Court", "Judge", "Case Number")
    - "+ Add Field" button

- **Quick Stats Widget:**
  - Three metrics in row:
    - Open Tasks: [count, link to Tasks tab]
    - Documents: [count, link to Documents tab]
    - Last Updated: [date/time]

**Right Column (Sidebar):**
- **AI Summary Panel (Future) - Collapsible:**
  - Header: "AI Summary (Coming Soon)"
  - Placeholder content: "AI-powered case summaries, key dates, and action items will appear here."
  - Visual: Subtle gradient background, icon placeholder

- **Case Timeline (Compact):**
  - Vertical timeline of key events:
    - Case opened
    - Documents uploaded (last 3)
    - Tasks completed (last 3)
    - Status changes
  - "View Full Timeline" link (future feature)

- **Team Members:**
  - Primary Attorney (avatar + name, role badge)
  - Assistants (avatar chips)
  - "+ Assign Team Member" button (Lawyer/Owner only)

#### Tab 2: Tasks
**Layout: Kanban board or List view (toggle)**

**View Toggle (Top right):**
- Icons: Board view | List view

**Board View (Default):**
- Three columns (equal width):
  - "To Do" (gray header)
  - "In Progress" (yellow header)
  - "Done" (green header, collapsed by default)
- Task cards (draggable between columns):
  - Task title (bold, link to expand)
  - Assignee (avatar + name)
  - Due date (red if overdue, yellow if today)
  - Priority badge (High/Medium/Low)
  - Case context (subtle, "Part of: [Case Name]")
  - Three-dot menu: Edit, Reassign, Delete
- "+ Add Task" button in "To Do" column
- Filter bar above board:
  - "My Tasks" toggle
  - "All Tasks" (default)
  - Priority filter
  - Assignee filter

**List View (Alternative):**
- Table format:
  - Columns: Title, Assignee, Due Date, Priority, Status, Actions
  - Sortable columns
  - Bulk selection checkbox
  - "+ Add Task" button (top right)

**Task Detail Modal (Opens on card click):**
- Title (editable)
- Description (textarea)
- Assignee dropdown
- Due date picker
- Priority dropdown
- Status dropdown
- Related case (read-only, link)
- "Save" / "Cancel" buttons

#### Tab 3: Documents
**Layout: Table with upload area**

**Top Section:**
- Left: "Documents" title + count badge
- Right: "Upload Document" button (primary)
- Filter bar:
  - Search box (search by name, type)
  - Type filter dropdown: All, Medical Report, Legal Document, Correspondence, Other
  - Date range picker
  - Sort: Newest first / Oldest first / Name A-Z

**Main Content:**
- **Documents Table:**
  - Columns:
    - Name (link, opens in new tab/viewer)
    - Type (badge)
    - Category (if applicable)
    - Uploaded by (avatar + name)
    - Upload date
    - Size
    - Actions (three-dot menu: Download, Rename, Delete, Move)
  - Row hover: highlight
  - Click name → opens document viewer (PDF viewer, or download)

- **AI Document Assistant Panel (Future) - Collapsible sidebar:**
  - Header: "AI Document Assistant (Coming Soon)"
  - Placeholder features:
    - "Summarize all documents"
    - "Find missing documents"
    - "Extract key dates and facts"
  - Visual: Icon + subtle background

**Empty State:**
- Illustration + "No documents yet. Upload your first document to get started."

#### Tab 4: Notes
**Layout: Comment thread style**

**Top Section:**
- "Notes" title + count badge
- Filter: "All Notes" / "Pinned Only"
- Sort: Newest first / Oldest first

**Main Content:**
- **Notes Thread (Reverse chronological, newest at top):**
  - Each note card:
    - Header: Author avatar + name, timestamp, "Pinned" badge (if pinned)
    - Body: Note text (editable if author, or read-only)
    - Footer: 
      - Actions: Edit (if author), Pin/Unpin (Lawyer/Owner), Delete (if author/Owner)
      - Reply button (future: threaded replies)
  - Pinned notes appear at top with distinct styling (border, icon)

- **Add Note Section (Bottom, sticky):**
  - Textarea (expands on focus)
  - Formatting toolbar (bold, italic, bullet list) - optional
  - "@ Mention" button (future: tag users)
  - "Add Note" button (primary)
  - Character count (optional)

**Empty State:**
- "No notes yet. Add your first note to start the conversation."

---

### 3.5 Tasks View (Global)

**Layout: Full-width table with filters**

**Header Section:**
- Left: "Tasks" title
- Right: View toggle (List / Board) + "New Task" button

**Filter Bar:**
- Status: All, To Do, In Progress, Done, Overdue
- Assignee: "My Tasks" (default for non-Owner), "All Tasks" (Owner), or specific user
- Case: Dropdown (all cases)
- Priority: All, High, Medium, Low
- Due Date: All, Overdue, Today, This Week, This Month
- "Clear Filters" button

**Main Content:**

**List View (Default):**
- Table:
  - Columns:
    - Checkbox (bulk selection)
    - Task Title (link → Case Detail, scrolls to task)
    - Case (link → Case Detail)
    - Assignee (avatar + name)
    - Due Date (color-coded: red=overdue, yellow=today)
    - Priority (badge)
    - Status (badge, editable dropdown)
    - Actions (three-dot menu: Edit, Reassign, Complete, Delete)
  - Sortable columns
  - Row hover: highlight
  - Bulk actions bar (appears when rows selected):
    - "Mark Complete", "Reassign", "Change Priority", "Delete"

**Board View (Alternative):**
- Same Kanban layout as Case Detail > Tasks tab, but shows all tasks across all cases
- Grouping option: By Status (default) / By Case / By Assignee

**Empty State:**
- "No tasks found. Create a task or check your filters."

---

### 3.6 Clients List & Detail

#### Clients List
**Layout: Table with search**

**Header:**
- "Clients" title
- "New Client" button (Owner/Lawyer only)
- Search box (full width, placeholder: "Search clients by name, email, or phone")

**Main Content:**
- **Table:**
  - Columns:
    - Name (link → Client Detail)
    - Email
    - Phone
    - Cases Count (badge, link → filtered Cases List)
    - Last Activity (date)
    - Status (Active / Inactive)
    - Actions (three-dot menu: Edit, View Cases, Archive)
  - Sortable columns
  - Pagination

**Empty State:**
- "No clients found. Add your first client to get started."

#### Client Detail
**Layout: Two-column (70/30)**

**Left Column:**
- **Client Information Card:**
  - Name (editable)
  - Contact Information:
    - Email (editable)
    - Phone (editable)
    - Address (editable, multi-line)
  - Additional fields (expandable):
    - Date of Birth, SSN (masked), etc.
  - "Edit" button

- **Cases Section:**
  - "Cases for [Client Name]" header
  - Table (compact):
    - Columns: Case ID, Case Name, Status, Lead Attorney, Last Activity
    - Click row → Case Detail
  - "New Case" button (creates case pre-filled with this client)

**Right Column:**
- **Quick Stats:**
  - Total Cases (count)
  - Active Cases (count)
  - Closed Cases (count)
- **Recent Activity:**
  - Timeline of recent case updates, document uploads, etc.

---

### 3.7 Notifications Panel

**Layout: Dropdown panel (right-aligned from bell icon)**

**Trigger:**
- Bell icon in topbar
- Red badge with unread count (if > 0)
- Click → opens panel

**Panel (Width: ~400px, Max height: 600px, scrollable)**
- Header:
  - "Notifications" title
  - "Mark all as read" button (if unread exist)
  - "Settings" icon (link to notification preferences)
- Content:
  - Grouped by time: "Today", "Yesterday", "This Week", "Older"
  - Each notification item:
    - Icon (task, document, case, etc.)
    - Title (bold): "New task assigned", "Document uploaded", etc.
    - Description: Context (case name, task title, etc.)
    - Timestamp (relative: "2 hours ago")
    - Unread indicator (blue dot on left)
    - Click → navigates to relevant case/task, marks as read
  - Empty state: "No notifications"
- Footer:
  - "View All Notifications" link (future: dedicated page)

**Notification Types:**
- Task assigned to you
- Task due today / overdue
- Document uploaded to your case
- Case status changed
- Note added to your case
- @ Mention in note (future)

---

### 3.8 Settings / Profile

**Layout: Tabbed interface**

**Tabs:**
- Profile
- Notifications
- Preferences
- Firm Settings (Owner only)

#### Profile Tab
- **Personal Information:**
  - Avatar upload (circular, preview)
  - Name (editable)
  - Email (read-only, or editable with verification)
  - Role badge (read-only)
  - "Change Password" button (opens modal)

#### Notifications Tab
- **In-App Notifications:**
  - Toggle switches:
    - Task assignments
    - Task due reminders
    - Document uploads
    - Case status changes
    - Mentions (future)
- **Email Notifications:**
  - Same toggles as above
  - "Email digest" frequency: Daily / Weekly / Never

#### Preferences Tab
- **Display:**
  - Date format (dropdown)
  - Time zone (dropdown)
  - Theme (Light / Dark - future)
- **Default Views:**
  - Tasks view: List / Board
  - Cases view: Table / Cards

#### Firm Settings Tab (Owner only)
- **Case Management:**
  - Default case types (list, add/edit/delete)
  - Default task templates (list, add/edit/delete)
  - Case numbering format (e.g., "CASE-YYYY-###")
- **User Management:**
  - Link to Admin / User Management page
- **Integrations (Future):**
  - Placeholder sections for future integrations

---

### 3.9 Admin / User Management (Owner only)

**Layout: Full-width table with invite section**

**Header:**
- "User Management" title
- "Invite User" button (primary, prominent)

**Invite User Modal (Opens from button):**
- Form:
  - Email input
  - Name input
  - Role dropdown: Lawyer / Assistant
  - "Send Invitation" button
- Success message: "Invitation sent to [email]"

**Main Content:**
- **Users Table:**
  - Columns:
    - Avatar + Name
    - Email
    - Role (badge: Owner / Lawyer / Assistant)
    - Status (Active / Inactive badge)
    - Last Login (date/time, or "Never")
    - Cases Count (link → filtered Cases List)
    - Tasks Count (link → filtered Tasks List)
    - Actions (three-dot menu):
      - Change Role (Owner only, except can't change Owner role)
      - Deactivate / Activate
      - Resend Invitation (if pending)
      - Delete (Owner only, with confirmation)
  - Sortable columns
  - Filter bar:
    - Role filter
    - Status filter
    - Search by name/email

**Empty State:**
- "No users found. Invite your first team member."

**Visual Distinction:**
- This section has a slightly different header color or border to indicate administrative area
- Warning icons for destructive actions

---

## 4. Role-Based UI Differences

### 4.1 Navigation Differences

**Owner:**
- Full sidebar navigation (all items visible)
- "Admin" section prominent, not grayed out
- "Reports" link in Admin section (future)

**Lawyer:**
- Full sidebar navigation except "Admin" section (hidden)
- All case/task management features visible
- Can create cases, tasks, documents

**Assistant:**
- Sidebar shows: Dashboard, Tasks, Clients (read-only), Settings
- "Cases" link may be hidden or show only assigned cases
- "Admin" section hidden
- Limited creation abilities (can add notes, upload documents to assigned cases)

### 4.2 Dashboard Differences

**Owner:**
- Firm-wide metrics (all cases, all tasks, all users)
- "All Open Cases" table (not filtered)
- "Tasks by User" breakdown widget
- Can see activity across entire firm

**Lawyer:**
- "My Cases" and "My Tasks" (filtered to assigned items)
- Focus on personal workload
- Can see cases where they are team member

**Assistant:**
- "My Tasks" focus (primary view)
- "Assigned Cases" compact list (cases with assigned tasks)
- No firm-wide metrics
- Simpler, task-focused interface

### 4.3 Case Detail Differences

**Owner:**
- Full access to all fields
- Can edit any case
- Can assign/unassign any attorney or assistant
- Can delete cases
- Sees all tasks and documents

**Lawyer:**
- Can edit cases where they are primary attorney or team member
- Can create tasks and assign to assistants
- Can upload documents
- Can edit notes
- Cannot delete cases (or only with confirmation)

**Assistant:**
- Read-only access to most case fields (or limited editing)
- Can update task status for assigned tasks
- Can upload documents
- Can add notes
- Cannot change case status or assign attorneys
- Financial/sensitive fields may be hidden or read-only

### 4.4 Tasks View Differences

**Owner:**
- Sees all tasks across all cases
- Can filter by any assignee
- Can reassign any task
- Bulk actions available

**Lawyer:**
- Sees tasks in their cases (default filter)
- Can create tasks
- Can reassign tasks to assistants
- Can edit tasks in their cases

**Assistant:**
- Sees only tasks assigned to them (default filter)
- Can update task status
- Can add notes to tasks
- Cannot reassign tasks (or limited ability)
- Cannot create tasks (or can create but must assign to lawyer for approval)

### 4.5 Visual Indicators

- **Role Badge:** Small badge in topbar showing current role
- **Permission Indicators:** 
  - Disabled/grayed buttons for actions user cannot perform
  - Tooltips on hover: "Only Owners can perform this action"
  - Lock icons on restricted sections
- **Contextual Help:** 
  - Info icons explaining why certain features are unavailable
  - "Contact your administrator" messages where appropriate

---

## 5. AI-Ready Design Notes

### 5.1 Reserved UI Spaces

**Case Detail > Overview Tab:**
- Right sidebar panel: "AI Summary" (collapsible)
  - Placeholder: "AI-powered case summaries and insights will appear here"
  - Size: ~300px wide, expandable
  - Visual: Subtle border, icon, placeholder text

**Case Detail > Documents Tab:**
- Right sidebar panel: "AI Document Assistant" (collapsible)
  - Placeholder features:
    - "Summarize all documents"
    - "Extract key dates and facts"
    - "Find missing documents"
    - "Generate case timeline"
  - Visual: Icon + feature list (grayed out, disabled state)

**Dashboard:**
- Optional panel (collapsible): "AI Insights" (right side)
  - Placeholder: "AI-powered task prioritization and case recommendations"
  - Can be hidden by default, shown via preference

**Tasks View:**
- Optional filter/action: "AI Suggested Priority" (future)
  - Placeholder in filter dropdown (disabled)

**Global Search:**
- Future enhancement: "AI Search" toggle
  - Placeholder in search bar: "Search or ask AI..." (disabled state)

### 5.2 Design Principles for AI Integration

1. **Non-Intrusive:** AI features should be optional panels that don't disrupt core workflow
2. **Clear Boundaries:** Use visual separation (borders, backgrounds) to distinguish AI sections
3. **Progressive Disclosure:** AI panels should be collapsible/hideable
4. **Trust Indicators:** When AI features are added, include:
   - Confidence indicators
   - Source citations
   - "Regenerate" or "Verify" buttons
5. **Consistent Placement:** Reserve similar positions across screens for AI features (e.g., right sidebar)

### 5.3 Future AI Feature Areas (Not in MVP)

- **Case Overview AI Summary:**
  - Key facts extraction
  - Timeline generation
  - Risk assessment
  - Next steps suggestions

- **Document AI Assistant:**
  - Document summarization
  - Key information extraction
  - Missing document detection
  - Document comparison

- **Task AI Assistant:**
  - Task prioritization suggestions
  - Deadline recommendations
  - Task dependency detection
  - Workload balancing

- **Search AI:**
  - Natural language queries
  - Semantic search across cases
  - Question answering

---

## 6. Design Recommendations

### 6.1 Clarity and Workflow

1. **Quick Actions:**
   - Floating action button (FAB) on Case Detail for "Add Task" (always visible)
   - Keyboard shortcuts tooltip (future: Cmd+K command palette)
   - Right-click context menus on cases/tasks for quick actions

2. **Status Visibility:**
   - Color-coded status badges throughout (consistent color scheme)
   - Overdue items: Red highlight, bold text
   - Due today: Yellow/orange highlight
   - Visual hierarchy: Important items larger, more prominent

3. **Navigation Efficiency:**
   - Breadcrumbs for deep navigation
   - "Back" button in browser works correctly
   - Recent items quick access (dropdown from logo)
   - Keyboard navigation support (Tab order, Enter to submit)

4. **Information Density:**
   - Compact tables with hover details
   - Expandable rows for additional info
   - Progressive disclosure: Show summary, expand for details
   - Responsive tables: Horizontal scroll on mobile, or card view

5. **Error Prevention:**
   - Confirmation dialogs for destructive actions
   - Auto-save for forms (with indicator)
   - Validation messages inline (not just on submit)
   - Undo/redo for critical actions (future)

6. **Professional Aesthetic:**
   - Clean, modern design (not overly playful)
   - Consistent spacing (8px grid system)
   - Professional color palette (blues, grays, subtle accents)
   - Readable typography (sans-serif for UI, serif optional for documents)
   - Subtle shadows and borders (not flat, but not heavy)

### 6.2 Mobile/Responsive Considerations

- **Breakpoints:**
  - Desktop: >1024px (full layout)
  - Tablet: 768px-1024px (collapsed sidebar, adjusted columns)
  - Mobile: <768px (stacked layout, hamburger menu)

- **Touch Targets:**
  - Minimum 44px x 44px for buttons/links
  - Adequate spacing between interactive elements

- **Mobile-Specific:**
  - Bottom navigation bar (optional, for quick access)
  - Swipe gestures for task status changes (future)
  - Simplified filters (accordion-style)

### 6.3 Accessibility

- **WCAG 2.1 AA Compliance:**
  - Sufficient color contrast (4.5:1 for text)
  - Keyboard navigation support
  - Screen reader labels (aria-labels)
  - Focus indicators (visible outlines)
  - Alt text for icons/images

- **User Preferences:**
  - Font size adjustment (future)
  - High contrast mode (future)
  - Reduced motion option (future)

---

## 7. Implementation Notes

### 7.1 Technical Considerations

- **State Management:**
  - Global state for user role/permissions
  - Local state for filters, UI preferences
  - URL state for deep linking (case IDs, filters in query params)

- **Performance:**
  - Lazy loading for document previews
  - Pagination for large lists
  - Virtual scrolling for very long lists (future)
  - Optimistic UI updates for status changes

- **Data Fetching:**
  - REST API endpoints per entity (cases, tasks, documents, etc.)
  - JWT authentication in headers
  - Role-based API responses (backend filters data by permission)

### 7.2 Future Enhancements (Not in MVP)

- Calendar view for deadlines and hearings
- Email integration (send/receive case-related emails)
- Document templates
- Time tracking
- Billing integration
- Client portal (external-facing)
- Mobile app (native)
- Advanced reporting and analytics
- Workflow automation
- Integration with legal research tools

---

## Summary

This specification provides a comprehensive foundation for building CasePilot. The design prioritizes:

1. **Clarity:** Easy to understand what's happening and what actions are available
2. **Efficiency:** Quick navigation and task completion
3. **Role Awareness:** UI adapts to user permissions
4. **Scalability:** Room for AI features and future enhancements
5. **Professionalism:** Clean, trustworthy interface suitable for legal professionals

The wireframe descriptions should be sufficient for a designer to create high-fidelity mockups, and for a developer to understand the component structure and user flows.




