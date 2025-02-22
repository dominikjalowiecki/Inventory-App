const admin = require('firebase-admin');

module.exports = {
  async isAuthenticated(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization)
      return res.status(401).send({ message: 'Unauthorized' });

    if (!authorization.startsWith('Bearer'))
      return res.status(401).send({ message: 'Unauthorized' });

    const split = authorization.split('Bearer ');
    if (split.length !== 2)
      return res.status(401).send({ message: 'Unauthorized' });

    const token = split[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.locals = {
        ...req.locals,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
      };
      return next();
    } catch (err) {
      console.error(`${err.code} -  ${err.message}`);
      return res.status(401).send({ message: 'Unauthorized' });
    }
  },
};
