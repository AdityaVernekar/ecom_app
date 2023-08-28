const cookieToken = (user, res) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  return res.status(201).cookie("token", token, options).json({
    status: "success",
    token,
    user,
  });
};

module.exports = cookieToken;
