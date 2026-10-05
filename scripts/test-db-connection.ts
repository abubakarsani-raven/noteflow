import { db } from "../lib/firebase";

async function verifyConnection() {
  console.log("Verifying Firestore connection...");
  const testRef = db.collection("_healthcheck").doc("ping");
  const timestamp = new Date().toISOString();

  await testRef.set({ ping: true, timestamp });
  console.log("Write successful!");

  const snapshot = await testRef.get();
  console.log("Read successful! Data:", snapshot.data());

  await testRef.delete();
  console.log("Cleanup successful! Connection verified.");
}

verifyConnection().catch((err) => {
  console.error("Firestore connection failed:", err);
  process.exit(1);
});
