import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// Fixed hash of a value nothing will ever match, used to keep bcrypt.compare
// on the "unknown email" path (see verifyPasswordOrDummy) so it costs the
// same as the real comparison — otherwise a login for a nonexistent email
// returns measurably faster than a wrong password for a real one, letting
// an attacker enumerate registered emails by response time.
const DUMMY_HASH = bcrypt.hashSync("dev-only-dummy-value-for-timing-parity", SALT_ROUNDS);

export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function verifyPasswordOrDummy(password, hash) {
  return bcrypt.compare(password, hash || DUMMY_HASH);
}
