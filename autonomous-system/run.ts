import { AutonomousManager } from './manager';

const manager = new AutonomousManager();

console.log("Starting full autonomous cycle...");
manager.runFullLoop().then(() => {
  console.log("System loop completed successfully.");
}).catch(err => {
  console.error("System crash:", err);
});
