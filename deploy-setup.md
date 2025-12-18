# Post-Deployment Setup

After deploying to Vercel, run these commands to optimize your database:

## 1. Install dependencies locally (if not done)
```bash
npm install
```

## 2. Set up your local environment
Create `.env.local` with your production database URL:
```env
DATABASE_URL="your-neon-production-database-url"
```

## 3. Run database optimization
```bash
npm run optimize
```

This will create indexes for better performance.

## 4. Test your deployment
Visit your Vercel URL and test:
- User registration
- Login/logout
- Creating confessions
- Comments and reactions
- Admin panel (if you have admin users)

## 5. Create your first admin user
You can manually update a user's role in your database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all environment variables are set
- Verify database connection string

### Runtime Errors
- Check Vercel function logs
- Verify JWT_SECRET is set
- Test database connectivity

### Performance Issues
- Run `npm run optimize` to create database indexes
- Check Neon database region (should be close to Vercel region)