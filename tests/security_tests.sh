#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:3000/api"
echo "=== ST. MARIAM THRESIA CHURCH SECURITY & RBAC VERIFICATION SUITE ==="

# 1. Login as Member A (John Demo)
echo "1. Logging in as Member A (demo.member@church.org)..."
LOGIN_MEMBER_A=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"demo.member@church.org","password":"member123"}')
TOKEN_A=$(echo "$LOGIN_MEMBER_A" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN_A" ]; then
  echo "FAIL: Could not login as Member A"
  exit 1
fi
echo "PASS: Member A logged in successfully. Token acquired."

# 2. Member A accessing Member A's own profile (DEMO-001)
echo "2. Member A accessing own profile (/members/DEMO-001)..."
STATUS_OWN=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/members/DEMO-001")
if [ "$STATUS_OWN" -eq 200 ]; then
  echo "PASS: Member A can view own profile (HTTP $STATUS_OWN)."
else
  echo "FAIL: Member A could not view own profile (HTTP $STATUS_OWN)."
  exit 1
fi

# 3. Security Boundary: Member A attempting to access Member B's profile (DEMO-010)
echo "3. Security Boundary: Member A accessing Member B profile (/members/DEMO-010)..."
STATUS_OTHER_MEMBER=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/members/DEMO-010")
if [ "$STATUS_OTHER_MEMBER" -eq 403 ]; then
  echo "PASS: Member A access to Member B profile blocked with HTTP 403 Forbidden."
else
  echo "FAIL: Expected HTTP 403, got HTTP $STATUS_OTHER_MEMBER!"
  exit 1
fi

# 4. Security Boundary: Member A accessing own family (FAM-001) vs Member B's family (FAM-002)
echo "4. Family privacy: Member A accessing own family (FAM-001)..."
STATUS_OWN_FAM=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/families/FAM-001")
if [ "$STATUS_OWN_FAM" -eq 200 ]; then
  echo "PASS: Member A can view own family."
else
  echo "FAIL: Expected HTTP 200, got HTTP $STATUS_OWN_FAM"
  exit 1
fi

echo "5. Security Boundary: Member A attempting to access Member B's family (FAM-002)..."
STATUS_OTHER_FAM=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/families/FAM-002")
if [ "$STATUS_OTHER_FAM" -eq 403 ]; then
  echo "PASS: Member A access to Member B family blocked with HTTP 403 Forbidden."
else
  echo "FAIL: Expected HTTP 403, got HTTP $STATUS_OTHER_FAM!"
  exit 1
fi

# 5. Security Boundary: Normal member attempting to access Sacramental Records
echo "6. Security Boundary: Member A accessing /sacramental-records..."
STATUS_SACRAMENTAL=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/sacramental-records")
if [ "$STATUS_SACRAMENTAL" -eq 403 ]; then
  echo "PASS: Member A access to sacramental records blocked with HTTP 403 Forbidden."
else
  echo "FAIL: Expected HTTP 403, got HTTP $STATUS_SACRAMENTAL!"
  exit 1
fi

# 6. Security Boundary: Unauthorized user attempting to download private documents
echo "7. Security Boundary: Downloading member-only document without authentication..."
STATUS_DOC_UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/documents/DOC-3/download")
if [ "$STATUS_DOC_UNAUTH" -eq 403 ]; then
  echo "PASS: Guest download of member-only document blocked with HTTP 403 Forbidden."
else
  echo "FAIL: Expected HTTP 403, got HTTP $STATUS_DOC_UNAUTH!"
  exit 1
fi

echo "8. Authenticated download: Member A downloading member-only document..."
STATUS_DOC_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/documents/DOC-3/download")
if [ "$STATUS_DOC_AUTH" -eq 200 ]; then
  echo "PASS: Member A can download member-only document."
else
  echo "FAIL: Expected HTTP 200, got HTTP $STATUS_DOC_AUTH!"
  exit 1
fi

# 7. Security Boundary: Normal member attempting to change roles / user management
echo "9. Security Boundary: Member A attempting to access /users..."
STATUS_USERS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_A" "$BASE_URL/users")
if [ "$STATUS_USERS" -eq 403 ]; then
  echo "PASS: Member A access to user management blocked with HTTP 403 Forbidden."
else
  echo "FAIL: Expected HTTP 403, got HTTP $STATUS_USERS!"
  exit 1
fi

# 8. Security Boundary: Coordinator permissions
echo "10. Logging in as Youth Coordinator..."
LOGIN_COORD=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"youth@church.org","password":"youth123"}')
TOKEN_COORD=$(echo "$LOGIN_COORD" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "11. Coordinator updating their assigned organization (ORG-YOUTH)..."
STATUS_COORD_OWN=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/organizations/ORG-YOUTH" \
  -H "Authorization: Bearer $TOKEN_COORD" \
  -H "Content-Type: application/json" \
  -d '{"description":"Active Syro-Malabar youth movement."}')
if [ "$STATUS_COORD_OWN" -eq 200 ]; then
  echo "PASS: Coordinator can update their assigned organization."
else
  echo "FAIL: Expected HTTP 200, got HTTP $STATUS_COORD_OWN!"
  exit 1
fi

echo "12. Security Boundary: Coordinator attempting to update another organization (ORG-CHOIR)..."
STATUS_COORD_OTHER=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/organizations/ORG-CHOIR" \
  -H "Authorization: Bearer $TOKEN_COORD" \
  -H "Content-Type: application/json" \
  -d '{"description":"Unauthorized attempt to tamper choir."}')
if [ "$STATUS_COORD_OTHER" -eq 403 ]; then
  echo "PASS: Coordinator access to another organization blocked with HTTP 403 Forbidden."
else
  echo "FAIL: Expected HTTP 403, got HTTP $STATUS_COORD_OTHER!"
  exit 1
fi

# 9. Priest & Admin access to Sacramental Records & Audit Logs
echo "13. Logging in as Priest..."
LOGIN_PRIEST=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"priest@church.org","password":"priest123"}')
TOKEN_PRIEST=$(echo "$LOGIN_PRIEST" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "14. Priest accessing Sacramental records..."
STATUS_PRIEST_SACR=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_PRIEST" "$BASE_URL/sacramental-records")
if [ "$STATUS_PRIEST_SACR" -eq 200 ]; then
  echo "PASS: Priest granted access to sacramental records."
else
  echo "FAIL: Expected HTTP 200, got HTTP $STATUS_PRIEST_SACR!"
  exit 1
fi

echo ""
echo "=========================================================="
echo "ALL SECURITY, RBAC & PRIVACY BOUNDARY TESTS PASSED 100%!"
echo "=========================================================="
