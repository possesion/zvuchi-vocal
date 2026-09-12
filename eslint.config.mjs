import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off'
    }
  },
  // Запрещаем сырые console.* в серверном коде — используйте Winston logger
  // (src/lib/logger.ts). Клиентский код использует Sentry напрямую.
  {
    files: [
      'src/app/api/**/*.{ts,tsx}',
      'src/app/actions/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/auth.ts',
      'src/auth.config.ts',
    ],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'error',
    },
  },
  // Сам логгер и тесты исключены из правила.
  {
    files: ['src/lib/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'data/**',
    'prisma/**',
    'node_modules/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig