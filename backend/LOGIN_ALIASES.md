# Login aliases

New user accounts receive a role-prefixed login ID such as `owner-jane-doe`,
`manager-jane-doe`, or `staff-jane-doe`. Names are normalized to lowercase
ASCII-style slugs; if an ID is already taken, a numeric suffix is added.

The alias is separate from the contact email and is not an email address or
mailbox. Login accepts either the alias or the account's real contact email.
Existing accounts retain their email and password; their alias is assigned on
their first successful sign-in. No password reset or email-address change is
required.
