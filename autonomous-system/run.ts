import { AutonomousManager } from './manager';

console.log("🚀 Starting Autonomous Orchestrator Service...");
const manager = new AutonomousManager();

// Keep process alive to listen for Firestore events
process.stdin.resume();

process.on('SIGINT', () => {
  console.log("Shutting down...");
  process.exit();
});
