endpoint: PATCH /admin/businesses/:id/super-business

Request body:
{
  "isSuperBusiness": true
}

Notes:
- Grant and revoke use the same endpoint; send `false` to revoke.
- Admin authentication required.
- Takes effect on the next request (guard reads the flag from the DB cache and
  the admin toggle invalidates that cache).
