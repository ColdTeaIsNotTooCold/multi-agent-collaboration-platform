export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ccpm',
    // Using PostgreSQL for persistent storage
    type: 'postgresql'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000')
    },
    rateLimit: {
      requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT || '60'),
      requestsPerHour: parseInt(process.env.AI_RATE_LIMIT_HOUR || '1000')
    },
    cost: {
      gpt4: {
        input: 0.03, // $0.03 per 1K tokens
        output: 0.06 // $0.06 per 1K tokens
      }
    }
  }
};