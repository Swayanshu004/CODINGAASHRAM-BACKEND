import jwt from "jsonwebtoken";

function authMiddlewareCreator(req, res, next){
    const authHeader = req.header["authorization"];
    try {
        const decoded = jwt.verify(authHeader,process.env.JWT_SECRET_CREATOR);
        if(decoded.creatorId){
            req.creatorId = decoded.creatorId;            
            return next();
        } else {
            return res.status(401).json({mesasage: "no admin found ! !"});
        }
    } catch (error) {
        return res.status(401).json({mesasage: "no admin found ! !"});
    }
}
function authMiddlewareUser(req, res, next){
    const authHeader = req.headers["authorization"];
    try {
        const decodedCreator = jwt.verify(authHeader, process.env.JWT_SECRET_USER);
        if(decodedCreator.userId){
            req.userId = decodedCreator.userId;
            return next();
        } else {
            return res.status(401).json({mesasage: "no user found ! "});
        }
    } catch (error) {
        return res.status(401).json({mesasage: "no user found ! !"});
    }
}

export {
    authMiddlewareCreator,
    authMiddlewareUser
}