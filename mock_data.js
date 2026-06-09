import db from './server/config/database.js';

async function updateMockData() {
  try {
    const [users] = await db.execute('SELECT id FROM users');
    const genders = ['Male', 'Female', 'Female', 'Male', 'Other'];
    for (let u of users) {
      const age = Math.floor(Math.random() * (60 - 18 + 1)) + 18;
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const ts = Math.floor(Math.random() * 5) + 1;
      const mf = Math.floor(Math.random() * 5) + 1;
      const sh = Math.floor(Math.random() * 5) + 1;
      const bi = Math.floor(Math.random() * 5) + 1;
      const ef = Math.floor(Math.random() * 5) + 1;
      const fi = Math.floor(Math.random() * 5) + 1;
      const hp = Math.floor(Math.random() * 5) + 1;
      
      await db.execute(
        'UPDATE users SET age=?, gender=?, tech_spend=?, music_freq=?, sports_hours=?, business_interest=?, edu_freq=?, food_interest=?, health_priority=? WHERE id=?',
        [age, gender, ts, mf, sh, bi, ef, fi, hp, u.id]
      );
    }
    console.log('Successfully updated ' + users.length + ' users with mock ML data.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateMockData();
