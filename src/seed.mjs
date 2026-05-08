import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import data from './seed.json' with { type: 'json' };
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

for (const property of data) {
  const { id, ...fields } = property;
  await db.collection('properties').doc(id).set(fields);
  console.log(`Uploaded: ${property.name}`);
}

console.log('Done!');
