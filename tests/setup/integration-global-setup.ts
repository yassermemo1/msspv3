import { globalSetup, globalTeardown } from './integration-test-setup';

export async function setup() {
  console.log('🚀 Starting integration test global setup...');
  await globalSetup();
  console.log('✅ Integration test global setup complete!');
}

export async function teardown() {
  console.log('🧹 Starting integration test global teardown...');
  await globalTeardown();
  console.log('✅ Integration test global teardown complete!');
} 