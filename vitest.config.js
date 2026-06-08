import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js'],
  },
  resolve: {
    alias: {
      // Force prototype server's nested deps to resolve to one canonical copy
      // so vi.mock("nodemailer") and vi.mock("@supabase/supabase-js") intercept
      // them correctly regardless of which node_modules they were installed in.
      'nodemailer': path.resolve('./node_modules/nodemailer'),
      '@supabase/supabase-js': path.resolve('./node_modules/@supabase/supabase-js'),
    },
  },
});
