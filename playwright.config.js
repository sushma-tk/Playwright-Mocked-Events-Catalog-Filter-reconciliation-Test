// @ts-check
import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './tests',
  //retries : 1,
  timeout : 40 * 1000,
  expect : {timeout : 30 * 1000,},
  reporter: 'html',
  
  use: {
    browserName : 'chromium',
    headless : false,
    screenshot : 'on',
    trace : 'retain-on-failure',
  },

});

