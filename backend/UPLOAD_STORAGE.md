# Upload storage

The backend serves restaurant QR codes and menu photos from `/uploads` and stores
new files under the directory configured by `UPLOADS_DIR`. If it is unset, the
backend uses `<backend working directory>/uploads`.

For production, set `UPLOADS_DIR` to an absolute path on a durable volume mounted
into the backend container or host. The `menu` and `payment-qr` subdirectories
are created automatically. Keep the same volume mounted across restarts and
deployments; ephemeral container filesystems are not persistent.

To retain existing uploads when switching directories, stop the backend, copy
the current `backend/uploads` contents into the new directory (preserving the
`menu` and `payment-qr` subdirectories), set `UPLOADS_DIR`, then restart. Image
URLs stored in MongoDB remain `/uploads/...` and do not need to be rewritten.
