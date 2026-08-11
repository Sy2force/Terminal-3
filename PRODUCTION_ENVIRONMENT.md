# Terminal 3 Production Environment Configuration

## Required Environment Variables

### Supabase Configuration (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

**IMPORTANT**: 
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. NEVER expose to client.
- Use service role key only for admin operations that bypass RLS (audit logging, scheduled tasks).
- Never commit these keys to version control.

### Site Configuration (REQUIRED)
```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**IMPORTANT**: 
- Must be the production domain for correct OpenGraph, canonical URLs, and sitemap.
- Used in sitemap generation and metadata.

### Demo Mode (CRITICAL)
```
NEXT_PUBLIC_DEMO_MODE=false
```

**IMPORTANT**: 
- MUST be `false` in production.
- If `true`, the app will use mock data instead of real Supabase data.
- This is ONLY for local development without a live database.

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in production
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` verified
- [ ] Supabase migrations applied (0001-0008)
- [ ] Storage buckets created (product-images, content-images, brand-assets)
- [ ] RLS policies enabled
- [ ] Admin roles configured (at least one OWNER)
- [ ] Store settings configured (phone, address, hours, logo)
- [ ] Delivery fee set (1000 agorot = 10 ILS)
- [ ] Real product data imported
- [ ] Real photography uploaded and mapped
- [ ] Categories configured with cover images
- [ ] Homepage sections configured

### Post-Deployment
- [ ] Verify homepage loads correctly
- [ ] Verify product catalog displays
- [ ] Test checkout flow (pickup)
- [ ] Test checkout flow (delivery)
- [ ] Test age verification for alcohol
- [ ] Test admin login
- [ ] Test admin product creation
- [ ] Test admin order management
- [ ] Verify sitemap accessible at `/sitemap.xml`
- [ ] Verify robots.txt accessible at `/robots.txt`
- [ ] Verify audit logs are being written

---

## Database Backup Procedure

### Recommended Backup Strategy

**Daily Automated Backups** (Supabase provides this by default):
- Enable daily backups in Supabase dashboard
- Retain backups for 30 days
- Enable point-in-time recovery (PITR) if available

**Manual Pre-Change Backups**:
Before any schema changes or bulk data operations:
1. Create manual backup in Supabase dashboard
2. Export data using pg_dump if needed
3. Document the backup timestamp

### Backup Verification

After any backup:
- [ ] Verify backup completed successfully
- [ ] Test restore on staging environment
- [ ] Document backup location and timestamp

### Recovery Procedure

In case of data loss or corruption:
1. Identify the last known good backup
2. Create a backup of current corrupted state (for forensic analysis)
3. Restore from the good backup
4. Verify data integrity
5. Test critical flows (checkout, orders)
6. Document the incident

---

## Observability and Monitoring

### Error Tracking

**Server Errors**:
- Monitor Supabase logs for database errors
- Check Vercel/Next.js logs for application errors
- Set up alerts for 5xx errors

**Client Errors**:
- Monitor browser console errors in production
- Track failed API calls
- Monitor checkout completion rate

### Key Metrics to Monitor

**Business Metrics**:
- Order completion rate
- Checkout abandonment rate
- Age verification success rate
- Membership signups

**Technical Metrics**:
- API response times
- Database query performance
- Image load times
- Cache hit rates

### Log Retention

- Application logs: 7 days
- Audit logs: 90 days (regulatory requirement)
- Error logs: 30 days

---

## Security Checklist

### Secrets Management
- [ ] No secrets in code
- [ ] No secrets in git history
- [ ] Service role key never exposed to client
- [ ] Environment variables encrypted at rest
- [ ] Regular rotation of service role key

### Access Control
- [ ] Admin accounts use strong passwords
- [ ] MFA enabled for admin accounts (if available)
- [ ] Regular review of admin roles
- [ ] Revoked access for former staff

### API Security
- [ ] RLS policies enabled on all tables
- [ ] Anonymous access limited to public data
- [ ] Admin routes protected by auth
- [ ] Courier routes protected by auth
- [ ] Age verification requires staff/courier role

---

## Performance Optimization

### Database
- [ ] Indexes on frequently queried columns
- [ ] Query optimization for slow queries
- [ ] Connection pooling configured

### Images
- [ ] All images optimized (WebP preferred)
- [ ] Next/Image configured with proper sizes
- [ ] Lazy loading enabled for below-fold images
- [ ] CDN configured (Supabase Storage provides this)

### Caching
- [ ] Site settings cached (30s TTL)
- [ ] Product data cached appropriately
- [ ] Static assets cached via CDN

---

## Incident Response

### Severity Levels

**P0 - Critical**:
- Site completely down
- Data loss or corruption
- Security breach
- Payment processing failure

**P1 - High**:
- Checkout not working
- Admin not accessible
- Data inconsistency
- Performance degradation

**P2 - Medium**:
- Non-critical feature broken
- UI issues
- Minor performance issues

### Response Team

- **Owner**: Business decisions, customer communication
- **Technical Lead**: Technical investigation, fixes
- **Staff**: Customer support, order management

### Communication

**For P0 incidents**:
- Notify within 15 minutes
- Provide hourly updates
- Estimated resolution time
- Customer impact assessment

---

## Rollback Procedure

If a deployment causes issues:

1. **Immediate Rollback**:
   - Revert to previous deployment
   - Restore database from pre-deployment backup if needed

2. **Verification**:
   - Test critical flows
   - Verify data integrity
   - Monitor error rates

3. **Post-Mortem**:
   - Document what went wrong
   - Identify root cause
   - Implement preventive measures
   - Update runbooks

---

## Contact Information

**Technical Support**:
- [ ] Primary technical contact
- [ ] Backup technical contact
- [ ] Supabase support contact

**Business Contact**:
- [ ] Owner contact
- [ ] Operations manager contact

**Emergency Contacts**:
- [ ] On-call engineer
- [ ] Database administrator
