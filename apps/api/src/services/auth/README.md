# Aadhaar Authentication Service

## uidai-test-fixture

Deterministic demonstration using the official UIDAI-published test identity:

- Test UID: 999999990019
- Name: Shivshankar Choudhury

This is official test data and must be displayed as UIDAI TEST DATA.

## uidai-sandbox

Reserved for the actual UIDAI sandbox exchange.

The application fails closed when sandbox configuration is incomplete. It must never manufacture a successful UIDAI response.

## Authentication vs authorization

A successful Aadhaar authentication creates an internal identity.

It does not assign land ownership or a privileged application role.

UIDAI authentication
        |
        v
     Identity
        |
        v
 Application User
        |
        v
       Role
        |
        v
 Authorized route

Planned roles:
- citizen
- surveyor
- revenue_officer
- administrator
