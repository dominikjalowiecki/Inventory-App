const admin = require('firebase-admin');

module.exports = {
  async upsert(req, res) {
    try {
      const { displayName, email, password, role } = req.body;

      if (!displayName || !email || !password || !role) {
        return res.status(400).send({ message: 'Missing fields' });
      }

      if (displayName.length > 80) {
        return res.status(400).send({ message: 'Display name is too long' });
      }

      if (!['admin', 'user'].includes(role)) {
        return res
          .status(400)
          .send({ message: 'Invalid role. Available roles: "user", "admin"' });
      }

      let uid;
      try {
        const user = await admin.auth().createUser({
          displayName,
          email,
          password,
        });
        uid = user.uid;
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          const user = await admin.auth().getUserByEmail(email);
          uid = user.uid;
          await admin.auth().updateUser(uid, { displayName, email, password });
        } else {
          throw new Error(err);
        }
      }

      await admin.auth().setCustomUserClaims(uid, { role });

      return res.status(201).send({ uid });
    } catch (err) {
      return handleError(res, err);
    }
  },
};

function handleError(res, err) {
  return res.status(500).send({ message: `${err.code} - ${err.message}` });
}
