const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const authAPIController = {
  //[POST] /api/v1/auth/register
  registerUser: async (req, res) => {
    const { name, email, password } = req.body;

    try {
      if (await User.findOne({ email })) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      //save user to db (isVerified: false)
      const newUser = await User.create({
        email,
        name,
        password,
        isVerified: false,
      });

      //Send email
      await sendVerifyEmail(newUser.email, newUser.name);

      res.status(200).json({
        message:
          "We just sent an verification email. Check your email to verify your account.",
      });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({
        message: "Registration failed",
        error: error.message,
      });
    }
  },

  //[POST] /api/v1/auth/verify-email
  verifyEmail: async (req, res) => {
    const { token } = req.body;

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
      const user = await User.findOne({
        email: decodedToken.email,
      });

      if (!user) return res.status(404).send("User not found");

      user.isVerified = true;
      await user.save();

      res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      res.status(400).send("Invalid or expired token.");
    }
  },
  verifyEmailGet: async (req, res) => {
    const { token } = req.query;

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
      const user = await User.findOne({ email: decodedToken.email });

      if (!user) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/verify-error?reason=user_not_found`
        );
      }

      user.isVerified = true;
      await user.save();

      return res.redirect(`${process.env.CLIENT_URL}/auth/verify-success`);
    } catch (error) {
      console.error("Verify email error:", error);
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/verify-error?reason=invalid_token`
      );
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(401).json({ message: "Wrong email or password" });

      if (!user.isVerified)
        return res.status(403).json({ message: "Email is not verified" });

      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched)
        return res.status(401).json({ message: "Wrong email or password" });

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  },
};

//send verify email function
const sendVerifyEmail = async (email, name) => {
  //create jwt token
  const token = jwt.sign({ email }, process.env.JWT_EMAIL_SECRET, {
    expiresIn: "10m",
  });

  const verifyURL = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

  //send email to verify
  const transportEmail = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"2DAYOUTFIT Clothing Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    html: `<h3>Hi, ${name}</h3>
                <p>Please verify your email by clicking the link below: </p>
                <a href="${verifyURL}" target="_blank">Verify Email</a>
                <p>Your verification expires in 10 minutes.</p>
            `,
  };

  try {
    const info = await transportEmail.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // propagate error to registerUser
  }
};

module.exports = authAPIController;
