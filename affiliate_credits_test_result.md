#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================


#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Please test the new affiliate program, credits system, and payout functionality I just implemented. I've added comprehensive backend API endpoints for affiliate program, credits system, and payout functionality."

backend:
  - task: "Affiliate Program API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 1
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Implemented affiliate program API with endpoints for creating affiliate accounts, tracking referral clicks, processing signups, and getting referral statistics."
        -working: true
        -agent: "testing"
        -comment: "Tested the affiliate program API. Most endpoints work correctly: can create affiliate accounts, track referral clicks, and process signups. However, the /affiliate/{member_id}/stats endpoint returns a 500 error. Also, there's an inconsistency where the affiliate code returned by the GET endpoint is different from the one created by the POST endpoint."

  - task: "Credits System API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Implemented credits system API with endpoints for creating credit accounts, getting balances, viewing transaction history, and using credits for purchases."
        -working: true
        -agent: "testing"
        -comment: "Tested the credits system API. All endpoints work correctly: can create credit accounts, get credit balances, view transaction history, and use credits for purchases. The system properly tracks credit balances and transactions."

  - task: "Payout System API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Implemented payout system API with endpoints for creating payout accounts, requesting payouts, and admin processing of payouts."
        -working: true
        -agent: "testing"
        -comment: "Tested the payout system API. All endpoints work correctly: can create payout accounts, request payouts, get payout requests, process payouts (admin), and complete payouts (admin). The system properly tracks payout status and history."

  - task: "Shopping Cart with Credits API"
    implemented: true
    working: false
    file: "/app/backend/server.py"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Implemented shopping cart API with endpoints for getting carts, adding items, applying credits, and calculating maximum credits usable."
        -working: false
        -agent: "testing"
        -comment: "Tested the shopping cart API. Most endpoints work correctly, but there's an issue with cart subtotal not being updated when adding items. The cart subtotal remains at 0.0 even after adding items with non-zero prices. This affects the max credits usable calculation and prevents applying credits to the cart."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Affiliate Program API"
    - "Credits System API"
    - "Payout System API"
    - "Shopping Cart with Credits API"
  stuck_tasks:
    - "Affiliate Program API - Get Referral Stats"
    - "Shopping Cart with Credits API - Cart Subtotal Update"
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "testing"
    -message: "I've tested the new affiliate program, credits system, and payout functionality. Most endpoints are working correctly, but there are a few issues: 1) The /affiliate/{member_id}/stats endpoint returns a 500 error, 2) The shopping cart subtotal is not being updated correctly when adding items, and 3) The affiliate code is not consistent between creation and retrieval. The payout system is working perfectly."