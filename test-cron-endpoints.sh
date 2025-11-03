#!/bin/bash

# 🔍 MGNREGA Daily Sync Diagnostic Test
# This script tests all cron endpoints to identify the 404 issue

set -e

echo "🔍 MGNREGA Daily Sync Diagnostic Test"
echo "======================================"
echo ""

# Configuration
VERCEL_URL="${VERCEL_URL:-mnrega-mah.vercel.app}"
CRON_SECRET="${CRON_SECRET}"

# Remove https:// or http:// if present
VERCEL_URL=$(echo "$VERCEL_URL" | sed 's|^https\?://||')

if [ -z "$CRON_SECRET" ]; then
  echo "❌ ERROR: CRON_SECRET environment variable not set"
  echo "   Please set it: export CRON_SECRET='your-secret'"
  exit 1
fi

echo "📋 Configuration:"
echo "  • Vercel URL: $VERCEL_URL"
echo "  • Secret: ${CRON_SECRET:0:4}****"
echo ""

# Test 1: Basic routing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Basic Cron API Routing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: GET /api/cron/debug"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "https://$VERCEL_URL/api/cron/debug")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""
echo "Status: $http_status"

if [ "$http_status" = "200" ]; then
  echo "✅ Basic routing works"
else
  echo "❌ Basic routing failed"
  exit 1
fi
echo ""

# Test 2: Health check (with auth)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Daily Sync Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: GET /api/cron/daily-sync-optimized/health"
echo ""

response=$(curl -s \
  -H "Authorization: Bearer $CRON_SECRET" \
  -w "\nHTTP_STATUS:%{http_code}" \
  "https://$VERCEL_URL/api/cron/daily-sync-optimized/health")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""
echo "Status: $http_status"

if [ "$http_status" = "200" ]; then
  echo "✅ Health check endpoint works"
else
  echo "❌ Health check failed"
  echo ""
  echo "📊 Diagnosis:"
  if echo "$body" | grep -q "404"; then
    echo "  • The endpoint doesn't exist in production build"
    echo "  • Possible causes:"
    echo "    1. Vercel hasn't deployed the latest commit yet"
    echo "    2. Build cache issue"
    echo "    3. Route file not included in build"
  elif echo "$body" | grep -q "401\|Unauthorized"; then
    echo "  • Authorization failed"
    echo "  • Check if CRON_SECRET env var is set in Vercel"
  fi
  exit 1
fi
echo ""

# Test 3: Actual sync endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Daily Sync Endpoint (Main)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: GET /api/cron/daily-sync-optimized"
echo "⚠️  This will NOT run the full sync (too long)"
echo "   Just checking if the endpoint is accessible"
echo ""

response=$(curl -s -X HEAD \
  -H "Authorization: Bearer $CRON_SECRET" \
  -w "%{http_code}" \
  "https://$VERCEL_URL/api/cron/daily-sync-optimized")

echo "Status: $response"

if [ "$response" = "200" ] || [ "$response" = "405" ]; then
  echo "✅ Main sync endpoint is accessible"
  if [ "$response" = "405" ]; then
    echo "   (405 is OK - endpoint exists but HEAD not allowed)"
  fi
else
  echo "❌ Main sync endpoint not accessible"
  exit 1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Tests Passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  ✅ Basic API routing works"
echo "  ✅ Daily sync endpoint is accessible"
echo "  ✅ Authentication is configured correctly"
echo ""
echo "🎯 Next Steps:"
echo "  1. Wait for Vercel to deploy the latest commit (2-3 minutes)"
echo "  2. Check Vercel deployment logs for any errors"
echo "  3. Re-run GitHub Actions workflow"
echo ""
echo "📝 To run actual sync:"
echo "   curl -X GET \\"
echo "     -H 'Authorization: Bearer \$CRON_SECRET' \\"
echo "     https://$VERCEL_URL/api/cron/daily-sync-optimized"
echo ""
