const jwt = require('jsonwebtoken');


exports.AuthMiddleware = (req, res, next) => {
   const authHeader = req.header('Authorization'); 
   if (!authHeader) {
     return res.status(401).json({ message: "No Authorization header found" });
   }
   const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};