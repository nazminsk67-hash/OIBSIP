/**
 * Run: node scripts/verify-smtp.js
 * Tests SMTP connection using backend/.env
 */
import 'dotenv/config'
import { verifySMTPConnection } from '../services/emailService.js'

const ok = await verifySMTPConnection()
process.exit(ok ? 0 : 1)
